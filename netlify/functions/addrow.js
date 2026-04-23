const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyXjVE6LHJNzNUaEhcgfDyOCPispjoNOdpczlMC7gJDn1lRw0CNquT3dAfRo-c-ZX5UeA/exec';

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);

    // Apps Script requires a GET-style approach for some actions due to redirect handling.
    // We send as a POST with text/plain to avoid CORS preflight, then follow redirects manually.
    let response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
      redirect: 'manual'  // Don't auto-follow — handle manually
    });

    // Apps Script returns a 302 redirect — follow it
    if (response.status === 302 || response.status === 301) {
      const location = response.headers.get('location');
      if (location) {
        response = await fetch(location, {
          method: 'GET',
          redirect: 'follow'
        });
      }
    }

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch(e) {
      if (text.trim().startsWith('<')) {
        // Still getting HTML — log first 200 chars to help debug
        data = { error: 'HTML response: ' + text.trim().substring(0, 200) };
      } else {
        data = { success: true };
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
