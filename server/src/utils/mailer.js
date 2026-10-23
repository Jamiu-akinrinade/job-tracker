import nodemailer from "nodemailer";

const requiredEnv = ["GMAIL_USER", "GMAIL_APP_PASSWORD"];

for (const variableName of requiredEnv) {
  if (!process.env[variableName]) {
    throw new Error(`${variableName} is not configured`);
  }
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendVerificationEmail = async ({ recipientEmail, verificationLink }) => {
  await transporter.sendMail({
    from: `ApplyFlow <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: "Verify your ApplyFlow email address",
    text: [
      "Welcome to ApplyFlow.",
      "",
      "Please verify your email address by opening this link:",
      verificationLink,
      "",
      "This link expires in one hour and can only be used once.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
        <h2>Verify your ApplyFlow email address</h2>
        <p>Welcome to ApplyFlow.</p>
        <p>Please click the button below to verify your email address:</p>
        <p>
          <a
            href="${verificationLink}"
            style="display: inline-block; padding: 12px 18px; color: white; background: #2563eb; text-decoration: none; border-radius: 6px;"
          >
            Verify email address
          </a>
        </p>
        <p>This link expires in one hour and can only be used once.</p>
        <p>If you did not create an ApplyFlow account, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async ({
  recipientEmail,
  resetLink,
}) => {
  await transporter.sendMail({
    from: `ApplyFlow <${process.env.GMAIL_USER}>`,
    to: recipientEmail,
    subject: "Reset your ApplyFlow password",
    text: [
      "We received a request to reset your ApplyFlow password.",
      "",
      "Open this link to choose a new password:",
      resetLink,
      "",
      "This link expires in one hour and can only be used once.",
      "",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #202124;">
        <h2>Reset your ApplyFlow password</h2>
        <p>We received a request to reset your ApplyFlow password.</p>
        <p>Please click the button below to choose a new password:</p>
        <p>
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 12px 18px; color: white; background: #2563eb; text-decoration: none; border-radius: 6px;"
          >
            Reset password
          </a>
        </p>
        <p>This link expires in one hour and can only be used once.</p>
        <p>If you did not request a password reset, you can ignore this email.</p>
      </div>
    `,
  });
};
