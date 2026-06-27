import "../styles/cuenta.css";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

function Cuenta() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="cuenta-container">

      {/* HEADER */}
      <header className="cuenta-header">
        <div className="cuenta-logo">DeviAnRo</div>

        <div className="cuenta-header-right">
          <div className="cuenta-location">Bogotá</div>

          {/* Botón Home en vez de los 3 puntos */}
          <Link to="/home" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 16px",
              background: "#E53935",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold"
            }}>
              🏠 Home
            </button>
          </Link>
        </div>
      </header>

      {/* PERFIL */}
      <div className="cuenta-profile">
        <img 
          src={user?.imageUrl || "https://via.placeholder.com/150"} 
          alt="Perfil" 
          className="cuenta-avatar"
          style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
        />

        <h1>{user?.fullName || user?.firstName || "Usuario"}</h1>
        <p className="cuenta-email">{user?.primaryEmailAddress?.emailAddress || "sin email"}</p>
      </div>

      {/* OPCIONES */}
      <div className="cuenta-grid">
        <div className="cuenta-item" onClick={() => alert("En desarrollo")}>
          📍 Mis direcciones
        </div>
        <div className="cuenta-item" onClick={() => alert("En desarrollo")}>
          📜 Mis pedidos
        </div>
        <div className="cuenta-item" onClick={() => alert("En desarrollo")}>
          ❤️ Favoritos
        </div>
        <div className="cuenta-item" onClick={() => alert("En desarrollo")}>
          ⚙️ Configuración
        </div>

        <div
          className="cuenta-item logout"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          🚪 Cerrar sesión
        </div>
      </div>

    </div>
  );
}

export default Cuenta;