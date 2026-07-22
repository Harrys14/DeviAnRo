import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProductos } from "../services/strapi";
import "../styles/carrito.css";

function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const navigate = useNavigate();

  // =========================
  // OBTENER IMAGEN DE STRAPI
  // =========================

  const obtenerImagen = (producto) => {

    let imagen = "https://via.placeholder.com/400";

    const img = producto.imagen;

    if (img?.data?.attributes?.url) {

      imagen = `http://localhost:1337${img.data.attributes.url}`;

    } else if (img?.url) {

      imagen = `http://localhost:1337${img.url}`;

    } else if (Array.isArray(img) && img.length > 0) {

      imagen = `http://localhost:1337${img[0].url || img[0].attributes?.url}`;

    }

    return imagen;

  };

  // =========================
  // CARGAR CARRITO
  // =========================

  useEffect(() => {

    const data =
      JSON.parse(localStorage.getItem("carrito")) || [];

    setCarrito(data);

  }, []);

  // =========================
  // CARGAR RECOMENDACIONES DESDE STRAPI
  // =========================

  useEffect(() => {

    const cargarRecomendaciones = async () => {

      try {

        const productos = await getProductos();

        const aleatorios =
          [...productos]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        setRecomendaciones(aleatorios);

      } catch(error) {

        console.error(
          "Error cargando recomendaciones:",
          error
        );

      }

    };

    cargarRecomendaciones();

  }, []);

  // =========================
  // ACTUALIZAR CARRITO
  // =========================

  const actualizarCarrito = (nuevoCarrito) => {

    setCarrito(nuevoCarrito);

    localStorage.setItem(
      "carrito",
      JSON.stringify(nuevoCarrito)
    );

  };

  // =========================
  // AUMENTAR CANTIDAD
  // =========================

  const aumentar = (index) => {

    const nuevo = [...carrito];

    nuevo[index].cantidad =
      (nuevo[index].cantidad || 1) + 1;

    actualizarCarrito(nuevo);

  };

  // =========================
  // DISMINUIR CANTIDAD
  // =========================

  const disminuir = (index) => {

    const nuevo = [...carrito];

    if ((nuevo[index].cantidad || 1) > 1) {

      nuevo[index].cantidad -= 1;

    } else {

      nuevo.splice(index, 1);

    }

    actualizarCarrito(nuevo);

  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================

  const eliminar = (index) => {

    const nuevo =
      carrito.filter(
        (_, i) => i !== index
      );

    actualizarCarrito(nuevo);

  };

  // =========================
  // TOTAL
  // =========================

  const total = carrito.reduce(

    (acc, item) => {

      const precio =
        Number(item.precio) || 0;

      const cantidad =
        item.cantidad || 1;

      return acc + precio * cantidad;

    },

    0

  );
    return (

    <>

      <div className="carrito-container">

        <div className="carrito-header">

          <Link
            to="/home"
            className="carrito-logo"
          >
            DeviAnRo
          </Link>

          <Link
            to="/home"
            className="carrito-volver"
          >
            ← Volver
          </Link>

        </div>

        {
          carrito.length === 0 ? (

            <div className="carrito-vacio">

              <div className="carrito-vacio-icon">
                🛒
              </div>

              <h2>
                Tu carrito está vacío
              </h2>

              <p>
                Agrega productos para comenzar tu pedido.
              </p>

              <Link
                to="/home"
                className="carrito-comprar"
              >
                Ir a comprar
              </Link>

            </div>

          ) : (

            <>

              <h1 className="carrito-title">
                🛒 Tu carrito
              </h1>

              <p className="carrito-subtitle">
                {carrito.length} productos seleccionados
              </p>

              <div className="carrito-lista">

                {
                  carrito.map((item, index) => (

                    <div
                      className="carrito-item"
                      key={item.id || index}
                    >

                      <Link
                        to={`/detalle/${item.id}`}
                      >

                        <img
                          src={obtenerImagen(item)}
                          alt={item.nombre}
                        />

                      </Link>

                      <div className="carrito-info">

                        <Link
                          to={`/detalle/${item.id}`}
                          className="carrito-link"
                        >

                          <h3>
                            {item.nombre}
                          </h3>

                        </Link>

                        <div className="carrito-precio">

                          $
                          {Number(item.precio || 0)
                            .toLocaleString("es-CO")}

                        </div>

                        <div className="carrito-controles">

                          <button
                            onClick={() => disminuir(index)}
                          >
                            −
                          </button>

                          <span>
                            {item.cantidad || 1}
                          </span>

                          <button
                            onClick={() => aumentar(index)}
                          >
                            +
                          </button>

                        </div>

                        <button
                          className="carrito-eliminar"
                          onClick={() => eliminar(index)}
                        >
                          Eliminar
                        </button>

                      </div>

                    </div>

                  ))
                }

              </div>

              <div className="carrito-total">

                <h2>
                  Total:
                  $
                  {total.toLocaleString("es-CO")}
                </h2>

                <button className="btn-pagar">
                  💳 Pagar ahora
                </button>

              </div>

            </>

          )

        }

      </div>

      {/* =========================
          RECOMENDACIONES
      ========================= */}

      {
        recomendaciones.length > 0 && (

          <div className="carrito-recomendaciones">


            <div className="recomendaciones-header">

              <h2>
                🍔 Lo recomendado para ti
              </h2>

              <p>
                Descubre algunos productos que podrían gustarte.
              </p>

            </div>



            <div className="recomendaciones-grid">

              {
                recomendaciones.map((producto) => (

                  <div
                    key={producto.id}
                    className="recomendacion-card"
                    onClick={() =>
                      navigate(`/detalle/${producto.id}`)
                    }
                  >

                    <img
                      src={obtenerImagen(producto)}
                      alt={producto.nombre}
                    />


                    <div className="recomendacion-info">

                      <h4>
                        {producto.nombre}
                      </h4>

                      <p>
                        $
                        {Number(producto.precio || 0)
                          .toLocaleString("es-CO")}
                      </p>

                    </div>


                  </div>

                ))
              }


            </div>


          </div>

        )

      }


    </>

  );

}


export default Carrito;