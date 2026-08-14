import { SignIn, SignedIn } from "@clerk/clerk-react";
import { Navigate, Link } from "react-router-dom";
import "../styles/login.css";

function Login() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "16px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Link
          to="/home"
          style={{
            textDecoration: "none",
            fontSize: "34px",
            fontWeight: 900,
            letterSpacing: "2px",
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            whiteSpace: "nowrap",
          }}
        >
          DeviAnRo
        </Link>
        <Link
          to="/home"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 18px",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "14px",
            cursor: "pointer",
            textDecoration: "none",
            background: "white",
            color: "var(--color-primary)",
            border: "2px solid var(--color-primary)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            transition:
              "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
          }}
        >
          <span aria-hidden style={{ lineHeight: 1 }}>
            ←
          </span>
          <span>Volver al inicio</span>
        </Link>
      </div>

      <SignedIn>
        <Navigate to="/home" replace />
      </SignedIn>

      <div className="Login-page" style={{ flex: 1 }}>
        <div className="Login-container">
          <div className="Login-left">
            <h1 className="Login-title">DeviAnRo</h1>
            <p className="Login-description">
              Pide tus comidas favoritas desde cualquier lugar de forma rápida y
              sencilla.
            </p>
          </div>

          <div className="Login-right">
            <div className="Login-box">
              <SignIn
                routing="hash"
                signUpUrl="/registro"
                afterSignInUrl="/home"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
