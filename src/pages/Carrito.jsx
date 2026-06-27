import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/carrito.css";

function Carrito() {
  const [carrito, setCarrito] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(data);
  }, []);

  const actualizarCarrito = (nuevoCarrito) => {
    setCarrito(nuevoCarrito);
    localStorage.setItem("carrito", JSON.stringify(nuevoCarrito));
  };

  const aumentar = (index) => {
    const nuevo = [...carrito];
    nuevo[index].cantidad = (nuevo[index].cantidad || 1) + 1;
    actualizarCarrito(nuevo);
  };

  const disminuir = (index) => {
    const nuevo = [...carrito];
    if ((nuevo[index].cantidad || 1) > 1) {
      nuevo[index].cantidad -= 1;
    } else {
      nuevo.splice(index, 1);
    }
    actualizarCarrito(nuevo);
  };

  const eliminar = (index) => {
    const nuevo = carrito.filter((_, i) => i !== index);
    actualizarCarrito(nuevo);
  };

  const total = carrito.reduce((acc, item) => {
    const precio = Number(item.precio) || 0;
    const cantidad = item.cantidad || 1;
    return acc + precio * cantidad;
  }, 0);

  if (carrito.length === 0) {
    return (
      <div className="carrito-container">
        <h1>🛒 Tu carrito</h1>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "60px", marginBottom: "20px" }}>🛍️</p>
          <h2>Tu carrito está vacío</h2>
          <p>Aún no has agregado productos.</p>
          <Link to="/home">
            <button style={{ 
              padding: "12px 30px", 
              fontSize: "18px", 
              background: "#E53935", 
              color: "white", 
              border: "none", 
              borderRadius: "12px",
              cursor: "pointer",
              marginTop: "20px"
            }}>
              Ir a comprar
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-container">
      <h1>🛒 Tu carrito ({carrito.length} productos)</h1>

      {/* Botón Volver */}
      <Link to="/home" style={{ textDecoration: "none" }}>
        <button style={{ 
          padding: "8px 16px", 
          background: "#ff0000", 
          color: "white", 
          border: "none", 
          borderRadius: "8px",
          marginBottom: "20px",
          cursor: "pointer"
        }}>
          ← Volver a Home
        </button>
      </Link>

      <div className="carrito-lista">
        {carrito.map((item, index) => (
          <div className="carrito-item" key={index}>
            <img src={item.imagen || "https://via.placeholder.com/100"} alt={item.nombre} />

            <div className="carrito-info">
              <h3>{item.nombre}</h3>
              <p>${Number(item.precio || 0).toLocaleString("es-CO")}</p>

              <div className="carrito-controles">
                <button onClick={() => disminuir(index)}>-</button>
                <span>{item.cantidad || 1}</span>
                <button onClick={() => aumentar(index)}>+</button>
              </div>

              <button className="carrito-eliminar" onClick={() => eliminar(index)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="carrito-total">
        <h2>Total: ${total.toLocaleString("es-CO")}</h2>
        
        <button 
          className="btn-pagar"
          style={{
            width: "100%",
            padding: "18px",
            fontSize: "18px",
            fontWeight: "bold",
            background: "#ff0000",
            color: "white",
            border: "none",
            borderRadius: "12px",
            marginTop: "20px",
            cursor: "pointer"
          }}
        >
          💳 Pagar ahora
        </button>
      </div>
    </div>
  );
}

export default Carrito;