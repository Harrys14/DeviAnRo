import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import {
  getProductosPorRestaurante,
  getRestauranteById,
  obtenerImagen,
} from "../services/strapi";

import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";

import "../styles/menuRestaurante.css";

const normalizarTexto = (texto) =>
  (texto || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

function MenuRestaurante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const restauranteData = id ? await getRestauranteById(id) : null;
        setRestaurante(restauranteData || null);

        const productosData = id ? await getProductosPorRestaurante(id) : [];
        setProductos(Array.isArray(productosData) ? productosData : []);
      } catch (error) {
        console.error("Error cargando menú:", error);
        setRestaurante(null);
        setProductos([]);
        showToast("Error cargando el menú", "error");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, showToast]);

  const datos = restaurante || {};
  const abierto = datos.abierto !== false;
  const cal = Number(datos.calificacion) || 0;
  const colorPrincipal =
    datos.colorPrincipal ||
    datos.color_secundario?.colorPrincipal ||
    "#E53935";
  const colorSecundario =
    datos.colorSecundario ||
    datos.color_secundario ||
    "#FFFFFF";
  const colorFondo =
    datos.colorFondo || datos.color_fondo || "#f8f9fb";
  const imagenRestaurante = obtenerImagen(datos.imagen);

  const productosConImagen = useMemo(
    () =>
      (productos || []).map((p) => ({
        ...p,
        imagenUrl: obtenerImagen(p.imagen),
      })),
    [productos]
  );

  const categorias = useMemo(() => {
    const set = new Set();
    productosConImagen.forEach((p) => {
      const c = (p.categoria || "").trim();
      if (c) set.add(c);
    });
    return ["todas", ...Array.from(set).sort((a, b) => a.localeCompare(b, "es"))];
  }, [productosConImagen]);

  const filtrados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    return productosConImagen.filter((p) => {
      if (categoriaActiva !== "todas") {
        const cat = normalizarTexto(p.categoria);
        const activa = normalizarTexto(categoriaActiva);
        if (cat !== activa) return false;
      }
      if (q) {
        const texto = normalizarTexto(
          [p.nombre, p.descripcion, p.categoria, p.ingredientes]
            .filter(Boolean)
            .join(" ")
        );
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [productosConImagen, busqueda, categoriaActiva]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaActiva("todas");
  };

  const agregarAlCarrito = (producto) => {
    if (!producto?.disponible) {
      showToast("Este producto está agotado", "warning");
      return;
    }
    addItem(producto, 1);
    showToast(`${producto.nombre} agregado al carrito`, "success");
  };

  return (
    <Layout
      headerProps={{
        showBack: true,
        onBack: () => navigate("/restaurante"),
      }}
    >
      <div
        className="menu-container"
        style={{
          "--color-principal": colorPrincipal,
          "--color-secundario": colorSecundario,
          "--color-fondo": colorFondo,
        }}
      >
        {loading ? (
          <div className="menu-skeleton">
            <section className="menu-hero menu-hero-shared">
              <div className="menu-hero-bg" aria-hidden>
                <div className="skeleton" style={{ width: "100%", height: "100%" }} />
              </div>
              <div className="menu-hero-content">
                <div className="skeleton" style={{ height: 18, width: 200, marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 46, width: "85%", marginBottom: 14 }} />
                <div className="skeleton" style={{ height: 18, width: "70%" }} />
              </div>
            </section>

            <section className="menu-toolbar">
              <div className="skeleton" style={{ height: 52, width: "100%", borderRadius: 16 }} />
              <div className="skeleton" style={{ height: 40, width: "60%", borderRadius: 999 }} />
            </section>

            <section className="menu-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <article key={i} className="menu-card" style={{ pointerEvents: "none" }} aria-hidden>
                  <div className="menu-card-imgWrap">
                    <div className="skeleton" style={{ width: "100%", height: "100%" }} />
                  </div>
                  <div className="menu-info">
                    <div className="skeleton" style={{ height: 20, width: "80%", marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 14, width: "95%", marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 14, width: "70%", marginBottom: 18 }} />
                    <div className="skeleton" style={{ height: 18, width: 120, marginBottom: 18 }} />
                    <div className="skeleton" style={{ height: 46, width: "100%", borderRadius: 14 }} />
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <>
            <section className="menu-hero menu-hero-shared">
              <div
                className="menu-hero-bg"
                aria-hidden
                style={imagenRestaurante ? { backgroundImage: `url(${imagenRestaurante})` } : undefined}
              />
              <div className="menu-hero-overlay" aria-hidden />
              <div className="menu-hero-content">
                <div className="menu-hero-top">
                  <span className="menu-hero-chip">
                    🏪 {abierto ? "Abierto" : "Cerrado"}
                    {cal ? ` · ⭐ ${cal.toFixed(1)}` : ""}
                  </span>
                  <span className="menu-hero-chip menu-hero-chip-soft">
                    🍽️ {productosConImagen.length} producto
                    {productosConImagen.length === 1 ? "" : "s"}
                  </span>
                </div>

                <h1 className="menu-title">{datos.nombre || "Menú del restaurante"}</h1>
                <p className="menu-subtitle">
                  {datos.descripcion || "Explora todos los productos disponibles."}
                </p>

                <div className="menu-hero-meta">
                  {datos.ciudad && <span className="menu-meta-pill">🏙️ {datos.ciudad}</span>}
                  {datos.direccion && (
                    <span className="menu-meta-pill">📍 {datos.direccion}</span>
                  )}
                  {datos.categoria && datos.categoria !== "General" && (
                    <span className="menu-meta-pill">🍴 {datos.categoria}</span>
                  )}
                </div>
              </div>
            </section>

            <section className="menu-toolbar">
              <div className="menu-search">
                <span className="menu-search-icon" aria-hidden>🔎</span>
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar en el menú..."
                  className="menu-search-input"
                  aria-label="Buscar en el menú"
                />
                {busqueda && (
                  <button
                    type="button"
                    className="menu-search-clear"
                    onClick={() => setBusqueda("")}
                    aria-label="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="menu-filters">
                <div className="menu-filter-row">
                  <span className="menu-filter-label">🍴 Categoría</span>
                  <div className="menu-chips">
                    {categorias.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`menu-chip ${categoriaActiva === c ? "is-active" : ""}`}
                        onClick={() => setCategoriaActiva(c)}
                      >
                        {c === "todas" ? "Todas" : c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="menu-results">
                  <span className="menu-results-pill">
                    {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
                  </span>
                  {(busqueda || categoriaActiva !== "todas") && (
                    <button type="button" className="menu-clear-btn" onClick={limpiarFiltros}>
                      🗑️ Limpiar
                    </button>
                  )}
                </div>
              </div>
            </section>

            {filtrados.length === 0 ? (
              <section className="menu-empty">
                <div className="menu-empty-icon">🍽️</div>
                <h2>No encontramos productos</h2>
                <p>Prueba a cambiar la búsqueda o la categoría.</p>
                <button type="button" className="btn-primary menu-empty-btn" onClick={limpiarFiltros}>
                  Mostrar todo el menú
                </button>
              </section>
            ) : (
              <section className="menu-grid">
                {filtrados.map((p) => {
                  const precio = Number(p.precio || 0).toLocaleString("es-CO");
                  const disponible = p.disponible === undefined ? true : Boolean(p.disponible);
                  return (
                    <article
                      key={p.id}
                      className={`menu-card ${disponible ? "" : "is-unavailable"}`}
                    >
                      <Link to={`/detalle/${p.id}`} className="menu-card-link">
                        <div className="menu-card-imgWrap">
                          <img
                            src={p.imagenUrl}
                            alt={p.nombre}
                            className="menu-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/600x340?text=Producto";
                            }}
                          />
                          <div className="menu-card-imgOverlay" aria-hidden />
                          <div className="menu-card-badges">
                            {p.categoria && (
                              <span className="menu-card-badge menu-card-badge-cat">
                                {p.categoria}
                              </span>
                            )}
                            <span
                              className={`menu-card-badge ${
                                disponible ? "is-available" : "is-unavailable"
                              }`}
                            >
                              {disponible ? "✅ Disponible" : "⏳ Agotado"}
                            </span>
                          </div>
                        </div>

                        <div className="menu-info">
                          <div className="menu-card-head">
                            <h2 className="menu-card-title">{p.nombre}</h2>
                            <div className="menu-price">${precio}</div>
                          </div>
                          <p className="menu-card-desc">
                            {p.descripcion || "Sin descripción disponible."}
                          </p>

                          <div className="menu-actions">
                            <button
                              type="button"
                              className="menu-btn menu-btn-outline"
                              disabled={!disponible}
                              onClick={(e) => {
                                e.preventDefault();
                                agregarAlCarrito(p);
                              }}
                            >
                              + Agregar
                            </button>
                            <span
                              to={`/detalle/${p.id}`}
                              className="menu-btn menu-btn-primary"
                            >
                              Ver detalle
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default MenuRestaurante;
