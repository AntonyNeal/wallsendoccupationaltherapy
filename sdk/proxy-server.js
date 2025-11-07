// Simple proxy server to bypass local SSL issues
const express = require('express');
const app = express();
const PORT = 3333;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Proxy endpoint
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    console.log(`Proxying request to: ${targetUrl}`);

    // Use node-fetch with relaxed SSL (this will work on Windows)
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await fetch(targetUrl, {
      method: 'GET',
      agent: agent,
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: error.message,
      stack: error.stack,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Proxy server running on http://localhost:${PORT}`);
  console.log(`\nUsage: http://localhost:${PORT}/proxy?url=YOUR_API_URL\n`);
});
