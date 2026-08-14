import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRestaurantes, obtenerImagen } from "../services/strapi";
import { useToast } from "../context/ToastContext";
import Layout from "../components/Layout";
import "../styles/restaurante.css";

const iconoPorCategoria = (cat = "") => {
  const c = (cat || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (c.includes("hambur") || c.includes("burger")) return "🍔";
  if (c.includes("pizz")) return "🍕";
  if (c.includes("postre") || c.includes("dulc") || c.includes("tort") || c.includes("helad")) return "🍰";
  if (c.includes("bebida") || c.includes("jugo") || c.includes("refresc") || c.includes("gaseos")) return "🥤";
  if (c.includes("sopa") || c.includes("cald")) return "🍜";
  if (c.includes("entrad") || c.includes("picad")) return "🥟";
  if (c.includes("poll") || c.includes("pollo")) return "🍗";
  if (c.includes("carn") || c.includes("res") || c.includes("lomo") || c.includes("asado")) return "🥩";
  if (c.includes("pesc") || c.includes("marisc") || c.includes("sushi")) return "🍣";
  if (c.includes("ensal")) return "🥗";
  if (c.includes("sandwi") || c.includes("torta") || c.includes("sandwich")) return "🥪";
  if (c.includes("cafe") || c.includes("te")) return "☕";
  if (c.includes("mexic")) return "🌮";
  if (c.includes("itali")) return "🇮🇹";
  if (c.includes("asiat") || c.includes("japon") || c.includes("chino") || c.includes("thai")) return "🍱";
  if (c.includes("vegan") || c.includes("veget")) return "🥑";
  return "🍽️";
};

const normalizarTexto = (texto) =>
  (texto || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const RATING_FILTROS = [
  { id: "todos", label: "Todos", icon: "✨" },
  { id: "4.5", label: "4.5+", icon: "⭐" },
  { id: "4", label: "4.0+", icon: "⭐" },
];

function Restaurante() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [ciudad, setCiudad] = useState("todas");
  const [categoria, setCategoria] = useState("todas");
  const [rating, setRating] = useState("todos");
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const cargarRestaurantes = async () => {
      setLoading(true);
      try {
        const data = await getRestaurantes();
        setRestaurantes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando restaurantes:", error);
        setRestaurantes([]);
        showToast("No se pudieron cargar los restaurantes", "error");
      } finally {
        setLoading(false);
      }
    };
    cargarRestaurantes();
  }, [showToast]);

  /* =========================================================
     Opciones de filtro dinámicas (según datos reales)
  ========================================================= */
  const ciudades = useMemo(() => {
    const set = new Set();
    restaurantes.forEach((r) => {
      const c = (r.ciudad || "").trim();
      if (c) set.add(c);
    });
    return ["todas", ...Array.from(set).sort()];
  }, [restaurantes]);

  const categorias = useMemo(() => {
    const set = new Set();
    restaurantes.forEach((r) => {
      const c = (r.categoria || "").trim();
      if (c && c !== "General") set.add(c);
    });
    return [
      { id: "todas", label: "Todos", icon: "🍽️" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((c) => ({ id: c, label: c, icon: iconoPorCategoria(c) })),
    ];
  }, [restaurantes]);

  const totalAbiertos = useMemo(
    () => restaurantes.filter((r) => r.abierto !== false).length,
    [restaurantes]
  );

  const totalCerrados = restaurantes.length - totalAbiertos;

  const filtrados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    return restaurantes.filter((r) => {
      if (ciudad !== "todas" && (r.ciudad || "") !== ciudad) return false;
      if (categoria !== "todas" && (r.categoria || "") !== categoria) return false;
      if (rating !== "todos") {
        const cal = Number(r.calificacion) || 0;
        if (cal < Number(rating)) return false;
      }
      if (q) {
        const texto = normalizarTexto(
          [
            r.nombre,
            r.descripcion,
            r.categoria,
            r.ciudad,
            r.direccion,
          ]
            .filter(Boolean)
            .join(" ")
        );
        if (!texto.includes(q)) return false;
      }
      return true;
    });
  }, [restaurantes, busqueda, ciudad, categoria, rating]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCiudad("todas");
    setCategoria("todas");
    setRating("todos");
  };

  const hayFiltros =
    busqueda || ciudad !== "todas" || categoria !== "todas" || rating !== "todos";

  return (
    <Layout
      headerProps={{
        showBack: true,
        onBack: () => navigate("/home"),
      }}
    >
      <div className="rest-global">
        {/* =========================================================
            HERO — título + estadísticas
        ========================================================= */}
        <section className="rest-hero">
          <div className="rest-hero-bg" aria-hidden />
          <div className="rest-hero-top">
            <span className={`rest-badge ${totalAbiertos > 0 ? "is-open" : "is-closed"}`}>
              🟢 {totalAbiertos} abierto{totalAbiertos === 1 ? "" : "s"} ahora
            </span>
            {totalCerrados > 0 && (
              <span className="rest-badge">
                ⏳ {totalCerrados} cerrado{totalCerrados === 1 ? "" : "s"}
              </span>
            )}
            <span className="rest-badge">
              🏙️ {ciudades.length - 1} ciudad{ciudades.length - 1 === 1 ? "" : "es"}
            </span>
          </div>

          <h1 className="rest-hero-title">
            Descubre restaurantes <span style={{ textDecoration: "underline", textDecorationColor: "rgba(255,255,255,0.35)", textUnderlineOffset: "6px" }}>increíbles</span> cerca de ti
          </h1>
          <p className="rest-hero-subtitle">
            Explora los mejores locales, filtra por categoría, calificación o
            ciudad y entra directo a su menú para pedir lo que más te antoje.
          </p>

          <div className="rest-hero-meta">
            {RATING_FILTROS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`rest-meta-pill ${rating === f.id ? "is-active" : ""}`}
                onClick={() => setRating(f.id)}
                style={
                  rating === f.id
                    ? {
                        background: "rgba(255,255,255,0.95)",
                        color: "#c62828",
                        border: "none",
                        fontWeight: 700,
                      }
                    : undefined
                }
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================
            TOOLBAR — búsqueda + limpiar filtros
        ========================================================= */}
        <section className="rest-toolbar">
          <div className="rest-search">
            <span className="rest-search-icon" aria-hidden>
              🔎
            </span>
            <input
              type="search"
              placeholder="Buscar restaurante, comida, dirección, ciudad..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="rest-search-input"
              aria-label="Buscar restaurante"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="rest-search-clear"
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {hayFiltros && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={limpiarFiltros}
                style={{ padding: "10px 20px", fontSize: "13.5px" }}
              >
                🗑️ Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* =========================================================
            CIUDADES (filtros rápidos)
        ========================================================= */}
        {ciudades.length > 2 && (
          <section className="rest-categories-section">
            <div className="rest-section-title">
              <div className="rest-title-main">📍 Por ciudad</div>
            </div>
            <div className="rest-categories-wrap">
              {ciudades.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`rest-cat-btn ${ciudad === c ? "is-active" : ""}`}
                  onClick={() => setCiudad(c)}
                >
                  <span className="rest-cat-icon">
                    {c === "todas" ? "🌎" : "🏙️"}
                  </span>
                  <span>{c === "todas" ? "Todas" : c}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            CATEGORÍAS
        ========================================================= */}
        {categorias.length > 1 && (
          <section className="rest-categories-section">
            <div className="rest-section-title">
              <div className="rest-title-main">🍴 Por categoría</div>
            </div>
            <div className="rest-categories-wrap">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`rest-cat-btn ${
                    categoria === cat.id ? "is-active" : ""
                  }`}
                  onClick={() => setCategoria(cat.id)}
                >
                  <span className="rest-cat-icon">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================
            LISTADO / SKELETON / EMPTY
        ========================================================= */}
        <section className="rest-list-section">
          <div className="rest-section-title">
            <div className="rest-title-main">
              {loading
                ? "Cargando restaurantes..."
                : filtrados.length === 1
                ? "Restaurante encontrado"
                : "Todos los restaurantes"}
            </div>
            {!loading && (
              <span className="rest-title-count">
                {filtrados.length} resultado{filtrados.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="rest-grid rest-grid-skeleton">
              {Array.from({ length: 8 }).map((_, i) => (
                <article
                  key={`sk-${i}`}
                  className="rest-card"
                  style={{ pointerEvents: "none" }}
                  aria-hidden
                >
                  <div className="rest-skeleton-img skeleton" style={{ borderRadius: 0 }} />
                  <div className="rest-card-info">
                    <div className="skeleton rest-skeleton-line" style={{ height: 20, width: "80%" }} />
                    <div className="skeleton rest-skeleton-line" style={{ height: 14, width: "100%" }} />
                    <div className="skeleton rest-skeleton-line" style={{ height: 14, width: "70%" }} />
                    <div className="skeleton rest-skeleton-line" style={{ height: 14, width: "50%" }} />
                    <div
                      className="skeleton rest-skeleton-line"
                      style={{ height: 44, width: "100%", marginTop: "auto" }}
                    />
                  </div>
                </article>
              ))}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="rest-empty">
              <div className="rest-empty-icon">🍽️</div>
              <h2>No encontramos restaurantes</h2>
              <p>
                Prueba a cambiar los filtros, limpiar la búsqueda o volver más
                tarde para ver novedades.
              </p>
              <button
                type="button"
                className="btn-primary btn-empty"
                onClick={limpiarFiltros}
              >
                Limpiar y mostrar todos
              </button>
            </div>
          ) : (
            <div className="rest-grid">
              {filtrados.map((r) => {
                const imagen = obtenerImagen(r.imagen);
                const cal = Number(r.calificacion) || 0;
                const abierto = r.abierto !== false;
                return (
                  <Link
                    key={r.id}
                    to={`/restaurante/${r.id}`}
                    className={`rest-card ${abierto ? "" : "is-closed"}`}
                  >
                    {/* IMAGEN + overlays */}
                    <div
                      className="rest-card-img"
                      style={{
                        backgroundImage: imagen
                          ? `url(${imagen})`
                          : `url(https://via.placeholder.com/600x340?text=Restaurante)`,
                      }}
                    >
                      <span
                        className={`rest-card-status ${
                          abierto ? "is-open" : "is-closed"
                        }`}
                      >
                        {abierto ? "🟢 Abierto" : "🔴 Cerrado"}
                      </span>
                      {cal > 0 && (
                        <span className="rest-card-rating">
                          ⭐ <strong>{cal.toFixed(1)}</strong>
                        </span>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="rest-card-info">
                      <div className="rest-card-head">
                        <h3 className="rest-card-name">{r.nombre}</h3>
                        <span className="rest-card-dot" aria-hidden>
                          →
                        </span>
                      </div>

                      <p className="rest-card-desc">
                        {r.descripcion ||
                          "Deliciosa comida preparada con ingredientes frescos y mucho cariño."}
                      </p>

                      <div className="rest-card-meta">
                        {r.categoria && r.categoria !== "General" && (
                          <span>
                            {iconoPorCategoria(r.categoria)} {r.categoria}
                          </span>
                        )}
                        {r.ciudad && <span>🏙️ {r.ciudad}</span>}
                        {r.direccion && (
                          <span>
                            📍{" "}
                            {String(r.direccion).length > 36
                              ? `${String(r.direccion).slice(0, 36)}…`
                              : r.direccion}
                          </span>
                        )}
                      </div>

                      <span className="rest-card-cta">
                        Ver menú completo <span aria-hidden>→</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Restaurante;
