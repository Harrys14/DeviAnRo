const API_URL = "http://localhost:1337/api";
const STRAPI_BASE = "http://localhost:1337";
const IMG_PLACEHOLDER = "https://via.placeholder.com/400";

/* =========================================================
   IMÁGENES
========================================================= */

export const obtenerImagen = (img) => {
  if (!img) return IMG_PLACEHOLDER;

  /* Strapi v4 */
  if (img.data?.attributes?.url) {
    return `${STRAPI_BASE}${img.data.attributes.url}`;
  }

  /* Strapi v5 / objeto directo */
  if (img.url) {
    return `${STRAPI_BASE}${img.url}`;
  }

  /* Imagen como array */
  if (Array.isArray(img) && img.length > 0) {
    const url =
      img[0].url ||
      img[0].attributes?.url;

    if (url) {
      return `${STRAPI_BASE}${url}`;
    }
  }

  /* Otra estructura posible */
  if (img.data?.url) {
    return `${STRAPI_BASE}${img.data.url}`;
  }

  return IMG_PLACEHOLDER;
};


/* =========================================================
   EXTRAER RELACIONES DE STRAPI
========================================================= */

const extraerRelacion = (rel) => {
  if (!rel) return null;

  /* Relación con data */
  if (rel.data) {

    /* Relación múltiple */
    if (Array.isArray(rel.data)) {
      return rel.data.map((item) => ({
        id: item.id,
        ...(item.attributes || item),
      }));
    }

    /* Relación única */
    return {
      id: rel.data.id,
      ...(rel.data.attributes || rel.data),
    };
  }

  /* Relación directa */
  if (rel.id !== undefined) {
    return rel;
  }

  return null;
};


/* =========================================================
   NORMALIZAR PRODUCTO
========================================================= */

export const normalizarProducto = (productoRaw) => {
  if (!productoRaw) return null;

  const attrs =
    productoRaw.attributes || productoRaw;

  /*
    Obtener restaurante relacionado.
    Se intenta encontrar la relación usando
    diferentes estructuras compatibles con Strapi.
  */
  const restaurante =
    extraerRelacion(attrs.restaurante) ||
    extraerRelacion(attrs.Restaurante) ||
    extraerRelacion(attrs.restaurant);


  return {
    id: String(
      productoRaw.id ??
      attrs.id
    ),

    nombre:
      attrs.nombre ||
      "",

    descripcion:
      attrs.descripcion ||
      "",

    precio:
      Number(attrs.precio ?? 0),

    categoria:
      (attrs.categoria || "").trim(),

    disponible:
      attrs.disponible === undefined
        ? true
        : Boolean(attrs.disponible),

    destacado:
      Boolean(attrs.destacado || false),

    ingredientes:
      attrs.ingredientes ||
      "",

    imagen:
      attrs.imagen ||
      null,

    calificacion:
      Number(attrs.calificacion || 0) || null,

    /*
      INFORMACIÓN DEL RESTAURANTE
    */
    restaurante: restaurante
      ? {
          id: String(restaurante.id),

          nombre:
            restaurante.nombre ||
            restaurante.name ||
            "Restaurante",

          calificacion:
            Number(
              restaurante.calificacion ||
              restaurante.rating ||
              0
            ) || null,

          abierto:
            restaurante.abierto !== false,

          categoria:
            (
              restaurante.categoria ||
              ""
            ).trim(),

          ciudad:
            (
              restaurante.ciudad ||
              ""
            ).trim(),

          direccion:
            (
              restaurante.direccion ||
              ""
            ).trim(),

          descripcion:
            restaurante.descripcion ||
            "",

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

          colorSecundario:
            restaurante.colorSecundario ||
            restaurante.color_secundario ||
            "#FFFFFF",

          colorFondo:
            restaurante.colorFondo ||
            restaurante.color_fondo ||
            "#f8f9fb",
        }
      : null,

    createdAt:
      attrs.createdAt,

    updatedAt:
      attrs.updatedAt,
  };
};


/* =========================================================
   NORMALIZAR RESTAURANTE
========================================================= */

export const normalizarRestaurante = (restauranteRaw) => {
  if (!restauranteRaw) return null;

  const attrs =
    restauranteRaw.attributes ||
    restauranteRaw;

  const productos =
    extraerRelacion(attrs.productos);


  return {
    id: String(
      restauranteRaw.id ??
      attrs.id
    ),

    nombre:
      attrs.nombre ||
      attrs.name ||
      "",

    descripcion:
      attrs.descripcion ||
      "",

    calificacion:
      Number(
        attrs.calificacion || 0
      ),

    abierto:
      attrs.abierto !== false,

    categoria:
      attrs.categoria ||
      "General",

    ciudad:
      attrs.ciudad ||
      "",

    direccion:
      attrs.direccion ||
      "",

    colorPrincipal:
      attrs.colorPrincipal ||
      attrs.color_principal ||
      "#E53935",

    colorSecundario:
      attrs.colorSecundario ||
      attrs.color_secundario ||
      "#FFFFFF",

    colorFondo:
      attrs.colorFondo ||
      attrs.color_fondo ||
      "#f8f9fb",

    imagen:
      attrs.imagen ||
      attrs.foto ||
      attrs.logo ||
      attrs.portada ||
      null,

    productos:
      Array.isArray(productos)
        ? productos
        : [],

    createdAt:
      attrs.createdAt,

    updatedAt:
      attrs.updatedAt,
  };
};


