export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action, from, to, offset } = req.query;

  try {
    // Get token
    const tokenResp = await fetch('https://api.hostaway.com/v1/accessTokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials&client_id=97925&client_secret=b84d6398e5bb2e40c98a250f2a6f1e3239022c0d3f3676c871bf76cb53316ee1&scope=general'
    });
    const tokenData = await tokenResp.json();
    const token = tokenData.access_token;
    if (!token) throw new Error('No token');

    if (action === 'listings') {
      const resp = await fetch('https://api.hostaway.com/v1/listings?limit=100', {
        headers: { Authorization: `Bearer ${token}`, 'Cache-control': 'no-cache' }
      });
      const data = await resp.json();
      return res.status(200).json(data);
    }

    if (action === 'reservations') {
      const fromDate = from || '2023-01-01';
      const toDate = to || '2026-12-31';
      const off = offset || '0';
      const url = `https://api.hostaway.com/v1/reservations?arrivalStartDate=${fromDate}&arrivalEndDate=${toDate}&limit=100&offset=${off}&sortOrder=asc&includeResources=1`;
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Cache-control': 'no-cache' }
      });
      const data = await resp.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
