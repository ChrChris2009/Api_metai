const axios = require('axios');

const meta = {
  name: 'lyrics',
  desc: 'Search lyrics using lrclib.net API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'title',
      desc: 'Song title or query to search lyrics for',
      example: 'Bulong',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let title;
  if (req.method === 'POST') {
    ({ title } = req.body);
  } else {
    ({ title } = req.query);
  }

  if (!title) {
    return res.status(400).json({
      error: 'Missing required parameter: title'
    });
  }

  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(title)}`;
    const { data } = await axios.request({
      method: 'GET',
      url,
      headers: {
        referer: `https://lrclib.net/search/${encodeURIComponent(title)}`,
        'user-agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    });

    return res.json({
      data
    });
  } catch (error) {
    return res.status(500).json({
      error: error && error.message ? error.message : 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
