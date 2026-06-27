import { SignIn } from "@clerk/clerk-react";
import "../styles/login.css";

function Login() {
  return (
    <div className="Login-page">

      <div className="Login-container">

        {/* IZQUIERDA */}
        <div className="Login-left">

          <h1 className="Login-title">
            DeviAnRo
          </h1>

          <p className="Login-description">
            Pide tus comidas favoritas desde cualquier lugar de forma rápida y sencilla.
          </p>

        </div>

        {/* DERECHA */}
        <div className="Login-right">

          <div className="Login-box">

            <h2 className="Login-heading">
              Iniciar Sesión
            </h2>

            <SignIn
              routing="path"
              path="/"
              signUpUrl="/registro"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;