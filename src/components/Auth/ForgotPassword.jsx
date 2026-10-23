import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "./AuthCard";
import { authApi } from "../../utils/api";
import { MailIcon } from "./AuthIcons";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await authApi.forgotPassword(email.trim());
      setMessage(
        data.message ||
          "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err) {
      setError(err.message || "Unable to request a password reset.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="No worries. Enter your email and we’ll send you a secure reset link."
    >
      {message ? (
        <div className="auth-success-message">
          <p>{message}</p>
          <p>Check your inbox and spam folder for the reset email.</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">
              Email
            </label>
            <div className="auth-input-wrap auth-input-wrap--icon">
              <MailIcon />
              <input
                className={`auth-input ${error ? "has-error" : ""}`}
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {error && <span className="auth-error-text">{error}</span>}
          </div>

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <p className="auth-footer-text">
        Remember your password? <Link className="auth-link" to="/login">Back to login</Link>
      </p>
    </AuthCard>
  );
}

export default ForgotPassword;
