const http = require('http');

const restaurantes = [
  {
    id: 1,
    nombre: 'La Parrilla de Don Pepe',
    categoria: 'Carnes y Parrillas',
    calificacion: 4.8,
    tiempoEntrega: '25-35 min',
    costoEnvio: 2.50,
    imagen: 'https://via.placeholder.com/300x200?text=La+Parrilla+de+Don+Pepe',
    direccion: 'Av. Libertador 1234, Buenos Aires',
    abierto: true
  },
  {
    id: 2,
    nombre: 'Sushi Tokio Express',
    categoria: 'Japonesa',
    calificacion: 4.6,
    tiempoEntrega: '30-45 min',
    costoEnvio: 3.00,
    imagen: 'https://via.placeholder.com/300x200?text=Sushi+Tokio+Express',
    direccion: 'Calle Florida 567, Buenos Aires',
    abierto: true
  },
  {
    id: 3,
    nombre: 'Pizzería Napolitana',
    categoria: 'Pizzas e Italiana',
    calificacion: 4.5,
    tiempoEntrega: '20-30 min',
    costoEnvio: 1.50,
    imagen: 'https://via.placeholder.com/300x200?text=Pizzeria+Napolitana',
    direccion: 'Corrientes 890, Buenos Aires',
    abierto: false
  }
];

