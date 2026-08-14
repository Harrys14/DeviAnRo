import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProductos, obtenerImagen, crearPedido } from "../services/strapi";
import { useUser } from "@clerk/clerk-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import "../styles/carrito.css";

function Carrito() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, addItem } = useCart();
  const { showToast } = useToast();
  const { user } = useUser();
  const navigate = useNavigate();

  const [recomendaciones, setRecomendaciones] = useState([]);
  const [procesandoPago, setProcesandoPago] = useState(false);

  useEffect(() => {
    const cargarRecomendaciones = async () => {
      try {
        const productos = await getProductos();
        const carritoIds = new Set(items.map((i) => i.id));
        const sinCarrito = productos.filter((p) => !carritoIds.has(p.id));
        const aleatorios = [...sinCarrito]
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        setRecomendaciones(aleatorios);
      } catch (error) {
        console.error("Error cargando recomendaciones:", error);
      }
    };
    cargarRecomendaciones();
  }, [items]);

  const pagar = async () => {
    if (!user?.id) {
      showToast("Debes iniciar sesión para realizar el pedido", "warning");
      return;
    }
    if (items.length === 0) {
      showToast("Tu carrito está vacío", "warning");
      return;
    }
    setProcesandoPago(true);
    const pedidoData = {
      items: items.map((i) => ({
        id: i.id,
        nombre: i.nombre,
        precio: i.precio,
        cantidad: i.cantidad || 1,
      })),
      total: totalPrice,
      fecha: new Date().toISOString(),
      estado: "pendiente",
    };
    const resultado = await crearPedido(pedidoData, user.id);
    setProcesandoPago(false);
    if (resultado && !resultado.error) {
      showToast("✅ Pedido creado con éxito!", "success");
      clearCart();
      navigate("/cuenta");
    } else {
      showToast("❌ Error al crear el pedido. Intenta nuevamente.", "error");
    }
  };

  const agregarRecomendacion = (producto) => {
    addItem(producto, 1);
    showToast(`${producto.nombre} agregado al carrito`, "success");
  };

  const subtotal = totalPrice;
  const envio = items.length > 0 ? 3000 : 0;
  const total = subtotal + envio;

  return (
    <Layout
      headerProps={{
        showBack: true,
        onBack: () => navigate("/home"),
      }}
    >
      <div className="carrito-container">
        {items.length === 0 ? (
          <div className="carrito-vacio">
            <div className="carrito-vacio-icon">🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p>Agrega productos para comenzar tu pedido.</p>
            <Link to="/home" className="carrito-comprar">
              Ir a comprar
            </Link>
          </div>
        ) : (
          <>
            <h1 className="carrito-title">🛒 Tu carrito</h1>
            <p className="carrito-subtitle">
              {items.reduce((acc, i) => acc + (i.cantidad || 1), 0)} items en tu
              pedido
            </p>

            <div className="carrito-lista">
              {items.map((item, index) => (
                <div
                  className="carrito-item"
                  key={item.id || index}
                >
                  <Link to={`/detalle/${item.id}`}>
                    <img
                      src={obtenerImagen(item.imagen)}
                      alt={item.nombre}
                    />
                  </Link>

                  <div className="carrito-info">
                    <Link
                      to={`/detalle/${item.id}`}
                      className="carrito-link"
                    >
                      <h3>{item.nombre}</h3>
                    </Link>

                    <div className="carrito-precio">
                      ${Number(item.precio || 0).toLocaleString("es-CO")}
                    </div>

                    <div className="carrito-controles">
                      <button
                        aria-label="Disminuir cantidad"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        −
                      </button>
                      <span>{item.cantidad || 1}</span>
                      <button
                        aria-label="Aumentar cantidad"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="carrito-eliminar"
                      onClick={() => removeItem(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="carrito-total">
              <div
                style={{
                  width: "100%",
                  maxWidth: "380px",
                  marginLeft: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "15px",
                  color: "var(--color-text-soft)",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString("es-CO")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Envío</span>
                  <span>${envio.toLocaleString("es-CO")}</span>
                </div>
              </div>
              <h2>Total: ${total.toLocaleString("es-CO")}</h2>
              <button
                className="btn-pagar"
                disabled={procesandoPago}
                onClick={pagar}
              >
                {procesandoPago ? "Procesando..." : "💳 Pagar ahora"}
              </button>
            </div>
          </>
        )}
      </div>

      {recomendaciones.length > 0 && (
        <div className="carrito-recomendaciones">
          <div className="recomendaciones-header">
            <h2>🍔 Lo recomendado para ti</h2>
            <p>Descubre algunos productos que podrían gustarte.</p>
          </div>

          <div className="recomendaciones-grid">
            {recomendaciones.map((producto) => (
              <div
                key={producto.id}
                className="recomendacion-card"
              >
                <img
                  src={obtenerImagen(producto.imagen)}
                  alt={producto.nombre}
                  onClick={() => navigate(`/detalle/${producto.id}`)}
                  style={{ cursor: "pointer" }}
                />

                <div className="recomendacion-info">
                  <h4 onClick={() => navigate(`/detalle/${producto.id}`)} style={{ cursor: "pointer" }}>
                    {producto.nombre}
                  </h4>
                  <p>
                    ${Number(producto.precio || 0).toLocaleString("es-CO")}
                  </p>
                  <button
                    type="button"
                    className="menu-btn"
                    style={{
                      width: "100%",
                      marginTop: "10px",
                      padding: "10px 14px",
                      fontSize: "14px",
                      borderRadius: "10px",
                      background: "var(--color-primary)",
                      color: "white",
                      border: "none",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={agregarRecomendacion.bind(null, producto)}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Carrito;
