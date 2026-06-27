const API_URL = "http://localhost:1337/api";

/* =========================
   PRODUCTOS
========================= */

export const getProductos = async () => {
  try {
    const res = await fetch(`${API_URL}/productos?populate=*`);
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.log("Error getProductos:", error);
    return [];
  }
};

export const getProductoById = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/productos?filters[id][$eq]=${id}&populate=*`
    );
    const data = await res.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.log("Error getProductoById:", error);
    return null;
  }
};