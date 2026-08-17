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
  if (
    c.includes("postre") ||
    c.includes("dulc") ||
    c.includes("tort") ||
    c.includes("helad")
  )
    return "🍰";
  if (
    c.includes("bebida") ||
    c.includes("jugo") ||
    c.includes("refresc") ||
    c.includes("agua") ||
    c.includes("gaseos")
  )
    return "🥤";
  if (c.includes("sopa") || c.includes("cald")) return "🍜";
  if (c.includes("entrad") || c.includes("picad")) return "🥟";
  if (c.includes("poll") || c.includes("pollo")) return "🍗";
  if (
    c.includes("carn") ||
    c.includes("res") ||
    c.includes("lomo") ||
    c.includes("asado")
  )
    return "🥩";
  if (
    c.includes("pesc") ||
    c.includes("marisc") ||
    c.includes("sushi")
  )
    return "🍣";
  if (c.includes("ensal")) return "🥗";
  if (
    c.includes("sandwi") ||
    c.includes("torta") ||
    c.includes("sandwich")
  )
    return "🥪";
  if (c.includes("cafe") || c.includes("te") || c.includes("café"))
    return "☕";

  return "🍽️";
};

/*
  Mezcla los productos de forma determinística usando una semilla.
  Esto permite que las recomendaciones sean diferentes cada día,
  pero iguales durante todo el mismo día.
*/
const mezclarProductos = (productos, semilla) => {
  const copia = [...productos];

  let valor = semilla;

  for (let i = copia.length - 1; i > 0; i--) {
    valor = (valor * 9301 + 49297) % 233280;

    const indice = Math.floor((valor / 233280) * (i + 1));

    [copia[i], copia[indice]] = [copia[indice], copia[i]];
  }

  return copia;
};

