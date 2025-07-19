const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { url } = event.queryStringParameters || {};

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No url parameter provided' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  const decodedUrl = decodeURIComponent(url);

  try {
    const headers = {
      'Referer': 'https://videostr.net/',
      'Origin': 'https://videostr.net',
      'User-Agent': event.headers['user-agent'] || 'Mozilla/5.0'
    };

    const response = await fetch(decodedUrl, { method: 'GET', headers, redirect: 'follow' });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Upstream HTTP ${response.status}` }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.buffer();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache, must-revalidate',
        'X-Accel-Buffering': 'no',
        'X-Content-Duration': '0'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy failed', details: err.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
