import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRestaurantes } from "../services/strapi";
import "../styles/restaurante.css";

function Restaurante() {

  // =========================
  // ESTADOS
  // =========================

  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // CARGAR RESTAURANTES
  // =========================

  useEffect(() => {
    const cargarRestaurantes = async () => {
      try {
        const data = await getRestaurantes();

        console.log("DATA RESTAURANTES:", data);

        setRestaurantes(data || []);
      } catch (error) {
        console.error(
          "Error cargando restaurantes:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    cargarRestaurantes();
  }, []);

  // =========================
  // ESTADO DE CARGA
  // =========================

  if (loading) {
    return <h2>Cargando restaurantes...</h2>;
  }

  // =========================
  // SIN RESTAURANTES
  // =========================

  if (!restaurantes.length) {
    return (
      <div className="restaurante-container">
        <h2>No hay restaurantes disponibles.</h2>
      </div>
    );
  }

  // =========================
  // VISTA PRINCIPAL
  // =========================

  return (
    <div className="restaurante-container">

      {/* =========================
          ENCABEZADO
      ========================= */}

      <header className="restaurante-header">

        <div className="header-top">

          <div className="marca-app">
            DeviAnRo
          </div>

          <Link
            to="/home"
            className="restaurante-volver"
          >
            ← Volver
          </Link>

        </div>

        <h1>
          Descubre restaurantes increíbles 🍔
        </h1>

        <p>
          Encuentra tu comida favorita,
          explora nuevos sabores y disfruta
          de los mejores restaurantes de la ciudad.
        </p>

      </header>

      {/* =========================
          GRID DE RESTAURANTES
      ========================= */}

      <div className="restaurante-grid">

        {restaurantes.map((restaurante) => {

          // Imagen por defecto
          let imagen =
            "https://via.placeholder.com/400";

          // Imagen desde Strapi
          if (restaurante.imagen?.url) {
            imagen = `http://localhost:1337${restaurante.imagen.url}`;
          }

          return (

            <div
              key={restaurante.id}
              className="restaurante-card"
            >

              {/* IMAGEN */}
              <div className="restaurante-img-container">

                <img
                  src={imagen}
                  alt={restaurante.nombre}
                  className="restaurante-img"
                />

                <div className="restaurante-overlay">
                  ⭐ {restaurante.calificacion || "N/A"}
                </div>

              </div>

              {/* INFORMACIÓN */}
              <div className="restaurante-info">

                {/* NOMBRE */}
                <h2>{restaurante.nombre}</h2>

                {/* CIUDAD */}
                <div className="restaurante-meta">
                  🏙️ {restaurante.ciudad || "Sin ciudad"}
                </div>

                {/* CATEGORÍA */}
                {restaurante.categoria &&
                  restaurante.categoria !== "General" && (
                    <div className="restaurante-badge">
                      🍴 {restaurante.categoria}
                    </div>
                  )}

                {/* DESCRIPCIÓN */}
                <p>
                  {restaurante.descripcion}
                </p>

                {/* DIRECCIÓN */}
                <div className="restaurante-contacto">
                  <p>
                    📍 {restaurante.direccion}
                  </p>
                </div>

                {/* BOTÓN */}
                <Link
                  to={`/restaurante/${restaurante.id}`}
                  className="restaurante-btn"
                >
                  Ver menú 🍔
                </Link>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Restaurante;