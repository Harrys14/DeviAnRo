import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProductos } from "../services/strapi";
import { useUser, useClerk } from "@clerk/clerk-react";
import "../styles/home.css";

function Home() {

  // =========================
  // ESTADOS PRINCIPALES
  // =========================

  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");
  const [menuOpen, setMenuOpen] = useState(false);

  // =========================
  // INFORMACIÓN DEL USUARIO
  // =========================

  const { user } = useUser();
  const { signOut } = useClerk();

  // =========================
  // CONTROL DEL MENÚ DE USUARIO
  // =========================

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // =========================
  // FILTRAR PRODUCTOS
  // =========================

  const filtrarProductos = (producto) => {

    const coincideCategoria =
      categoriaActiva === "todos" ||
      producto.categoria?.toLowerCase() === categoriaActiva;

    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      (producto.descripcion || "")
        .toLowerCase()
        .includes(busqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;

  };

  // =========================
  // AGREGAR PRODUCTOS AL CARRITO
  // =========================

  const agregarAlCarrito = (producto) => {

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const existe = carrito.find(
      (item) => item.id === producto.id
    );

    if (existe) {

      existe.cantidad = (existe.cantidad || 1) + 1;

    } else {

      carrito.push({
        ...producto,
        cantidad: 1,
      });

    }

    localStorage.setItem(
      "carrito",
      JSON.stringify(carrito)
    );

    alert("✅ Agregado al carrito");

  };

  // =========================
  // CARGAR PRODUCTOS DESDE STRAPI
  // =========================

  useEffect(() => {

    const cargarProductos = async () => {

      try {

        const data = await getProductos();

        console.log("Productos:", data);

        setProductos(data || []);

      } catch (error) {

        console.error(
          "Error cargando productos:",
          error
        );

      }

    };

    cargarProductos();

  }, []);

  return (

    <div className="home-container">

      {/* =========================
          ENCABEZADO PRINCIPAL
      ========================= */}

      <header className="home-header">

        <h1 className="home-logo">
          DeviAnRo
        </h1>

        <div className="home-header-right">

          {/* UBICACIÓN DEL USUARIO */}

          <div className="home-location">
            Bogotá
          </div>

          {/* MENÚ DE CUENTA */}

          <div
            className="home-account-wrapper"
            style={{ position: "relative" }}
          >

            <img
              src={
                user?.imageUrl ||
                "https://via.placeholder.com/50"
              }
              alt="Cuenta"
              onClick={toggleMenu}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                cursor: "pointer",
                border: "1px solid white"
              }}
            />

            {menuOpen && (

              <div
                className="home-menu-dropdown"
                style={{
                  position: "absolute",
                  right: "0",
                  top: "50px",
                  background: "white",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.2)",
                  borderRadius: "8px",
                  padding: "10px",
                  zIndex: 100
                }}
              >

                {/* OPCIONES DEL MENÚ */}

                <Link
                  to="/carrito"
                  style={{
                    display: "block",
                    padding: "10px"
                  }}
                >
                  🛒 Carrito
                </Link>

                <Link
                  to="/cuenta"
                  style={{
                    display: "block",
                    padding: "10px"
                  }}
                >
                  👤 Mi Cuenta
                </Link>

                <button
                  onClick={() =>
                    signOut({
                      redirectUrl: "/"
                    })
                  }
                  style={{
                    display: "block",
                    padding: "10px",
                    background: "none",
                    border: "none",
                    width: "100%",
                    textAlign: "left",
                    color: "red"
                  }}
                >
                  🚪 Cerrar sesión
                </button>

              </div>

            )}

          </div>

        </div>

      </header>
            {/* =========================
          MENSAJE DE BIENVENIDA
      ========================= */}

      <div className="home-welcome">
        Bienvenido {user?.name || <span className="emoji-saludo">👋</span>}
      </div>

      {/* =========================
          BUSCADOR DE PRODUCTOS
      ========================= */}

      <input
        className="home-search"
        placeholder="Buscar hamburguesa, pizza, sushi..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* =========================
          ACCESO A RESTAURANTES
      ========================= */}

      <Link
        to="/restaurante"
        className="home-restaurante-btn"
      >

        <div className="home-restaurante-content">

          <span className="home-restaurante-icon">
            🍔
          </span>

          <div>

            <h3>
              Explorar Restaurantes
            </h3>

            <p>
              Descubre todos los restaurantes disponibles
            </p>

          </div>

        </div>

      </Link>

      {/* =========================
          SECCIÓN DE CATEGORÍAS
      ========================= */}

      <h3 className="home-section-title">
        Categorías
      </h3>

      <div className="home-categories">

        {[
          "todos",
          "hamburguesas",
          "pizzas",
          "postres",
          "bebidas",
          "sopas",
          "entradas",
          "pollo",
          "carnes"
        ].map((cat) => (

          <div
            key={cat}
            className={`home-category ${
              categoriaActiva === cat ? "active" : ""
            }`}
            onClick={() => setCategoriaActiva(cat)}
          >

            {cat}

          </div>

        ))}

      </div>

      {/* =========================
          LISTADO DE PRODUCTOS
      ========================= */}

      <div className="home-products">

        {productos.length === 0 ? (

          <p>
            Cargando productos...
          </p>

        ) : (

          productos
            .filter(filtrarProductos)
            .map((producto) => {

              {/* =========================
                  OBTENER IMAGEN DE STRAPI
              ========================= */}

              let imagen = "https://via.placeholder.com/400";

              const img = producto.imagen;

              if (img?.data?.attributes?.url) {

                imagen =
                  `http://localhost:1337${img.data.attributes.url}`;

              } else if (img?.url) {

                imagen =
                  `http://localhost:1337${img.url}`;

              } else if (Array.isArray(img) && img.length > 0) {

                imagen =
                  `http://localhost:1337${img[0].url || img[0].attributes?.url}`;

              }

              {/* =========================
                  FORMATO DEL PRECIO
              ========================= */}

              const precio = Number(producto.precio || 0)
                .toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                });

              return (

                <div
                  className="home-product-card"
                  key={producto.id}
                >

                  {/* IMAGEN DEL PRODUCTO */}

                  <img
                    src={imagen}
                    alt={producto.nombre}
                    className="home-product-img"
                  />

                  {/* INFORMACIÓN DEL PRODUCTO */}

                  <div className="home-product-info">

                    <h3>
                      {producto.nombre}
                    </h3>

                    <p>
                      {producto.descripcion}
                    </p>

                    {/* PRECIO Y RESTAURANTE */}

                    <div className="home-product-bottom">

                      <div className="home-price">
                        $ {precio}
                      </div>

                      <div className="home-product-restaurante">

                        <span className="home-product-restaurante-icon">
                          🏪
                        </span>

                        <span>
                          {producto.restaurante?.nombre || "Restaurante no asignado"}
                        </span>

                      </div>

                    </div>
                    
                    {/* BOTÓN DE DETALLE */}

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "15px"
                      }}
                    >

                      <Link
                        to={`/detalle/${producto.id}`}
                        style={{ flex: 1 }}
                      >

                        <button
                          className="home-btn"
                          style={{ width: "100%" }}
                        >

                          Ver detalle

                        </button>

                      </Link>

                    </div>

                  </div>

                </div>

              );

            })

        )}

      </div>

    </div>

  );

}
export default Home;