const API_URL = "http://localhost:1337/api";



/* PRODUCTOS */

export const getProductos = async () => {
  try {

    const res = await fetch(
      `${API_URL}/productos?populate=*&pagination[pageSize]=100`
    );

    const data = await res.json();

    return data.data || [];

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





/* PRODUCTOS POR RESTAURANTE */

export const getProductosPorRestaurante = async (restauranteId) => {

  try {

    const res = await fetch(
      `${API_URL}/productos?filters[restaurante][id][$eq]=${restauranteId}&populate=*`
    );


    const data = await res.json();


    return data.data || [];


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


    return data.data || [];


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



    console.log(
      "RESTAURANTE COMPLETO:",
      data
    );



    return data.data || null;



  } catch (error) {


    console.log(
      "Error getRestauranteById:",
      error
    );


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