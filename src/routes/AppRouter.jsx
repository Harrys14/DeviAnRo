import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Registro from "../pages/Registro";
import Home from "../pages/Home";
import Carrito from "../pages/Carrito";
import Cuenta from "../pages/Cuenta";
import Detalle from "../pages/Detalle";
import Restaurante from "../pages/Restaurante";
import MenuRestaurante from "../pages/MenuRestaurante";
import { ProtectedRoute } from "../auth/ProtectedRoute";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PÚBLICAS: se ven sin login */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/restaurante" element={<Restaurante />} />
        <Route path="/restaurante/:id" element={<MenuRestaurante />} />
        <Route path="/detalle/:id" element={<Detalle />} />

        {/* PROTEGIDAS: solo logueado */}
        <Route
          path="/carrito"
          element={
            <ProtectedRoute>
              <Carrito />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cuenta"
          element={
            <ProtectedRoute>
              <Cuenta />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;