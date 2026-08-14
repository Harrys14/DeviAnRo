import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  getProductoById,
  getProductosPorRestaurante,
  obtenerImagen,
} from "../services/strapi";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import "../styles/detalle.css";

const TABS = [
  { id: "descripcion", label: "📝 Descripción" },
  { id: "ingredientes", label: "🥗 Ingredientes" },
  { id: "info", label: "ℹ️ Información" },
];

function Detalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [tabActivo, setTabActivo] = useState("descripcion");
  const [relacionados, setRelacionados] = useState([]);

  const ingredientesLista = useMemo(() => {
    if (!producto?.ingredientes) return [];
    return producto.ingredientes
      .split(/[,\n;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [producto?.ingredientes]);

  useEffect(() => {
    const cargarProducto = async () => {
      setLoading(true);
      setCantidad(1);
      setTabActivo("descripcion");
      try {
        const item = await getProductoById(id);
        if (!item) {
          setProducto(null);
          return;
        }
        const p = item;
        const imagenUrl = obtenerImagen(p.imagen);
        setProducto({ ...p, imagenUrl });

        const restauranteId = p.restaurante?.id || p.restaurante;
        if (restauranteId) {
          try {
            const lista =
              (await getProductosPorRestaurante(restauranteId)) || [];
            const otros = lista
              .filter((x) => String(x.id) !== String(id))
              .slice(0, 4);
            setRelacionados(otros);
          } catch (errorR) {
            console.warn("No se cargaron relacionados:", errorR);
            setRelacionados([]);
          }
        }
      } catch (error) {
        console.error("Error:", error);
        setProducto(null);
        showToast("Error cargando el producto", "error");
      } finally {
        setLoading(false);
      }
    };
    cargarProducto();
  }, [id, showToast]);

  const agregarAlCarrito = () => {
    if (!producto) return;
    addItem(producto, cantidad);
    showToast(`${cantidad}x ${producto.nombre} agregado al carrito`, "success");
  };

  const subtotal = useMemo(
    () => (producto ? Number(producto.precio || 0) * cantidad : 0),
    [producto, cantidad]
  );

  if (loading) {
    return (
      <Layout
        headerProps={{ showBack: true, onBack: () => navigate(-1) }}
      >
        <div className="detalle-container">
          <div className="detalle-skeleton">
            <div className="detalle-skeleton-hero">
              <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: 0 }} />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 0.9fr",
                gap: "28px",
                marginTop: "28px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="skeleton" style={{ height: "36px", width: "35%" }} />
                <div className="skeleton" style={{ height: "96px", width: "100%" }} />
                <div className="skeleton" style={{ height: "100px", width: "100%" }} />
                <div className="skeleton" style={{ height: "44px", width: "100%" }} />
                <div className="skeleton" style={{ height: "200px", width: "100%" }} />
              </div>
              <div className="skeleton" style={{ height: "480px", borderRadius: "28px" }} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!producto) {
    return (
      <Layout
        headerProps={{ showBack: true, onBack: () => navigate(-1) }}
      >
        <div className="detalle-container">
          <div className="detalle-empty">
            <div className="detalle-empty-icon">😕</div>
            <h2 className="detalle-empty-title">Producto no encontrado</h2>
            <p className="detalle-empty-sub">
              Es posible que el producto haya sido retirado o no exista.
            </p>
            <Link
              to="/home"
              className="btn-primary detalle-empty-btn"
              style={{ textDecoration: "none" }}
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const restaurante = producto.restaurante || null;
  const restauranteImg = restaurante
    ? obtenerImagen(restaurante.imagen)
    : null;
  const restauranteNombre = restaurante?.nombre || "Restaurante asociado";
  const restauranteCiudad = restaurante?.ciudad || "Bogotá";
  const restauranteId = restaurante?.id || null;
  const restauranteCalificacion = restaurante?.calificacion
    ? Number(restaurante.calificacion).toFixed(1)
    : null;
  const calificacion =
    Number(producto.calificacion || restaurante?.calificacion || 4.7);
  const categoria = producto.categoria
    ? producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)
    : "Producto";
  const disponible =
    producto.disponible === undefined ? true : Boolean(producto.disponible);
  const destacado = Boolean(producto.destacado);

  return (
    <Layout
      headerProps={{ showBack: true, onBack: () => navigate(-1) }}
    >
      <div className="detalle-container">
        {/* ========== HERO CINEMATOGRÁFICO CON IMAGEN ========== */}
        <section className="detalle-hero detalle-hero--withimg">
          <img
            className="detalle-hero-img"
            src={producto.imagenUrl}
            alt={producto.nombre}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/1400x520?text=Sin+Imagen";
            }}
            loading="eager"
          />
          <div className="detalle-hero-bg" aria-hidden />
          <div className="detalle-hero-overlay" aria-hidden />

          <div className="detalle-hero-content">
            <div className="detalle-hero-top">
              <span className={`detalle-chip ${destacado ? "is-featured" : ""}`}>
                {destacado ? "⭐ Destacado de la casa" : "🍽️ " + categoria}
              </span>
              {disponible ? (
                <span className="detalle-chip">
                  ✅ Disponible ahora
                </span>
              ) : (
                <span className="detalle-chip" style={{ background: "rgba(107,114,128,0.55)" }}>
                  ⏳ Agotado
                </span>
              )}
              {restaurante && (
                <Link
                  to={restauranteId ? `/restaurante/${restauranteId}` : "/restaurante"}
                  className="detalle-chip detalle-chip-link"
                  style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                >
                  🏪 {restauranteNombre}
                </Link>
              )}
            </div>

            <h1 className="detalle-hero-title">{producto.nombre}</h1>
            <p className="detalle-hero-sub">
              {producto.descripcion?.slice(0, 160) ||
                "Un plato delicioso preparado con ingredientes frescos y de la mejor calidad."}
              {producto.descripcion && producto.descripcion.length > 160
                ? "…"
                : ""}
            </p>
          </div>
        </section>

        {/* ========== GRID: INFO + CTA STICKY ========== */}
        <div className="detalle-main-grid">
          {/* ============ COLUMNA PRINCIPAL ============ */}
          <div className="detalle-main-info">
            {/* HEAD: Título + precio + stats */}
            <div className="detalle-head">
              <h1 className="detalle-head-title">{producto.nombre}</h1>
              <div className="detalle-head-row">
                <div className="detalle-price-wrap">
                  <span className="detalle-price-label">Precio</span>
                  <span className="detalle-price">
                    ${Number(producto.precio || 0).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="detalle-stats">
                  <div className="detalle-stat">
                    <span className="detalle-stat-icon">⭐</span>
                    <span className="detalle-stat-value">
                      {calificacion.toFixed(1)}
                    </span>
                    <span className="detalle-stat-label">calificación</span>
                  </div>
                  <div className="detalle-stat">
                    <span className="detalle-stat-icon">🚀</span>
                    <span className="detalle-stat-value">25-35</span>
                    <span className="detalle-stat-label">min</span>
                  </div>
                  <div className="detalle-stat">
                    <span className="detalle-stat-icon">🔥</span>
                    <span className="detalle-stat-value">Top</span>
                    <span className="detalle-stat-label">ventas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RESTAURANTE CARD */}
            {restaurante && restauranteId && (
              <Link
                to={`/restaurante/${restauranteId}`}
                className="detalle-restaurante-card"
              >
                <img
                  src={restauranteImg}
                  alt={restauranteNombre}
                  className="detalle-restaurante-thumb"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/80?text=R";
                  }}
                />
                <div className="detalle-restaurante-info">
                  <div className="detalle-restaurante-title">
                    {restauranteNombre}
                    <span className="detalle-restaurante-ver">
                      Ver menú completo →
                    </span>
                  </div>
                  <div className="detalle-restaurante-sub">
                    📍 {restauranteCiudad}
                    {restauranteCalificacion
                      ? `  ·  ⭐ ${restauranteCalificacion}`
                      : ""}
                    {restaurante?.categoria
                      ? `  ·  🍴 ${restaurante.categoria}`
                      : ""}
                  </div>
                </div>
              </Link>
            )}

            {/* TABS */}
            <div className="detalle-tabs">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`detalle-tab ${
                    tabActivo === t.id ? "is-active" : ""
                  }`}
                  onClick={() => setTabActivo(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            <div className="detalle-tabs-content">
              {tabActivo === "descripcion" && (
                <div className="detalle-tab-pane">
                  {producto.descripcion ? (
                    <p className="detalle-tab-paragraph">
                      {producto.descripcion}
                    </p>
                  ) : (
                    <p className="detalle-tab-muted">
                      Sin descripción disponible por el momento.
                    </p>
                  )}
                </div>
              )}

              {tabActivo === "ingredientes" && (
                <div className="detalle-tab-pane detalle-tab-pane-ingredientes">
                  {ingredientesLista.length > 0 ? (
                    <>
                      <p
                        className="detalle-tab-muted"
                        style={{ marginBottom: "16px", marginTop: 0 }}
                      >
                        Preparado con los siguientes ingredientes frescos:
                      </p>
                      <div className="detalle-ingredientes-wrap">
                        {ingredientesLista.map((ing, i) => (
                          <span
                            key={i}
                            className="detalle-ingrediente-chip"
                          >
                            ✨ {ing}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="detalle-tab-muted">
                      Sin información de ingredientes para este producto.
                    </p>
                  )}
                </div>
              )}

              {tabActivo === "info" && (
                <div className="detalle-tab-pane detalle-tab-pane-info">
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">📦 Código</span>
                    <span className="detalle-info-value">#{producto.id}</span>
                  </div>
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">🍽️ Categoría</span>
                    <span className="detalle-info-value">{categoria}</span>
                  </div>
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">🏪 Restaurante</span>
                    <span className="detalle-info-value">
                      {restauranteNombre}
                    </span>
                  </div>
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">💲 Precio unitario</span>
                    <span className="detalle-info-value">
                      ${Number(producto.precio || 0).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">⭐ Calificación</span>
                    <span className="detalle-info-value">
                      {calificacion.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <div className="detalle-info-row">
                    <span className="detalle-info-key">✅ Estado</span>
                    <span
                      className="detalle-info-value"
                      style={{
                        color: disponible ? "#10b981" : "#6b7280",
                        fontWeight: 700,
                      }}
                    >
                      {disponible
                        ? "Disponible y listo para pedir"
                        : "Agotado temporalmente"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCTOS RELACIONADOS */}
            {relacionados.length > 0 && (
              <div className="detalle-relacionados">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <h2 className="detalle-relacionados-title">
                    🍴 También te puede interesar
                  </h2>
                  {restauranteId && (
                    <Link
                      to={`/restaurante/${restauranteId}`}
                      className="btn-secondary detalle-relacionados-btn"
                      style={{ textDecoration: "none" }}
                    >
                      Ver menú completo →
                    </Link>
                  )}
                </div>
                <div className="detalle-relacionados-grid">
                  {relacionados.map((r) => {
                    const rp = r.attributes || r;
                    const rImg = obtenerImagen(rp.imagen);
                    const rDisp =
                      rp.disponible === undefined ? true : Boolean(rp.disponible);
                    return (
                      <Link
                        key={r.id}
                        to={`/detalle/${r.id}`}
                        className={`detalle-relacionado-card ${rDisp ? "" : "is-unavailable"}`}
                      >
                        <div className="detalle-relacionado-imgwrap">
                          <img
                            src={rImg}
                            alt={rp.nombre}
                            className="detalle-relacionado-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/400x260?text=S";
                            }}
                          />
                          {!rDisp && (
                            <div className="detalle-relacionado-unavailable">
                              ⏳ Agotado
                            </div>
                          )}
                          {rp.categoria && (
                            <span className="detalle-relacionado-cat">
                              {rp.categoria}
                            </span>
                          )}
                        </div>
                        <div className="detalle-relacionado-info">
                          <h4 className="detalle-relacionado-name">
                            {rp.nombre}
                          </h4>
                          <p className="detalle-relacionado-rest">
                            {rp.restaurante?.nombre ||
                              restauranteNombre ||
                              ""}
                          </p>
                          <div className="detalle-relacionado-bottom">
                            <div className="detalle-relacionado-precio">
                              $
                              {Number(rp.precio || 0).toLocaleString(
                                "es-CO"
                              )}
                            </div>
                            <span className="detalle-relacionado-arrow">
                              Ver →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ============ COLUMNA SECUNDARIA: CTA STICKY ============ */}
          <aside className="detalle-cta-card">
            <h3 className="detalle-cta-title">🛒 Tu pedido</h3>

            <div className="detalle-cta-resumen">
              <div className="detalle-cta-product">
                <img
                  src={producto.imagenUrl}
                  alt={producto.nombre}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/100?text=P";
                  }}
                />
                <div className="detalle-cta-product-info">
                  <div className="detalle-cta-name">{producto.nombre}</div>
                  <div className="detalle-cta-price-unit">
                    $
                    {Number(producto.precio || 0).toLocaleString("es-CO")}{" "}
                    / unidad
                  </div>
                </div>
              </div>

              <div className="detalle-cantidad">
                <span className="detalle-cantidad-label">Cantidad</span>
                <div className="detalle-cantidad-control">
                  <button
                    type="button"
                    className="detalle-cantidad-btn"
                    aria-label="Disminuir cantidad"
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                  >
                    −
                  </button>
                  <span className="detalle-cantidad-num">{cantidad}</span>
                  <button
                    type="button"
                    className="detalle-cantidad-btn"
                    aria-label="Aumentar cantidad"
                    onClick={() => setCantidad((c) => c + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detalle-cta-row">
                <span>Subtotal ({cantidad} unidad{cantidad === 1 ? "" : "es"})</span>
                <strong>${subtotal.toLocaleString("es-CO")}</strong>
              </div>
              <div className="detalle-cta-row detalle-cta-row-muted">
                <span>🚚 Envío estimado</span>
                <span>$3.000</span>
              </div>
            </div>

            <div className="detalle-cta-total">
              <span>Total aproximado</span>
              <strong>
                ${(subtotal + 3000).toLocaleString("es-CO")}
              </strong>
            </div>

            <button
              type="button"
              className={`btn-primary detalle-cta-add ${!disponible ? "is-disabled" : ""}`}
              onClick={agregarAlCarrito}
              disabled={!disponible}
            >
              {disponible ? (
                <>
                  🛒 Agregar {cantidad > 1 && ` (${cantidad})`} al carrito
                </>
              ) : (
                "❌ Producto no disponible"
              )}
            </button>

            <button
              type="button"
              className="btn-secondary detalle-cta-secondary"
              onClick={() => navigate("/carrito")}
            >
              🛍️ Ir al carrito ahora
            </button>

            <div className="detalle-cta-beneficios">
              <div>🔒 Pago 100% seguro</div>
              <div>💯 Garantía de satisfacción</div>
              <div>⚡ Entrega rápida y caliente</div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

export default Detalle;
