import { SignUp } from "@clerk/clerk-react";
import "../styles/registro.css";

function Registro() {
  return (
    <div className="registro-container">

      {/* IZQUIERDA — formulario */}
      <div className="registro-left">
        <div className="clerk-signup-container">
          <SignUp
            routing="path"
            path="/registro"
            afterSignUpUrl="/home"
            appearance={{
              options: { elevation: "flush" },
              elements: {
                formButtonPrimary: {
                  backgroundColor: "#E53935",
                  fontSize: "14px",
                },
                footerActionLink: { color: "#E53935" },
              },
            }}
          />
        </div>
      </div>

      {/* DERECHA — marca */}
      <div className="registro-right">
        <h1 className="registro-title">DeviAnRo</h1>
        <p className="registro-description">
          Pide tus comidas favoritas desde cualquier lugar de forma rápida y sencilla.
        </p>
      </div>

    </div>
  );
}

export default Registro;