/*
  Genera una semilla basada en la fecha actual.
  La selección cambia automáticamente cada día.
*/
const obtenerSemillaDelDia = () => {
  const fecha = new Date();

  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const año = fecha.getFullYear();

  return año * 10000 + mes * 100 + dia;
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

        setProductos(
          Array.isArray(productosData) ? productosData : []
        );
      } catch (error) {
        console.error("Error cargando productos:", error);

        setProductos([]);

        showToast(
          "No se pudieron cargar los productos",
          "error"
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [showToast]);

  /*
    Categorías dinámicas obtenidas desde los productos.
  */
  const categoriasDinamicas = useMemo(() => {
    const set = new Set();

    productos.forEach((p) => {
      const c = (p.categoria || "").trim();

      if (c) {
        set.add(c);
      }
    });

    return [
      {
        id: "todos",
        label: "Todos",
        icon: "🍽️",
        norm: "todos",
      },
      ...Array.from(set)
        .sort((a, b) =>
          a.localeCompare(b, "es")
        )
        .map((c) => ({
          id: c,
          label: c,
          icon: iconoPorCategoria(c),
          norm: normalizarTexto(c),
        })),
    ];
  }, [productos]);

  /*
    Productos filtrados para la búsqueda.

    Cuando el usuario escribe algo, se busca entre TODOS
    los productos de todos los restaurantes.
  */
  const productosBuscados = useMemo(() => {
    const q = normalizarTexto(busqueda);
    const catNorm = normalizarTexto(categoriaActiva);

    return productos.filter((p) => {
      const catProducto = normalizarTexto(p.categoria);

      /*
        Filtro por categoría.
      */
      if (
        categoriaActiva !== "todos" &&
        catProducto !== catNorm
      ) {
        return false;
      }

      /*
        Si hay búsqueda, buscamos en todos los campos
        disponibles del producto y restaurante.
      */
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

        if (!texto.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [productos, busqueda, categoriaActiva]);

  /*
    Recomendaciones del día.

    Se agrupan los productos por restaurante y se seleccionan
    máximo 5 productos de cada uno.
  */
  const recomendacionesPorRestaurante = useMemo(() => {
    /*
      Si el usuario está buscando algo, no mostramos
      recomendaciones. Mostramos resultados normales.
    */
    if (busqueda.trim()) {
      return [];
    }

    const productosDisponibles = productos.filter((p) => {
      const disponible =
        p.disponible === undefined ? true : p.disponible;

      if (!disponible) {
        return false;
      }

      /*
        Si hay una categoría seleccionada, también
        aplicamos ese filtro a las recomendaciones.
      */
      if (categoriaActiva !== "todos") {
        return (
          normalizarTexto(p.categoria) ===
          normalizarTexto(categoriaActiva)
        );
      }

      return true;
    });

    /*
      Agrupar productos por restaurante.
    */
    const grupos = {};

    productosDisponibles.forEach((producto) => {
      const restauranteId =
        producto.restaurante?.id || "sin-restaurante";

      const restauranteNombre =
        producto.restaurante?.nombre ||
        "Restaurante";

      if (!grupos[restauranteId]) {
        grupos[restauranteId] = {
          id: restauranteId,
          nombre: restauranteNombre,
          productos: [],
        };
      }

      grupos[restauranteId].productos.push(producto);
    });

    const semillaBase = obtenerSemillaDelDia();

    /*
      Crear máximo 5 recomendaciones por restaurante.
    */
    return Object.values(grupos)
      .map((grupo, index) => {
        const productosMezclados = mezclarProductos(
          grupo.productos,
          semillaBase + index * 137
        );

        return {
          ...grupo,
          productos: productosMezclados.slice(0, 5),
        };
      })
      .filter((grupo) => grupo.productos.length > 0);
  }, [productos, busqueda, categoriaActiva]);

  /*
    Productos mostrados cuando existe una búsqueda.
  */
  const resultadosBusqueda = useMemo(() => {
    if (!busqueda.trim()) {
      return [];
    }

    return productosBuscados;
  }, [productosBuscados, busqueda]);

  const agregarAlCarrito = (producto) => {
    if (!producto?.disponible) {
      showToast(
        "Este producto está agotado",
        "warning"
      );

      return;
    }

    addItem(producto, 1);

    showToast(
      `${producto.nombre} agregado al carrito`,
      "success"
    );
  };

  const formatearPrecio = (n) =>
    Number(n || 0).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
    });

  /*
    Componente para mostrar una tarjeta de producto.
  */
  const TarjetaProducto = ({ producto }) => {
    const disponible =
      producto.disponible === undefined
        ? true
        : producto.disponible;

    return (
      <div
        key={producto.id}
        className="bento-card"
      >
        <Link
          to={`/detalle/${producto.id}`}
          className="bento-inner-link"
        >
          <div
            className="bento-img-mini"
            style={{
              backgroundImage: `url(${obtenerImagen(
                producto.imagen
              )})`,
            }}
          >
            {producto.categoria && (
              <div className="mini-cat-badge">
                {iconoPorCategoria(producto.categoria)}
                <span>{producto.categoria}</span>
              </div>
            )}

            {!disponible && (
              <div className="unavailable-ribbon">
                Agotado
              </div>
            )}
          </div>

          <div className="bento-info-mini">
            <h3 className="bento-title-mini">
              {producto.nombre}
            </h3>

            <p className="bento-desc-mini">
              {producto.descripcion
                ? producto.descripcion.slice(0, 80) +
                  (producto.descripcion.length > 80
                    ? "…"
                    : "")
                : "Sin descripción."}
            </p>

            {producto.restaurante && (
              <Link
                to={`/restaurante/${producto.restaurante.id}`}
                className="bento-rest-link"
                onClick={(e) =>
                  e.stopPropagation()
                }
              >
                <span>🏪</span>{" "}
                {producto.restaurante.nombre}
              </Link>
            )}

            <div className="bento-bottom-mini">
              <div className="bento-price-mini">
                $ {formatearPrecio(producto.precio)}
              </div>

              <button
                type="button"
                className="bento-add-mini"
                disabled={!disponible}
                onClick={(e) => {
                  e.preventDefault();
                  agregarAlCarrito(producto);
                }}
              >
                +
              </button>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <Layout>
      <div className="home-container">

        {/* HERO */}
        <section className="home-hero">
          <div
            className="hero-bg"
            aria-hidden
          />

          <div className="hero-content">
            <div className="hero-welcome">
              <h1 className="hero-title">
                {user?.name
                  ? `Hola, ${
                      user.name.split(" ")[0]
                    } `
                  : "Hola "}

                <span className="hero-emoji">
                  ✨
                </span>
              </h1>

              <p className="hero-subtitle">
                ¿Qué se te antoja hoy? Busca por plato,
                ingrediente o restaurante.
              </p>
            </div>

            {/* BUSCADOR */}
            <div className="hero-search">
              <span
                className="search-icon"
                aria-hidden
              >
                🔎
              </span>

              <input
                type="search"
                className="search-input"
                placeholder="Busca hamburguesa, pizza, sushi..."
                value={busqueda}
                onChange={(e) =>
                  setBusqueda(e.target.value)
                }
              />

              {busqueda && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() =>
                    setBusqueda("")
                  }
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
                style={{
                  textDecoration: "none",
                }}
              >
                🏪 Ver todos los restaurantes
              </Link>
            </div>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className="home-categorias-section">
          <div className="section-head">
            <h2 className="section-title">
              <span className="title-dot" />
              Categorías
            </h2>
          </div>

          <div className="categorias-wrap">
            {categoriasDinamicas.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`cat-stamp ${
                  categoriaActiva === cat.id
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setCategoriaActiva(cat.id)
                }
              >
                <span className="cat-icon">
                  {cat.icon}
                </span>

                <span className="cat-label">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* CONTENIDO PRINCIPAL */}
        <section className="home-bento-section">

          {/* ============================= */}
          {/* BÚSQUEDA */}
          {/* ============================= */}

          {busqueda.trim() ? (
            <>
              <div className="section-head">
                <h2 className="section-title">
                  <span className="title-dot" />
                  Resultados de búsqueda
                </h2>

                <div className="results-pill">
                  {resultadosBusqueda.length} producto
                  {resultadosBusqueda.length === 1
                    ? ""
                    : "s"}
                </div>
              </div>

              {cargando ? (
                <div className="bento-grid">
                  {Array.from({
                    length: 6,
                  }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="bento-card skeleton-card"
                      style={{
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "24px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : resultadosBusqueda.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    🔎
                  </div>

                  <h3>
                    No encontramos productos
                  </h3>

                  <p>
                    Prueba con otro nombre,
                    ingrediente o restaurante.
                  </p>

                  <button
                    type="button"
                    className="btn-primary btn-empty-reset"
                    onClick={() => {
                      setBusqueda("");
                      setCategoriaActiva("todos");
                    }}
                  >
                    Ver recomendaciones
                  </button>
                </div>
              ) : (
                <div className="bento-grid">
                  {resultadosBusqueda.map(
                    (producto) => (
                      <TarjetaProducto
                        key={producto.id}
                        producto={producto}
                      />
                    )
                  )}
                </div>
              )}
            </>
          ) : (

            /* ============================= */
            /* RECOMENDACIONES DEL DÍA */
            /* ============================= */

            <>
              <div className="section-head">
                <h2 className="section-title">
                  <span className="title-dot" />
                  Recomendaciones de hoy
                </h2>

                <div className="results-pill">
                  🗓️ Hoy
                </div>
              </div>

              {cargando ? (
                <div className="bento-grid">
                  {Array.from({
                    length: 10,
                  }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="bento-card skeleton-card"
                      style={{
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "24px",
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : recomendacionesPorRestaurante.length ===
                0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    🍽️
                  </div>

                  <h3>
                    No hay recomendaciones
                  </h3>

                  <p>
                    Todavía no hay productos
                    disponibles para mostrar.
                  </p>

                  <button
                    type="button"
                    className="btn-primary btn-empty-reset"
                    onClick={() =>
                      setCategoriaActiva(
                        "todos"
                      )
                    }
                  >
                    Ver todos
                  </button>
                </div>
              ) : (
                <>
                  {recomendacionesPorRestaurante.map(
                    (grupo) => (
                      <div
                        key={grupo.id}
                        className="restaurant-recommendations"
                        style={{
                          marginBottom: "40px",
                        }}
                      >
                        <div
                          className="section-head"
                          style={{
                            marginBottom: "18px",
                          }}
                        >
                          <h3 className="section-title">
                            <span className="title-dot" />
                            🏪 {grupo.nombre}
                          </h3>

                          {grupo.id !==
                            "sin-restaurante" && (
                            <Link
                              to={`/restaurante/${grupo.id}`}
                              className="btn-primary"
                              style={{
                                textDecoration:
                                  "none",
                                fontSize:
                                  "0.9rem",
                                padding:
                                  "8px 14px",
                              }}
                            >
                              Ver restaurante
                            </Link>
                          )}
                        </div>

                        <div className="bento-grid">
                          {grupo.productos.map(
                            (producto) => (
                              <TarjetaProducto
                                key={
                                  producto.id
                                }
                                producto={
                                  producto
                                }
                              />
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>
    </Layout>
  );
 
}

export default Home;