/* =========================================================
   PRODUCTOS
========================================================= */

export const getProductos = async () => {
  try {
    const res = await fetch(
      `${API_URL}/productos?populate=*&pagination[pageSize]=100&sort[createdAt]=desc`
    );

    if (!res.ok) {
      throw new Error(
        `Error HTTP ${res.status}`
      );
    }

    const data = await res.json();

    const lista =
      data.data || [];

    return lista
      .map(normalizarProducto)
      .filter(Boolean);

  } catch (error) {

    console.log(
      "Error getProductos:",
      error
    );

    return [];
  }
};


/* =========================================================
   PRODUCTO POR ID
========================================================= */

export const getProductoById = async (id) => {
  try {

    const res = await fetch(
      `${API_URL}/productos?filters[id][$eq]=${id}&populate=*`
    );

    if (!res.ok) {
      throw new Error(
        `Error HTTP ${res.status}`
      );
    }

    const data =
      await res.json();

    const item =
      data.data?.[0];

    return item
      ? normalizarProducto(item)
      : null;

  } catch (error) {

    console.log(
      "Error getProductoById:",
      error
    );

    return null;
  }
};


/* =========================================================
   PRODUCTOS POR RESTAURANTE
========================================================= */

export const getProductosPorRestaurante = async (
  restauranteId
) => {

  try {

    const url =
      `${API_URL}/productos` +
      `?filters[restaurante][id][$eq]=${restauranteId}` +
      `&populate=*` +
      `&sort[createdAt]=desc`;

    console.log(
      "URL PRODUCTOS:",
      url
    );

    const res =
      await fetch(url);

    if (!res.ok) {
      throw new Error(
        `Error HTTP ${res.status}`
      );
    }

    const data =
      await res.json();

    console.log(
      "RESPUESTA PRODUCTOS:",
      data
    );

    const lista =
      data.data || [];

    return lista
      .map(normalizarProducto)
      .filter(Boolean);

  } catch (error) {

    console.log(
      "Error getProductosPorRestaurante:",
      error
    );

    return [];
  }
};


/* =========================================================
   RESTAURANTES
========================================================= */

export const getRestaurantes = async () => {

  try {

    const res = await fetch(
      `${API_URL}/restaurantes?populate=*&pagination[pageSize]=100`
    );

    if (!res.ok) {
      throw new Error(
        `Error HTTP ${res.status}`
      );
    }

    const data =
      await res.json();

    const lista =
      data.data || [];

    return lista
      .map(normalizarRestaurante)
      .filter(Boolean);

  } catch (error) {

    console.log(
      "Error getRestaurantes:",
      error
    );

    return [];
  }
};


/* =========================================================
   RESTAURANTE POR ID
========================================================= */

export const getRestauranteById = async (id) => {

  try {

    const res = await fetch(
      `${API_URL}/restaurantes/${id}?populate=*`
    );

    /*
      Si el ID no existe en Strapi,
      devolvemos null sin romper la aplicación.
    */
    if (!res.ok) {

      console.log(
        `Restaurante ${id} no encontrado. HTTP ${res.status}`
      );

      return null;
    }

    const data =
      await res.json();

    return data.data
      ? normalizarRestaurante(data.data)
      : null;

  } catch (error) {

    console.error(
      "Error getRestauranteById:",
      error
    );

    return null;
  }
};


/* =========================================================
   PEDIDOS
========================================================= */

export const crearPedido = async (
  pedidoData,
  userId
) => {

  try {

    const res =
      await fetch(
        `${API_URL}/pedidos`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            data: {
              ...pedidoData,
              userId,
            },
          }),
        }
      );

    const data =
      await res.json();

    return data;

  } catch (error) {

    console.log(
      "Error crearPedido:",
      error
    );

    return null;
  }
};


/* =========================================================
   MIS PEDIDOS
========================================================= */

export const getMisPedidos = async (
  userId
) => {

  try {

    const res =
      await fetch(
        `${API_URL}/pedidos?filters[userId][$eq]=${userId}`
      );

    if (!res.ok) {
      throw new Error(
        `Error HTTP ${res.status}`
      );
    }

    const data =
      await res.json();

    return data.data || [];

  } catch (error) {

    console.log(
      "Error getMisPedidos:",
      error
    );

    return [];
  }
};