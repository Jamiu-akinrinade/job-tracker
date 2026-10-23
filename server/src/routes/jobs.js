// routes/jobs.js
// The whole CRUD API for jobs, built with authentication in mind from day one.
//
// WHY user_id from day one, even before login exists?
// Because changing a table later ("oh wait, every job needs a user_id") means
// rewriting every query you already wrote. Adding the column now costs 2
// minutes; retrofitting later costs hours. Until Step 4 adds real login,
// every request carries the seed user's id (USER_ID env var) — one line of
// middleware, and when JWT auth arrives we swap that one line and NOTHING
// else changes. That's the real power of designing with auth in mind.
import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/authMiddleware.js";


const router = Router();

// Allowed kanban statuses — mirrors the CHECK constraint in the database.
// Keeping it in code means invalid statuses fail fast with a clear message
// instead of a cryptic database error.
const VALID_STATUSES = [
  "wishlist",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "accepted",
];

// ---------- Tiny "current user" middleware ----------
// This is the placeholder for Step 5's real JWT middleware. It puts the
// authenticated user's id on req.userId. Today it reads USER_ID from .env;
// Step 5 replaces the body of this function with JWT verification and the
// rest of this file stays untouched.
router.use(requireAuth);


// ---------- GET /api/jobs ----------
// Returns only THIS user's jobs, newest first.
// Parameterized query ($1) — NEVER build SQL by concatenating strings.
// Concatenation is how SQL injection attacks happen: an attacker sends
// title = "'; DROP TABLE jobs; --" and your app happily executes it.
// Parameters keep data and code separate — PostgreSQL can never confuse them.
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, company, status, location, salary, url,
              notes, created_at, updated_at
         FROM jobs
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json({ jobs: rows });
  } catch (err) {
    next(err);
  }
});

// ---------- GET /api/jobs/:id ----------
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, title, company, status, location, salary, url,
              notes, created_at, updated_at
         FROM jobs
        WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (rows.length === 0) {
      // 404 = "not found". Distinct from 403 ("exists but not yours"),
      // though we deliberately return 404 for both — never confirm to a
      // stranger that a resource exists.
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ job: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- POST /api/jobs ----------
// Creates a job. Only title + company are required; everything else has a
// default in the database, so minimal payloads still succeed.
router.post("/", async (req, res, next) => {
  try {
    const { title, company, status = "applied", location, salary, url, notes } =
      req.body;

    if (!title || !company) {
      // 400 = "your request is bad". Client error, not server error.
      return res
        .status(400)
        .json({ error: "title and company are required" });
    }
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO jobs (user_id, title, company, status, location, salary, url, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, title, company, status, location, salary, url,
                 notes, created_at, updated_at`,
      [req.userId, title, company, status, location ?? "", salary ?? "", url ?? "", notes ?? ""]
    );
    // 201 = "Created" — the correct status code for a successful POST.
    res.status(201).json({ job: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- PATCH /api/jobs/:id ----------
// Partial update — the kanban board drags a card and only sends
// { status: "interviewing" }. Send ONLY the fields you want to change.
router.patch("/:id", async (req, res, next) => {
  try {
    const { title, company, status, location, salary, url, notes } = req.body;
    const fields = { title, company, status, location, salary, url, notes };
    const updates = [];
    const values = [];

    let idx = 1;
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        if (key === "status" && !VALID_STATUSES.includes(value)) {
          return res.status(400).json({
            error: `status must be one of: ${VALID_STATUSES.join(", ")}`,
          });
        }
        updates.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "no fields to update" });
    }

    // $1..$N are the field values; the LAST two parameters are always
    // the job id and the user id (user_id check = authorization).
    values.push(req.params.id, req.userId);
    const { rows } = await pool.query(
      `UPDATE jobs
          SET ${updates.join(", ")}, updated_at = now()
        WHERE id = $${idx} AND user_id = $${idx + 1}
        RETURNING id, user_id, title, company, status, location, salary, url,
                  notes, created_at, updated_at`,
      values
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ job: rows[0] });
  } catch (err) {
    next(err);
  }
});

// ---------- DELETE /api/jobs/:id ----------
router.delete("/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM jobs WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }
    // 204 = "success, no body to return". Standard for DELETE.
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
