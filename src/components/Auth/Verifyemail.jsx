import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AuthCard from "./AuthCard";
import { authApi } from "../../utils/api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const requestStarted = useRef(false);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    async function verifyEmail() {
      try {
        const data = await authApi.verifyEmail(token);
        setStatus("success");
        setMessage(
          data.message || "Email verified successfully. You can now log in."
        );
      } catch (error) {
        setStatus("error");
        setMessage(error.message || "This verification link is invalid or expired.");
      }
    }

    verifyEmail();
  }, [searchParams]);

  if (status === "loading") {
    return (
      <AuthCard
        title="Verifying your email"
        subtitle="Please wait while we confirm your account"
      >
        <p className="auth-info-text">Checking your verification link...</p>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard
        title="Email verified"
        subtitle="Your ApplyFlow account is ready"
      >
        <div className="auth-success-message">
          <p>{message}</p>
          <p>You can now log in and start tracking your applications.</p>
        </div>

        <Link className="auth-submit" to="/login">
          Go to login
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verification unsuccessful"
      subtitle="We could not verify this email address"
    >
      <div className="auth-error-message">
        <p>{message}</p>
        <p>
          The link may be expired, already used, or incomplete. You can return
          to the login page or register again.
        </p>
      </div>

      <div className="auth-verification-actions">
        <Link className="auth-submit" to="/login">
          Go to login
        </Link>
        <Link className="auth-link" to="/register">
          Create another account
        </Link>
      </div>
    </AuthCard>
  );
}

export default VerifyEmail;