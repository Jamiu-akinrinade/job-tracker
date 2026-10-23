import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "./AuthCard";
import { authApi } from "../../utils/api";
import { EyeIcon, LockIcon } from "./AuthIcons";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function validate() {
    const newErrors = {};

    if (!token) {
      newErrors.token = "This password-reset link is missing its token.";
    }

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const data = await authApi.resetPassword({
        token,
        newPassword: password,
      });

      setSuccessMessage(
        data.message || "Password reset successfully. You can now log in.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setServerError(err.message || "Unable to reset your password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successMessage) {
    return (
      <AuthCard
        title="Password reset"
        subtitle="Your password has been updated"
      >
        <div className="auth-success-message">
          <p>{successMessage}</p>
          <p>You can now log in with your new password.</p>
        </div>

        <button
          className="auth-submit"
          type="button"
          onClick={() => navigate("/login")}
        >
          Go to login
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Create a new password for your ApplyFlow account"
    >
      {errors.token && <span className="auth-error-text">{errors.token}</span>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            New password
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <LockIcon />
            <input
              className={`auth-input ${errors.password ? "has-error" : ""}`}
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls="password"
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <EyeIcon hidden={!showPassword} />
              <span className="auth-visually-hidden">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
          {errors.password && (
            <span className="auth-error-text">{errors.password}</span>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <LockIcon />
            <input
              className={`auth-input ${errors.confirmPassword ? "has-error" : ""}`}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showConfirmPassword}
              aria-controls="confirmPassword"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
            >
              <EyeIcon hidden={!showConfirmPassword} />
              <span className="auth-visually-hidden">
                {showConfirmPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="auth-error-text">{errors.confirmPassword}</span>
          )}
        </div>

        {serverError && <span className="auth-error-text">{serverError}</span>}

        <button
          className="auth-submit"
          type="submit"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Updating password..." : "Reset password"}
        </button>
      </form>

      <p className="auth-footer-text">
        Remember your password?{" "}
        <Link className="auth-link" to="/login">
          Return to login
        </Link>
      </p>
    </AuthCard>
  );
}

export default ResetPassword;
