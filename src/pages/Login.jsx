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
            <SignIn
              routing="hash"
              signUpUrl="/registro"
              afterSignInUrl="/home"
            />
          </div>
        </div>

      </div>

    </div>
  );
}

export default Login;
