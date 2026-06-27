import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Carrito from "./pages/Carrito";
import Cuenta from "./pages/Cuenta";
import Detalle from "./pages/Detalle";

function App() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return <div style={{padding: "100px", fontSize: "28px", textAlign: "center"}}>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login - Solo usuarios no logueados */}
        <Route 
          path="/" 
          element={
            <SignedOut>
              <Login />
            </SignedOut>
          } 
        />

        {/* Rutas protegidas */}
        <Route path="/home" element={<SignedIn><Home /></SignedIn>} />
        <Route path="/carrito" element={<SignedIn><Carrito /></SignedIn>} />
        <Route path="/cuenta" element={<SignedIn><Cuenta /></SignedIn>} />
        <Route path="/detalle/:id" element={<SignedIn><Detalle /></SignedIn>} />

        {/* Redirección para usuarios logueados que entren a / */}
        <Route 
          path="/" 
          element={
            <SignedIn>
              <Navigate to="/home" replace />
            </SignedIn>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;