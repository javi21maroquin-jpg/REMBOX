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
    
    const { id, flor } = JSON.parse(event.body);
    
    if (!id || !flor) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Se requiere id y flor' })
      };
    }
    
    const store = getStore({
      name: 'memoriales',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_ACCESS_TOKEN
    });
    
    // Obtener el memorial existente
    const memorial = await store.get(id, { type: 'json' });
    
    if (!memorial) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Memorial no encontrado' })
      };
    }
    
    // Añadir la nueva flor
    if (!memorial.flores) {
      memorial.flores = [];
    }
    memorial.flores.push(flor);
    
    // Guardar el memorial actualizado
    await store.setJSON(id, memorial);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memorial)
    };
  } catch (error) {
    console.error('Error en addFlor:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};