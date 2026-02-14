const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Manejar preflight requests de CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    // Conectar al store "memoriales" en Netlify Blobs
    const store = getStore({
      name: 'memoriales',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_ACCESS_TOKEN
    });
    
    // Listar todos los blobs en el store
    const { blobs } = await store.list();
    const memoriales = [];
    
    // Obtener los datos de cada blob
    for (const blob of blobs) {
      const data = await store.get(blob.key, { type: 'json' });
      memoriales.push(data);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memoriales)
    };
  } catch (error) {
    console.error('Error en getMemorials:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};