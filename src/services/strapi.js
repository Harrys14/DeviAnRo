const API_URL = "http://localhost:1337/api";
const STRAPI_BASE = "http://localhost:1337";
const IMG_PLACEHOLDER = "https://via.placeholder.com/400";

export const obtenerImagen = (img) => {
  if (!img) return IMG_PLACEHOLDER;
  if (img.data?.attributes?.url) {
    return `${STRAPI_BASE}${img.data.attributes.url}`;
  }
  if (img.url) {
    return `${STRAPI_BASE}${img.url}`;
  }
  if (Array.isArray(img) && img.length > 0) {
    return `${STRAPI_BASE}${img[0].url || img[0].attributes?.url}`;
  }
  if (img.data?.url) {
    return `${STRAPI_BASE}${img.data.url}`;
  }
  return IMG_PLACEHOLDER;
};

const extraerRelacion = (rel) => {
  if (!rel) return null;
  if (rel.data) {
    if (Array.isArray(rel.data)) {
      return rel.data.map((item) => ({
        id: item.id,
        ...(item.attributes || {}),
      }));
    }
    return {
      id: rel.data.id,
      ...(rel.data.attributes || {}),
    };
  }
  if (rel.id !== undefined) {
    return rel;
  }
  return null;
};

export const normalizarProducto = (productoRaw) => {
  if (!productoRaw) return null;
  const attrs = productoRaw.attributes || productoRaw;
  const restaurante = extraerRelacion(attrs.restaurante);
  return {
    id: String(productoRaw.id ?? attrs.id),
    nombre: attrs.nombre || "",
    descripcion: attrs.descripcion || "",
    precio: Number(attrs.precio ?? 0),
    categoria: (attrs.categoria || "").trim(),
    disponible: attrs.disponible === undefined ? true : Boolean(attrs.disponible),
    destacado: Boolean(attrs.destacado || false),
    ingredientes: attrs.ingredientes || "",
    imagen: attrs.imagen || null,
    calificacion: Number(attrs.calificacion || 0) || null,
    restaurante: restaurante
      ? {
          id: String(restaurante.id),
          nombre: restaurante.nombre || "Restaurante",
          calificacion: Number(restaurante.calificacion || 0) || null,
          abierto: restaurante.abierto !== false,
          categoria: (restaurante.categoria || "").trim(),
          ciudad: (restaurante.ciudad || "").trim(),
          direccion: (restaurante.direccion || "").trim(),
          imagen:
            restaurante.imagen ||
            restaurante.foto ||
            restaurante.logo ||
            restaurante.portada ||
            null,
          colorPrincipal:
            restaurante.colorPrincipal ||
            restaurante.color_principal ||
            "#E53935",
        }
      : null,
    createdAt: attrs.createdAt,
    updatedAt: attrs.updatedAt,
  };
};

export const normalizarRestaurante = (restauranteRaw) => {
  if (!restauranteRaw) return null;
  const attrs = restauranteRaw.attributes || restauranteRaw;
  const productos = extraerRelacion(attrs.productos);
  return {
    id: restauranteRaw.id ?? attrs.id,
    nombre: attrs.nombre || "",
    descripcion: attrs.descripcion || "",
    calificacion: Number(attrs.calificacion) || 0,
    abierto: attrs.abierto !== false,
    categoria: attrs.categoria || "General",
    ciudad: attrs.ciudad || "",
    direccion: attrs.direccion || "",
    colorPrincipal: attrs.colorPrincipal || attrs.color_principal || "#E53935",
    colorSecundario: attrs.colorSecundario || attrs.color_secundario || "#FFFFFF",
    colorFondo: attrs.colorFondo || attrs.color_fondo || "#f8f9fb",
    imagen: attrs.imagen || attrs.foto || attrs.logo || attrs.portada || null,
    productos: Array.isArray(productos) ? productos : [],
    createdAt: attrs.createdAt,
    updatedAt: attrs.updatedAt,
  };
};

/* PRODUCTOS */
export const getProductos = async () => {
  try {
    const res = await fetch(
      `${API_URL}/productos?populate=*&pagination[pageSize]=100&sort[createdAt]=desc`
    );
    const data = await res.json();
    const lista = data.data || [];
    return lista.map(normalizarProducto).filter(Boolean);
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
    const item = data.data?.[0];
    return item ? normalizarProducto(item) : null;
  } catch (error) {
    console.log("Error getProductoById:", error);
    return null;
  }
};

/* PRODUCTOS POR RESTAURANTE */
export const getProductosPorRestaurante = async (restauranteId) => {
  try {
    const res = await fetch(
      `${API_URL}/productos?filters[restaurante][id][$eq]=${restauranteId}&populate=*&sort[createdAt]=desc`
    );
    const data = await res.json();
    const lista = data.data || [];
    return lista.map(normalizarProducto).filter(Boolean);
  } catch (error) {
    console.log("Error getProductosPorRestaurante:", error);
    return [];
  }
};

/* RESTAURANTES */
export const getRestaurantes = async () => {
  try {
    const res = await fetch(
      `${API_URL}/restaurantes?populate=*&pagination[pageSize]=100`
    );
    const data = await res.json();
    const lista = data.data || [];
    return lista.map(normalizarRestaurante).filter(Boolean);
  } catch (error) {
    console.log("Error getRestaurantes:", error);
    return [];
  }
};

export const getRestauranteById = async (id) => {
  try {
    const res = await fetch(
      `${API_URL}/restaurantes/${id}?populate=*`
    );
    const data = await res.json();
    return data.data ? normalizarRestaurante(data.data) : null;
  } catch (error) {
    console.error("Error getRestauranteById:", error);
    return null;
  }
};

/* PEDIDOS */
export const crearPedido = async (pedidoData, userId) => {
  try {
    const res = await fetch(
      `${API_URL}/pedidos`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          data:{
            ...pedidoData,
            userId,
          }
        })
      }
    );
    const data = await res.json();
    return data;
  } catch(error){
    console.log(
      "Error crearPedido:",
      error
    );
    return null;
  }
};

export const getMisPedidos = async (userId) => {
  try {
    const res = await fetch(
      `${API_URL}/pedidos?filters[userId][$eq]=${userId}`
    );
    const data = await res.json();
    return data.data || [];
  } catch(error){
    console.log(
      "Error getMisPedidos:",
      error
    );
    return [];
  }
};