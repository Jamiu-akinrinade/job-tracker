import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "./AuthCard";
import { authApi } from "../../utils/api";
import { EyeIcon, LockIcon, MailIcon, UserIcon } from "./AuthIcons";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Use at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      const data = await authApi.register({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setRegistrationSuccess({
        message:
          data.message ||
          "Account created. Please check your email to verify your account.",
        email: data.user?.email || formData.email.trim(),
      });

      setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      setServerError(err.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registrationSuccess) {
    return (
      <AuthCard
        title="Check your email"
        subtitle="Your account has been created"
      >
        <div className="auth-success-message">
          <p>{registrationSuccess.message}</p>
          <p>
            We created the account for{" "}
            <strong>{registrationSuccess.email}</strong>.
          </p>
          <p>
            During local testing, the verification link will be printed in the
            backend terminal.
          </p>
        </div>

        <Link className="auth-submit" to="/login">
          Go to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start tracking every application in one place"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="name">
            Full name
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <UserIcon />
            <input
              className={`auth-input ${errors.name ? "has-error" : ""}`}
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>
          {errors.name && (
            <span className="auth-error-text">{errors.name}</span>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <MailIcon />
            <input
              className={`auth-input ${errors.email ? "has-error" : ""}`}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="johndoe@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <span className="auth-error-text">{errors.email}</span>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <LockIcon />
            <input
              className={`auth-input ${errors.password ? "has-error" : ""}`}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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
            Confirm password
          </label>
          <div className="auth-input-wrap auth-input-wrap--icon">
            <LockIcon />
            <input
              className={`auth-input ${errors.confirmPassword ? "has-error" : ""}`}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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

        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-footer-text">
        Already have an account?{" "}
        <Link className="auth-link" to="/login">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

export default Register;
