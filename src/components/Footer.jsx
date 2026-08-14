import { Link } from "react-router-dom";

const year = new Date().getFullYear();

function Footer() {
  return (
    <footer
      style={{
        background: "var(--color-primary)",
        color: "white",
        marginTop: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "40px 30px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "30px",
        }}
      >
        {/* Marca */}
        <div>
          <h3
            style={{
              fontSize: "28px",
              fontWeight: 900,
              marginBottom: "12px",
              letterSpacing: "2px",
            }}
          >
            DeviAnRo
          </h3>
          <p style={{ lineHeight: 1.6, opacity: 0.95, fontSize: "14px" }}>
            Pide tus comidas favoritas desde cualquier lugar de forma rápida y sencilla.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h4 style={{ marginBottom: "14px", fontSize: "16px" }}>Navegación</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            <li><Link to="/home" style={{ color: "white", textDecoration: "none", fontSize: "14px", opacity: 0.9 }}>🏠 Inicio</Link></li>
            <li><Link to="/restaurante" style={{ color: "white", textDecoration: "none", fontSize: "14px", opacity: 0.9 }}>🍔 Restaurantes</Link></li>
            <li><Link to="/carrito" style={{ color: "white", textDecoration: "none", fontSize: "14px", opacity: 0.9 }}>🛒 Carrito</Link></li>
            <li><Link to="/cuenta" style={{ color: "white", textDecoration: "none", fontSize: "14px", opacity: 0.9 }}>👤 Mi cuenta</Link></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h4 style={{ marginBottom: "14px", fontSize: "16px" }}>Contacto</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", opacity: 0.95 }}>
            <li>📍 Bogotá, Colombia</li>
            <li>📞 +57 601 000 0000</li>
            <li>✉️ contacto@devianro.com</li>
          </ul>
        </div>

        {/* Horario */}
        <div>
          <h4 style={{ marginBottom: "14px", fontSize: "16px" }}>Horario</h4>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", opacity: 0.95 }}>
            <li>🕐 Lunes – Viernes: 8am – 10pm</li>
            <li>🕐 Sábados: 9am – 11pm</li>
            <li>🕐 Domingos: 10am – 9pm</li>
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.15)",
          padding: "16px 30px",
          textAlign: "center",
          fontSize: "13px",
          opacity: 0.9,
        }}
      >
        © {year} DeviAnRo. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export default Footer;
