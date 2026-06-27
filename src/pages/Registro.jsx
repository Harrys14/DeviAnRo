import { useNavigate, Link } from "react-router-dom";
import "../styles/registro.css";

function Registro() {
  const navigate = useNavigate();

  const handleRegistro = (e) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="registro-container">

      {/* IZQUIERDA */}
      <div className="registro-left">
        <h1>DeviAnRo</h1>
        <p>Crea tu cuenta para empezar a pedir comida deliciosa</p>

        <form onSubmit={handleRegistro} className="registro-form">
          <input type="text" placeholder="Nombre" required />
          <input type="email" placeholder="Correo" required />
          <input type="password" placeholder="Contraseña" required />
          <input type="password" placeholder="Confirmar contraseña" required />

          <button type="submit">Registrarse</button>
        </form>

        <p className="registro-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      {/* DERECHA */}
      <div className="registro-right">
        <h2>Bienvenido a DeviAnRo</h2>
        <p>Pide desde cualquier lugar en segundos 🚀</p>
      </div>

    </div>
  );
}

export default Registro;