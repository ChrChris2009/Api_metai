// RealBooru.js
const axios = require('axios');

const meta = {
  name: 'RealBooru',
  desc: 'Fetch NSFW/SFW anime images from RealBooru via ZetBot API',
  method: ['get'],
  category: 'nsfw',
  params: [
    {
      name: 'query',
      desc: 'Search query (tags) for the images',
      example: '1girl',
      required: true
    },
    {
      name: 'limit',
      desc: 'Number of results to fetch (max 10)',
      example: '5',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const query = body.query;
    const limit = body.limit || 5;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: query'
      });
    }

    const { data } = await axios.get('https://zetbot-page.onrender.com/api/realbooru', {
      params: { query, limit }
    });

    if (!data || Object.keys(data).length === 0) {
      return res.status(404).json({
        status: false,
        error: 'No images found'
      });
    }

    // Format the response
    const images = [];
    for (let i = 0; i < limit; i++) {
      if (!data[i]) continue;
      images.push({
        id: data[i].id,
        title: data[i].title,
        postUrl: data[i].url,
        imageUrl: data[i].image,
        thumbnail: data[i].thumbnail
      });
    }

    res.json({
      status: true,
      operator: data.operator,
      results: images
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
