import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductoById } from "../services/strapi";
import "../styles/detalle.css";

function Detalle() {

  // =========================
  // NAVEGACIÓN Y PARÁMETROS
  // =========================

  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // ESTADOS
  // =========================

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);

  // =========================
  // CARGAR PRODUCTO
  // =========================

  useEffect(() => {

    const cargarProducto = async () => {

      try {

        const item =
          await getProductoById(id);

        if (!item) {

          setProducto(null);
          return;

        }

        const p = item;

        // =========================
        // IMAGEN PARA MOSTRAR
        // =========================

        let imagen =
          "https://via.placeholder.com/400";

        const img = p.imagen;

        if (
          img?.data?.attributes?.url
        ) {

          imagen =
            "http://localhost:1337" +
            img.data.attributes.url;

        } else if (img?.url) {

          imagen =
            "http://localhost:1337" +
            img.url;

        } else if (
          Array.isArray(img) &&
          img.length > 0
        ) {

          imagen =
            "http://localhost:1337" +
            img[0].url;

        }

        // =========================
        // GUARDAR PRODUCTO
        // MANTENER IMAGEN ORIGINAL DE STRAPI
        // =========================

        setProducto({

          ...p,

          imagenUrl: imagen

        });

      } catch (error) {

        console.log(
          "Error:",
          error
        );

        setProducto(null);

      } finally {
        setLoading(false);

      }

    };

    cargarProducto();

  }, [id]);

  // =========================
  // AGREGAR AL CARRITO
  // =========================

  const agregarAlCarrito = () => {

    if (!producto) return;

    let carrito =
      JSON.parse(
        localStorage.getItem("carrito")
      ) || [];

    const existe =
      carrito.find(
        item =>
          item.nombre === producto.nombre
      );

    if (existe) {

      existe.cantidad += cantidad;

    } else {

      carrito.push({
        ...producto,

        cantidad

      });

    }

    localStorage.setItem(
      "carrito",
      JSON.stringify(carrito)

    );

    navigate("/carrito");

  };

  // =========================
  // PANTALLA DE CARGA
  // =========================

  if (loading) {

    return (

      <div className="detalle-loading">

        Cargando producto...

      </div>

    );

  }

  // =========================
  // PRODUCTO NO ENCONTRADO
  // =========================

  if (!producto) {

    return (

      <div className="detalle-loading">

        Producto no encontrado

      </div>

    );

  }

  // =========================
  // VISTA PRINCIPAL
  // =========================

  return (

    <div className="detalle-container">

      <div className="detalle-grid">

        {/* =========================
            IMAGEN DEL PRODUCTO
        ========================= */}

        <img
          className="detalle-img"
          src={producto.imagenUrl}
          alt={producto.nombre}
          onError={(e) => {

            e.target.src =
              "https://via.placeholder.com/500x500?text=Sin+Imagen";

          }}

        />

        {/* =========================
            INFORMACIÓN DEL PRODUCTO
        ========================= */}

        <div className="detalle-info">

          {/* ESTADO DEL PRODUCTO */}

          <div className="detalle-badge">

            Disponible

          </div>

          {/* NOMBRE */}

          <h1>

            {producto.nombre}

          </h1>

          {/* PRECIO */}

          <div className="detalle-price">

            $

            {Number(
              producto.precio || 0
            ).toLocaleString("es-CO")}

          </div>

          {/* DESCRIPCIÓN */}

          <div className="detalle-section">

            <h3>

              Descripción

            </h3>

            <p>

              {producto.descripcion}

            </p>

          </div>

          {/* INGREDIENTES */}

          <div className="detalle-section ingredientes">

            <h3>

              Ingredientes

            </h3>

            <p>

              {producto.ingredientes}

            </p>

          </div>

          {/* =========================
              CONTROL DE CANTIDAD
          ========================= */}

          <div className="cantidad-container">

            <span className="cantidad-label">

              Cantidad

            </span>

            <div className="cantidad-control">

              {/* BOTÓN RESTAR */}

              <button
                type="button"
                className="cantidad-btn"
                onClick={() =>
                  cantidad > 1 &&
                  setCantidad(
                    cantidad - 1
                  )
                }

              >

                −

              </button>

              {/* CANTIDAD */}

              <span className="cantidad-numero">

                {cantidad}

              </span>

              {/* BOTÓN SUMAR */}

              <button
                type="button"
                className="cantidad-btn"
                onClick={() =>
                  setCantidad(
                    cantidad + 1
                  )
                }

              >

                +

              </button>

            </div>

          </div>

          {/* =========================
              BOTONES DE ACCIÓN
          ========================= */}

          <div className="detalle-buttons">

            <button

              className="btn-secondary"

              onClick={() =>
                navigate(-1)
              }

            >

              Volver

            </button>

            <button
              className="btn-primary"
              onClick={
                agregarAlCarrito
              }

            >

              Agregar al carrito

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Detalle;