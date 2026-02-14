const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Solo aceptar POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Método no permitido' })
      };
    }
    
    const data = JSON.parse(event.body);
    
    // Validar que tenga nombre
    if (!data.nombre) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'El nombre es obligatorio' })
      };
    }
    
    const store = getStore({
      name: 'memoriales',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_ACCESS_TOKEN
    });
    
    // Generar ID único usando timestamp
    const id = Date.now().toString();
    const memorial = {
      id,
      ...data,
      flores: data.flores || [],
      creado: new Date().toISOString()
    };
    
    // Guardar en Netlify Blobs
    await store.setJSON(id, memorial);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memorial)
    };
  } catch (error) {
    console.error('Error en createMemorial:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};