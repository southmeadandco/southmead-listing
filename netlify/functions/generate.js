exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { prompt } = JSON.parse(event.body);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: { message: 'API key not configured.' } })
    };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: `You write product listings for a vintage clothing store. Rules:
- Plain, direct English only. No hype, no superlatives, no resale clichés.
- NEVER use: iconic, rare, grail, gem, fire, heat, heavy, slept on, must-have, stunning, amazing, beautiful, perfect, incredible, unique.
- NEVER start a sentence with "This piece", "This is", "Check out", "Perfect for".
- NEVER write cultural commentary or era lectures.
- Describe what the item IS. What graphic, what construction, what detail makes it specific.
- Keep descriptions under 80 words total.
- Return ONLY valid JSON with no markdown or backticks.`,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();

  return {
    statusCode: response.status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
};
