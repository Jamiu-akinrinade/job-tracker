import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/mailer.js";
import { pool } from "../db/pool.js";

const router = express.Router();

// FRONTEND_URL must be defined in server/.env for local-network or deployed links.
// Removing a trailing slash prevents links such as //verify-email.
const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/$/, "");

const hashVerificationToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const hashPasswordResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, fullName = "" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    const result = await pool.query(
      `INSERT INTO users (
         email,
         password_hash,
         full_name,
         is_verified,
         verification_token_hash,
         verification_token_expires_at
       )
       VALUES ($1, $2, $3, FALSE, $4, $5)
       RETURNING id, email, full_name, is_verified, created_at`,
      [
        normalizedEmail,
        passwordHash,
        normalizedFullName,
        verificationTokenHash,
        verificationTokenExpiresAt,
      ]
    );

    const verificationLink =
      `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      recipientEmail: normalizedEmail,
      verificationLink,
    });

    return res.status(201).json({
      message:
        "User registered successfully. Check your email to verify your account.",
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/verify-email?token=<verification-token>
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const verificationTokenHash = hashVerificationToken(token);

    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE verification_token_hash = $1
         AND verification_token_expires_at > NOW()
         AND is_verified = FALSE`,
      [verificationTokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired verification link.",
      });
    }

    await pool.query(
      `UPDATE users
       SET is_verified = TRUE,
           verification_token_hash = NULL,
           verification_token_expires_at = NULL
       WHERE id = $1`,
      [result.rows[0].id]
    );

    return res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;
    const genericResponse = {
      message:
        "If an unverified account exists for this email, a new verification link has been sent.",
    };

    if (!email || typeof email !== "string") {
      return res.status(200).json(genericResponse);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, is_verified
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0 || result.rows[0].is_verified) {
      return res.status(200).json(genericResponse);
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashVerificationToken(verificationToken);
    const verificationTokenExpiresAt = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await pool.query(
      `UPDATE users
       SET verification_token_hash = $1,
           verification_token_expires_at = $2
       WHERE id = $3`,
      [
        verificationTokenHash,
        verificationTokenExpiresAt,
        result.rows[0].id,
      ]
    );

    const verificationLink =
      `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await sendVerificationEmail({
      recipientEmail: normalizedEmail,
      verificationLink,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
  try {
    const genericResponse = {
      message:
        "If an account exists for this email, a password reset link has been sent.",
    };
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(200).json(genericResponse);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashPasswordResetToken(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `UPDATE users
       SET password_reset_token_hash = $1,
           password_reset_token_expires_at = $2
       WHERE id = $3`,
      [resetTokenHash, resetTokenExpiresAt, result.rows[0].id]
    );

    const resetLink =
      `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      recipientEmail: normalizedEmail,
      resetLink,
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== "string" || !newPassword) {
      return res.status(400).json({
        error: "Reset token and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters long.",
      });
    }

    const resetTokenHash = hashPasswordResetToken(token);
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_token_expires_at = NULL
       WHERE password_reset_token_hash = $2
         AND password_reset_token_expires_at > NOW()
       RETURNING id`,
      [newPasswordHash, resetTokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid or expired password reset link.",
      });
    }

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      `SELECT id, email, full_name, password_hash, is_verified
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
