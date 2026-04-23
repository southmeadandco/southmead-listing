const APPS = 'https://script.google.com/macros/s/AKfycbz7UrwjQbO1pc6rrxBx5qdkMq4Tbk9w4sy3RJGYnJtmhiHIivjoDFMB9LewZJF4oGps5A/exec';

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const response = await fetch(APPS, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: event.body,
      redirect: 'follow'
    });
    const text = await response.text();
    return { statusCode: 200, headers, body: text };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
