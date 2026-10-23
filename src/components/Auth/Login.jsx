import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "./AuthCard";
import { authApi } from "../../utils/api";
import { EyeIcon } from "./AuthIcons";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.justRegistered;
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setShowResend(false);
      setResendMessage("");
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setResendMessage("");
    setShowResend(false);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const data = await authApi.login(formData);
      localStorage.setItem("auth", JSON.stringify(data));
      onLogin(data);
      navigate("/");
    } catch (err) {
      setServerError(err.message || "Login failed. Check your details.");

      if (err.status === 403) {
        setShowResend(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendVerification() {
    setServerError("");
    setResendMessage("");

    if (!formData.email.trim()) {
      setServerError("Enter your email address before requesting a new link.");
      return;
    }

    setIsResending(true);

    try {
      const data = await authApi.resendVerification(formData.email.trim());
      setResendMessage(data.message);
    } catch (err) {
      setServerError(
        err.message || "Unable to resend the verification email. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to keep tracking your applications"
    >
      {justRegistered && (
        <p className="auth-success-text">
          Account created — log in to continue.
        </p>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            className={`auth-input ${errors.email ? "has-error" : ""}`}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          {errors.email && (
            <span className="auth-error-text">{errors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <div className="auth-row-between">
            <label className="auth-label" htmlFor="password">
              Password
            </label>
            <Link className="auth-link" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="auth-input-wrap">
            <input
              className={`auth-input ${errors.password ? "has-error" : ""}`}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              className="auth-password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
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

        {serverError && <span className="auth-error-text">{serverError}</span>}

        {showResend && (
          <div className="auth-resend-section">
            <p className="auth-help-text">
              Please verify your email before logging in. Check your inbox and spam
              folder. Your verification link is valid for one hour.
            </p>
            <p className="auth-help-text">Didn’t receive the email?</p>
            <button
              className="auth-link"
              type="button"
              onClick={handleResendVerification}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </button>
            {resendMessage && (
              <p className="auth-success-text">{resendMessage}</p>
            )}
          </div>
        )}

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="auth-footer-text">
        Don't have an account?{" "}
        <Link className="auth-link" to="/register">
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}

export default Login;
