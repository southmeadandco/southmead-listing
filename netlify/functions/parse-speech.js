exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { transcript } = JSON.parse(event.body);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  const prompt = `Parse this spoken description of a vintage clothing item. Extract structured fields.

Transcript: "${transcript}"

Return ONLY valid JSON with exactly these fields (empty string if not mentioned):
{
  "brand": "brand name",
  "category": "one of: Vintage T-Shirt, Vintage Hoodie, Vintage Sweatshirt, Vintage Jersey, Vintage Jacket, Vintage Denim Jacket, Vintage Windbreaker, Vintage Jeans, Vintage Shorts, Vintage Hat, Other",
  "size": "size as mentioned",
  "color1": "primary color — one of: Black, White, Gray, Cream, Beige, Brown, Tan, Khaki, Red, Burgundy, Pink, Coral, Rose, Orange, Mustard, Yellow, Green, DarkGreen, Mint, Teal, Turquoise, Blue, LightBlue, Navy, Purple, Lilac, Gold, Silver, Multi",
  "color2": "secondary color from same list or empty",
  "condition": "one of: VeryGood, Good, Fair, NewWithoutTags, NewWithTags",
  "era": "one of: From1990s, From2000To2004, From2005To2009, From2010To2019, From1980s",
  "material": "fabric if mentioned",
  "details": "everything else — graphics, team, construction details, any flaws"
}`;

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
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const raw = data.content.find(b => b.type === 'text')?.text || '{}';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: raw.replace(/```json|```/g, '').trim()
  };
};
