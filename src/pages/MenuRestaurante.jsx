import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getProductosPorRestaurante,
  getRestauranteById
} from "../services/strapi";

import "../styles/menuRestaurante.css";

function MenuRestaurante() {

  // =========================
  // PARÁMETROS DE LA URL
  // =========================

  const { id } = useParams();

  // =========================
  // ESTADOS
  // =========================

  const [productos, setProductos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================
  // CARGAR DATOS
  // =========================

  useEffect(() => {

    const cargarDatos = async () => {

      try {

        const restauranteData =
          await getRestauranteById(id);

        console.log(
          "RESTAURANTE MENU:",
          restauranteData
        );

        setRestaurante(
          restauranteData
        );

        const productosData =
          await getProductosPorRestaurante(id);

        console.log(
          "PRODUCTOS MENU:",
          productosData
        );

        setProductos(
          productosData || []
        );

      } catch (error) {

        console.error(
          "Error cargando menú:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    cargarDatos();

  }, [id]);

  // =========================
  // PANTALLA DE CARGA
  // =========================

  if (loading) {

    return (

      <h2 className="menu-loading">

        Cargando menú...

      </h2>

    );

  }

  // =========================
  // DATOS DEL RESTAURANTE
  // =========================

  const datos =
    restaurante?.attributes ||
    restaurante ||
    {};

  // =========================
  // VISTA PRINCIPAL
  // =========================

  return (

    <div

      className="menu-container"

      style={{

        "--color-principal":
          datos.colorPrincipal ||
          datos.color_principal ||
          "#E53935",

        "--color-secundario":
          datos.colorSecundario ||
          datos.color_secundario ||
          "#FFFFFF",

        "--color-fondo":
          datos.colorFondo ||
          datos.color_fondo ||
          "#f8f9fb"

      }}

    >

      {/* =========================
          ENCABEZADO
      ========================= */}

      <div className="menu-header">

        <div className="menu-top">

          <Link
            to="/home"
            className="menu-logo"
          >
            DeviAnRo
          </Link>

          <Link
            to="/restaurante"
            className="menu-volver"
          >
            ← Volver a restaurantes
          </Link>

        </div>

        <h1>

          {datos.nombre ||
            "Menú del restaurante"}

        </h1>

        <p>

          Explora todos los productos
          disponibles

        </p>

        <div className="menu-total">

          {productos.length} productos

        </div>

      </div>

      {/* =========================
          LISTADO DE PRODUCTOS
      ========================= */}

      <div className="menu-grid">

        {

          productos.length === 0 ? (

            <h3>

              No hay productos
              disponibles.

            </h3>

          ) : (

            productos.map((producto) => {

              const item =
                producto.attributes ||
                producto;

              // =========================
              // IMAGEN DEL PRODUCTO
              // =========================

              let imagen =
                "https://via.placeholder.com/400";

              const img =
                item.imagen;

              if (
                img?.data?.attributes?.url
              ) {

                imagen =
                  `http://localhost:1337${img.data.attributes.url}`;

              }

              else if (img?.url) {

                imagen =
                  `http://localhost:1337${img.url}`;

              }

              else if (
                Array.isArray(img) &&
                img.length > 0
              ) {

                imagen =
                  `http://localhost:1337${img[0].url}`;

              }

              // =========================
              // PRECIO FORMATEADO
              // =========================

              const precio =
                Number(
                  item.precio || 0
                ).toLocaleString(
                  "es-CO"
                );

              return (

                <div
                  className="menu-card"
                  key={producto.id}
                >

                  {/* IMAGEN */}

                  <img

                    src={imagen}

                    alt={item.nombre}

                    className="menu-img"

                  />

                  {/* INFORMACIÓN */}

                  <div className="menu-info">

                    <h2>

                      {item.nombre}

                    </h2>

                    <p>

                      {item.descripcion}

                    </p>

                    <div className="menu-price">

                      ${precio}

                    </div>

                    {/* BOTÓN VER DETALLE */}

                    <Link

                      to={`/detalle/${producto.id}`}

                      className="menu-btn"

                    >

                      Ver detalles

                    </Link>

                  </div>

                </div>

              );

            })

          )

        }

      </div>

    </div>

  );

}

export default MenuRestaurante;