import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getProductos,
  obtenerImagen,
} from "../services/strapi";
import { useUser } from "@clerk/clerk-react";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import "../styles/home.css";

const normalizarTexto = (texto) =>
  (texto || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const iconoPorCategoria = (cat = "") => {
  const c = normalizarTexto(cat);
  if (c.includes("hambur") || c.includes("burger")) return "🍔";
  if (c.includes("pizz")) return "🍕";
  if (c.includes("postre") || c.includes("dulc") || c.includes("tort") || c.includes("helad")) return "🍰";
  if (c.includes("bebida") || c.includes("jugo") || c.includes("refresc") || c.includes("agua") || c.includes("gaseos")) return "🥤";
  if (c.includes("sopa") || c.includes("cald")) return "🍜";
  if (c.includes("entrad") || c.includes("picad")) return "🥟";
  if (c.includes("poll") || c.includes("pollo")) return "🍗";
  if (c.includes("carn") || c.includes("res") || c.includes("lomo") || c.includes("asado")) return "🥩";
  if (c.includes("pesc") || c.includes("marisc") || c.includes("sushi")) return "🍣";
  if (c.includes("ensal")) return "🥗";
  if (c.includes("sandwi") || c.includes("torta") || c.includes("sandwich")) return "🥪";
  if (c.includes("cafe") || c.includes("te") || c.includes("café")) return "☕";
  return "🍽️";
};

function Home() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [cargando, setCargando] = useState(true);

  const { user } = useUser();
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const productosData = await getProductos();
        setProductos(Array.isArray(productosData) ? productosData : []);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
        showToast("No se pudieron cargar los productos", "error");
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, [showToast]);

  const categoriasDinamicas = useMemo(() => {
    const set = new Set();
    productos.forEach((p) => {
      const c = (p.categoria || "").trim();
      if (c) set.add(c);
    });
    return [
      { id: "todos", label: "Todos", icon: "🍽️", norm: "todos" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((c) => ({
          id: c,
          label: c,
          icon: iconoPorCategoria(c),
          norm: normalizarTexto(c),
        })),
    ];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    const catNorm = normalizarTexto(categoriaActiva);
    return productos.filter((p) => {
      const catProducto = normalizarTexto(p.categoria);
      if (categoriaActiva !== "todos" && catProducto !== catNorm) return false;
      if (q) {
        const texto = normalizarTexto(
          [
            p.nombre,
            p.descripcion,
            p.categoria,
            p.ingredientes,
            p.restaurante?.nombre,
            p.restaurante?.categoria,
            p.restaurante?.ciudad,
          ]
            .filter(Boolean)
            .join(" ")
        );
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [productos, busqueda, categoriaActiva]);

  const productoDestacado = useMemo(() => {
    if (!productosFiltrados.length) return null;
    return (
      productosFiltrados.find((p) => p.destacado && p.disponible) ||
      productosFiltrados.find((p) => p.disponible) ||
      productosFiltrados[0]
    );
  }, [productosFiltrados]);

  const productosGrid = useMemo(() => {
    if (!productoDestacado) return productosFiltrados;
    return productosFiltrados.filter((p) => String(p.id) !== String(productoDestacado.id));
  }, [productosFiltrados, productoDestacado]);

  const agregarAlCarrito = (producto) => {
    if (!producto?.disponible) {
      showToast("Este producto está agotado", "warning");
      return;
    }
    addItem(producto, 1);
    showToast(`${producto.nombre} agregado al carrito`, "success");
  };

  const formatearPrecio = (n) =>
    Number(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 2 });

  return (
    <Layout>
      <div className="home-container">
        <section className="home-hero">
          <div className="hero-bg" aria-hidden />
          <div className="hero-content">
            <div className="hero-welcome">
              <h1 className="hero-title">
                {user?.name ? `Hola, ${user.name.split(" ")[0]} ` : "Hola "}
                <span className="hero-emoji">✨</span>
              </h1>
              <p className="hero-subtitle">
                ¿Qué se te antoja hoy? Busca por plato, ingrediente o restaurante.
              </p>
            </div>

            <div className="hero-search">
              <span className="search-icon" aria-hidden>🔎</span>
              <input
                type="search"
                className="search-input"
                placeholder="Busca hamburguesa, pizza, sushi..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="hero-actions">
              <Link
                to="/restaurante"
                className="btn-primary hero-restaurant-btn"
                style={{ textDecoration: "none" }}
              >
                🏪 Ver todos los restaurantes
              </Link>
            </div>
          </div>
        </section>

        <section className="home-categorias-section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="title-dot" /> Categorías
            </h2>
          </div>
          <div className="categorias-wrap">
            {categoriasDinamicas.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-stamp ${categoriaActiva === cat.id ? "is-active" : ""}`}
                onClick={() => setCategoriaActiva(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="home-bento-section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="title-dot" /> Carta del día
            </h2>
            <div className="results-pill">
              {productosFiltrados.length} producto
              {productosFiltrados.length === 1 ? "" : "s"}
            </div>
          </div>

          {cargando ? (
            <div className="bento-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className={`bento-card skeleton-card ${i === 0 ? "bento-featured" : ""}`}
                  style={{ pointerEvents: "none" }}
                >
                  <div className="skeleton" style={{ width: "100%", height: "100%", borderRadius: "24px" }} />
                </div>
              ))}
            </div>
          ) : productosFiltrados.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h3>No encontramos nada así</h3>
              <p>Prueba cambiando la búsqueda o la categoría.</p>
              <button
                type="button"
                className="btn-primary btn-empty-reset"
                onClick={() => {
                  setBusqueda("");
                  setCategoriaActiva("todos");
                }}
              >
                Ver todos los productos
              </button>
            </div>
          ) : (
            <div className="bento-grid">
              {productoDestacado && (
                <Link
                  to={`/detalle/${productoDestacado.id}`}
                  className="bento-card bento-featured"
                  key={`f-${productoDestacado.id}`}
                >
                  <div
                    className="bento-img"
                    style={{
                      backgroundImage: `url(${obtenerImagen(productoDestacado.imagen)})`,
                    }}
                  >
                    <div className="bento-overlay" aria-hidden />
                    <div className="featured-stamp">
                      <span>⭐</span> Destacado
                    </div>
                    {!productoDestacado.disponible && (
                      <div className="featured-unavailable">⏳ Agotado</div>
                    )}
                  </div>
                  <div className="bento-info-featured">
                    <div>
                      <div className="bento-cat-pill">
                        {productoDestacado.categoria || "Especialidad"}
                      </div>
                      <h3 className="bento-title featured-title">
                        {productoDestacado.nombre}
                      </h3>
                      <p className="bento-desc featured-desc">
                        {productoDestacado.descripcion ||
                          "Un plato especial de la casa, preparado con ingredientes frescos."}
                      </p>
                      {productoDestacado.restaurante && (
                        <Link
                          to={`/restaurante/${productoDestacado.restaurante.id}`}
                          className="bento-rest-link-lg"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>🏪</span> {productoDestacado.restaurante.nombre}
                        </Link>
                      )}
                    </div>
                    <div className="bento-bottom-featured">
                      <div className="bento-price featured-price">
                        $ {formatearPrecio(productoDestacado.precio)}
                      </div>
                      <button
                        type="button"
                        className="bento-add-featured"
                        disabled={!productoDestacado.disponible}
                        onClick={(e) => {
                          e.preventDefault();
                          agregarAlCarrito(productoDestacado);
                        }}
                      >
                        {productoDestacado.disponible ? "+ Agregar" : "Agotado"}
                      </button>
                    </div>
                  </div>
                </Link>
              )}

              {productosGrid.map((p) => {
                const disponible = p.disponible === undefined ? true : p.disponible;
                return (
                  <div key={p.id} className="bento-card">
                    <Link to={`/detalle/${p.id}`} className="bento-inner-link">
                      <div
                        className="bento-img-mini"
                        style={{
                          backgroundImage: `url(${obtenerImagen(p.imagen)})`,
                        }}
                      >
                        {p.categoria && (
                          <div className="mini-cat-badge">
                            {iconoPorCategoria(p.categoria)} <span>{p.categoria}</span>
                          </div>
                        )}
                        {!disponible && (
                          <div className="unavailable-ribbon">Agotado</div>
                        )}
                      </div>
                      <div className="bento-info-mini">
                        <h3 className="bento-title-mini">{p.nombre}</h3>
                        <p className="bento-desc-mini">
                          {p.descripcion
                            ? p.descripcion.slice(0, 80) +
                              (p.descripcion.length > 80 ? "…" : "")
                            : "Sin descripción."}
                        </p>
                        {p.restaurante && (
                          <Link
                            to={`/restaurante/${p.restaurante.id}`}
                            className="bento-rest-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>🏪</span> {p.restaurante.nombre}
                          </Link>
                        )}
                        <div className="bento-bottom-mini">
                          <div className="bento-price-mini">
                            $ {formatearPrecio(p.precio)}
                          </div>
                          <button
                            type="button"
                            className="bento-add-mini"
                            disabled={!disponible}
                            onClick={(e) => {
                              e.preventDefault();
                              agregarAlCarrito(p);
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Home;
