import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "carrito";

function leerCarrito() {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (error) {
    console.error("Error leyendo carrito:", error);
    return [];
  }
}

function guardarCarrito(items) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Error guardando carrito:", error);
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => leerCarrito());

  useEffect(() => {
    guardarCarrito(items);
  }, [items]);

  const addItem = useCallback((producto, cantidad = 1) => {
    if (!producto) return;
    const cantidadFinal = Math.max(1, Number(cantidad) || 1);
    setItems((prev) => {
      const existeIdx = prev.findIndex((i) => i.id === producto.id);
      if (existeIdx >= 0) {
        const copia = [...prev];
        copia[existeIdx] = {
          ...copia[existeIdx],
          cantidad: (copia[existeIdx].cantidad || 1) + cantidadFinal,
        };
        return copia;
      }
      return [...prev, { ...producto, cantidad: cantidadFinal }];
    });
  }, []);

  const updateQuantity = useCallback((index, delta) => {
    setItems((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const copia = [...prev];
      const actual = copia[index].cantidad || 1;
      const nueva = actual + delta;
      if (nueva <= 0) {
        copia.splice(index, 1);
      } else {
        copia[index] = { ...copia[index], cantidad: nueva };
      }
      return copia;
    });
  }, []);

  const removeItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + (i.cantidad || 1), 0),
    [items]
  );

  const totalPrice = useMemo(
    () =>
      items.reduce(
        (acc, i) => acc + (Number(i.precio) || 0) * (i.cantidad || 1),
        0
      ),
    [items]
  );

  const value = {
    items,
    totalItems,
    totalPrice,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return ctx;
}