const productos = [
  { id: 1, nombre: 'Bife de Chorizo', descripcion: 'Jugoso bife de chorizo a la parrilla con chimichurri', precio: 1850.00, categoria: 'carnes', restauranteId: 1, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Bife+de+Chorizo' },
  { id: 2, nombre: 'Asado de Tira', descripcion: 'Costillas de res asadas al carbón, tiernas y sabrosas', precio: 2100.00, categoria: 'carnes', restauranteId: 1, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Asado+de+Tira' },
  { id: 3, nombre: 'Empanadas de Carne (x6)', descripcion: 'Empanadas criollas rellenas de carne cortada a cuchillo', precio: 950.00, categoria: 'entradas', restauranteId: 1, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Empanadas' },
  { id: 4, nombre: 'Roll California', descripcion: 'Roll de cangrejo, palta y pepino con salsa de soja', precio: 1200.00, categoria: 'sushi', restauranteId: 2, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Roll+California' },
  { id: 5, nombre: 'Sashimi de Salmón', descripcion: 'Finas láminas de salmón fresco con wasabi y jengibre', precio: 1550.00, categoria: 'sushi', restauranteId: 2, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Sashimi+Salmon' },
  { id: 6, nombre: 'Ramen Tonkotsu', descripcion: 'Caldo de cerdo cremoso con fideos, huevo y chashu', precio: 1350.00, categoria: 'sopas', restauranteId: 2, disponible: false, imagen: 'https://via.placeholder.com/200x150?text=Ramen+Tonkotsu' },
  { id: 7, nombre: 'Pizza Margherita', descripcion: 'Salsa de tomate, mozzarella fresca y albahaca', precio: 1100.00, categoria: 'pizzas', restauranteId: 3, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Pizza+Margherita' },
  { id: 8, nombre: 'Pizza Cuatro Quesos', descripcion: 'Mozzarella, provolone, gorgonzola y parmesano', precio: 1300.00, categoria: 'pizzas', restauranteId: 3, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Pizza+Cuatro+Quesos' },
  { id: 9, nombre: 'Tiramisú', descripcion: 'Clásico postre italiano con mascarpone y café', precio: 650.00, categoria: 'postres', restauranteId: 3, disponible: true, imagen: 'https://via.placeholder.com/200x150?text=Tiramisu' }
];

const pedidosPasados = [
  {
    id: 'PED-20240101-001',
    fecha: '2024-01-15T19:30:00Z',
    estado: 'entregado',
    restaurante: 'La Parrilla de Don Pepe',
    items: [
      { productoId: 1, nombre: 'Bife de Chorizo', cantidad: 2, precioUnitario: 1850.00 },
      { productoId: 3, nombre: 'Empanadas de Carne (x6)', cantidad: 1, precioUnitario: 950.00 }
    ],
    subtotal: 4650.00,
    costoEnvio: 2.50,
    total: 4652.50,
    direccionEntrega: 'Av. Corrientes 1500, CABA',
    metodoPago: 'tarjeta_credito'
  },
  {
    id: 'PED-20240110-002',
    fecha: '2024-01-22T20:15:00Z',
    estado: 'entregado',
    restaurante: 'Sushi Tokio Express',
    items: [
      { productoId: 4, nombre: 'Roll California', cantidad: 2, precioUnitario: 1200.00 },
      { productoId: 5, nombre: 'Sashimi de Salmón', cantidad: 1, precioUnitario: 1550.00 }
    ],
    subtotal: 3950.00,
    costoEnvio: 3.00,
    total: 3953.00,
    direccionEntrega: 'Av. Corrientes 1500, CABA',
    metodoPago: 'efectivo'
  }
];

function generateOrderId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `PED-${datePart}-${randomPart}`;
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const method = req.method;
  const parsedUrl = new URL(req.url, `http://localhost`);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // @endpoint GET /restaurantes
  if (method === 'GET' && pathname === '/restaurantes') {
    sendJSON(res, 200, {
      success: true,
      total: restaurantes.length,
      data: restaurantes
    });
    return;
  }

  // @endpoint GET /productos
  if (method === 'GET' && pathname === '/productos') {
    const categoria = parsedUrl.searchParams.get('categoria');
    const restauranteId = parsedUrl.searchParams.get('restauranteId');
    let resultado = [...productos];
    if (categoria) {
      resultado = resultado.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
    }
    if (restauranteId) {
      resultado = resultado.filter(p => p.restauranteId === parseInt(restauranteId));
    }
    sendJSON(res, 200, {
      success: true,
      total: resultado.length,
      filtros: { categoria: categoria || null, restauranteId: restauranteId || null },
      data: resultado
    });
    return;
  }

  // @endpoint GET /pedidos/mis-pedidos
  if (method === 'GET' && pathname === '/pedidos/mis-pedidos') {
    sendJSON(res, 200, {
      success: true,
      total: pedidosPasados.length,
      data: pedidosPasados
    });
    return;
  }

  // @endpoint GET /productos/:id
  const productoMatch = pathname.match(/^\/productos\/(\d+)$/);
  if (method === 'GET' && productoMatch) {
    const id = parseInt(productoMatch[1]);
    const producto = productos.find(p => p.id === id);
    if (!producto) {
      sendJSON(res, 404, { success: false, mensaje: `Producto con ID ${id} no encontrado` });
      return;
    }
    sendJSON(res, 200, { success: true, data: producto });
    return;
  }

  // @endpoint POST /pedidos
  if (method === 'POST' && pathname === '/pedidos') {
    try {
      const body = await getBody(req);
      const { items, direccionEntrega, metodoPago, restauranteId } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        sendJSON(res, 400, { success: false, mensaje: 'El campo "items" es requerido y debe ser un arreglo no vacío' });
        return;
      }
      if (!direccionEntrega) {
        sendJSON(res, 400, { success: false, mensaje: 'El campo "direccionEntrega" es requerido' });
        return;
      }

      const restaurante = restaurantes.find(r => r.id === restauranteId);
      const subtotal = items.reduce((sum, item) => {
        const producto = productos.find(p => p.id === item.productoId);
        return sum + (producto ? producto.precio * (item.cantidad || 1) : 0);
      }, 0);
      const costoEnvio = restaurante ? restaurante.costoEnvio : 2.50;
      const total = subtotal + costoEnvio;

      const nuevoPedido = {
        id: generateOrderId(),
        fecha: new Date().toISOString(),
        estado: 'confirmado',
        restaurante: restaurante ? restaurante.nombre : 'Restaurante desconocido',
        restauranteId: restauranteId || null,
        items: items.map(item => {
          const producto = productos.find(p => p.id === item.productoId);
          return {
            productoId: item.productoId,
            nombre: producto ? producto.nombre : 'Producto desconocido',
            cantidad: item.cantidad || 1,
            precioUnitario: producto ? producto.precio : 0
          };
        }),
        subtotal,
        costoEnvio,
        total,
        direccionEntrega,
        metodoPago: metodoPago || 'efectivo',
        tiempoEstimado: restaurante ? restaurante.tiempoEntrega : '30-45 min',
        mensaje: '¡Tu pedido ha sido confirmado! Estamos preparando tu comida.'
      };

      sendJSON(res, 201, { success: true, data: nuevoPedido });
    } catch (e) {
      sendJSON(res, 400, { success: false, mensaje: 'Cuerpo de la solicitud inválido', error: e.message });
    }
    return;
  }

  // 404 fallback
  sendJSON(res, 404, {
    success: false,
    mensaje: `Ruta no encontrada: ${method} ${pathname}`,
    rutasDisponibles: [
      'GET /restaurantes',
      'GET /productos',
      'GET /productos/:id',
      'POST /pedidos',
      'GET /pedidos/mis-pedidos'
    ]
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`DeviAnRo Delivery API mock server corriendo en http://localhost:${PORT}`);
});
