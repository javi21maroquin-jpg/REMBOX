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
    // Obtener el ID de la query string
    const id = event.queryStringParameters.id;
    
    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Se requiere un ID' })
      };
    }
    
    const store = getStore({
      name: 'memoriales',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_ACCESS_TOKEN
    });
    
    const memorial = await store.get(id, { type: 'json' });
    
    if (!memorial) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No encontrado' })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memorial)
    };
  } catch (error) {
    console.error('Error en getMemorial:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};