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
    const { id, flor } = JSON.parse(event.body);
    const store = getStore('memoriales');
    
    const memorial = await store.get(id, { type: 'json' });
    
    if (!memorial) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'No encontrado' })
      };
    }
    
    memorial.flores.push(flor);
    
    await store.setJSON(id, memorial);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(memorial)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};