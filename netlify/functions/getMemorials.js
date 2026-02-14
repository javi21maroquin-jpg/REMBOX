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
    const store = getStore('memoriales');
    const { blobs } = await store.list();
    const memoriales = [];
    
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};