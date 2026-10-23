import "./auth.css";

function AuthCard({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-hero" aria-hidden="true">
          <div className="auth-mark">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              role="presentation"
              aria-hidden="true"
            >
              <rect
                x="7"
                y="14"
                width="34"
                height="26"
                rx="5"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.25"
              />
              <path
                d="M17 14v-2.5A3.5 3.5 0 0 1 20.5 8h7a3.5 3.5 0 0 1 3.5 3.5V14"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.25"
                strokeLinecap="round"
              />
              <path
                d="M8 23h32M21 23v3h6v-3"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1 className="auth-title" id="auth-title">
          {title}
        </h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

export default AuthCard;
