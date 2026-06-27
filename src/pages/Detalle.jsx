import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/detalle.css";
import { getProductoById } from "../services/strapi";

function Detalle() {
  const { id } = useParams();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const item = await getProductoById(id);

        if (!item) {
          setProducto(null);
          return;
        }

        // 🔥 FIX CLAVE: NO attributes aquí
        const p = item;

        let imagen = "https://via.placeholder.com/400";

        const img = p.imagen;

        if (img?.data?.attributes?.url) {
          imagen = "http://localhost:1337" + img.data.attributes.url;
        } else if (img?.url) {
          imagen = "http://localhost:1337" + img.url;
        } else if (Array.isArray(img) && img.length > 0) {
          imagen = "http://localhost:1337" + img[0].url;
        }

        setProducto({
          ...p,
          imagen,
        });

      } catch (error) {
        console.log("Error:", error);
        setProducto(null);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [id]);

  const agregarAlCarrito = () => {
    if (!producto) return;

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(
      (item) => item.nombre === producto.nombre
    );

    if (existe) {
      existe.cantidad += 1;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1,
      });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    window.location.href = "/carrito";
  };

  if (loading) {
    return <div className="detalle-loading">Cargando producto...</div>;
  }

  if (!producto) {
    return <div className="detalle-loading">Producto no encontrado</div>;
  }

  return (
    <div className="detalle-container">

      <div className="detalle-grid">

        <img
          className="detalle-img"
          src={producto.imagen}
          alt={producto.nombre}
        />

        <div className="detalle-info">

          <h1>{producto.nombre}</h1>

          <div className="detalle-price">
            {Number(producto.precio || 0).toLocaleString("es-CO", {
              minimumFractionDigits: 2,
            })}
          </div>

          <div className="detalle-section">
            <h3>Descripción</h3>
            <p>{producto.descripcion}</p>
          </div>

          <div className="detalle-section ingredientes">
            <h3>Ingredientes</h3>
            <p>{producto.ingredientes}</p>
          </div>

          <div className="detalle-buttons">

            <button
              className="btn-secondary"
              onClick={() => window.history.back()}
            >
              Volver
            </button>

            <button
              className="btn-primary"
              onClick={agregarAlCarrito}
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