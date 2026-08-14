import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

function Header({ showLocation = true, showBack = false, onBack, locationLabel = "Bogotá" }) {
  const { totalItems } = useCart();
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const pillBase = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
    textDecoration: "none",
    border: "none",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  const backBtn = {
    ...pillBase,
    background: "var(--color-surface)",
    color: "var(--color-primary)",
    border: "2px solid var(--color-primary)",
    boxShadow: "var(--shadow-sm)",
  };

  const iconBtnBase = {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "var(--color-surface)",
    boxShadow: "var(--shadow-sm)",
    border: "1px solid var(--color-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
    textDecoration: "none",
  };

  return (
    <header
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flex: "0 1 auto",
          minWidth: 0,
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
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          justifyContent: "flex-end",
        }}
      >
        {showBack && (
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
            style={backBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            }}
          >
            <span aria-hidden style={{ lineHeight: 1 }}>
              ←
            </span>
            <span>Volver</span>
          </button>
        )}

        {showLocation && (
          <div
            style={{
              ...pillBase,
              background: "var(--color-primary)",
              color: "white",
              boxShadow: "var(--shadow-sm)",
              cursor: "default",
            }}
          >
            <span aria-hidden>📍</span>
            <span>{locationLabel}</span>
          </div>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
          style={iconBtnBase}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px) rotate(15deg)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0) rotate(0deg)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <Link
          to="/carrito"
          aria-label={`Carrito con ${totalItems} productos`}
          style={{
            ...iconBtnBase,
            position: "relative",
            fontSize: "22px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
            e.currentTarget.style.borderColor = "var(--color-border)";
          }}
        >
          🛒
          {totalItems > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                background: "var(--color-primary)",
                color: "white",
                fontSize: "12px",
                fontWeight: 800,
                minWidth: "24px",
                height: "24px",
                borderRadius: "999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 6px",
                border: `2px solid var(--color-surface)`,
                boxShadow: "0 2px 6px rgba(229,57,53,0.35)",
              }}
            >
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Link>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                ...pillBase,
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
                color: "white",
                boxShadow: "var(--shadow-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 18px rgba(229,57,53,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-primary)";
              }}
            >
              <span aria-hidden>🔐</span>
              <span>Iniciar sesión</span>
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <button
            type="button"
            onClick={() => navigate("/cuenta")}
            aria-label="Ir a mi cuenta"
            title="Mi cuenta"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              borderRadius: "50%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              display: "inline-flex",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(229,57,53,0.18), 0 6px 16px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <img
              src={user?.imageUrl || "https://via.placeholder.com/50"}
              alt={user?.fullName || "Usuario"}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2.5px solid var(--color-primary)",
                objectFit: "cover",
                display: "block",
                background: "var(--color-surface)",
              }}
            />
          </button>
        </SignedIn>
      </div>
    </header>
  );
}

export default Header;
