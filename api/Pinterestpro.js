// pinterestSearch.js
const axios = require('axios');

const meta = {
  name: 'pinterest-pro',
  desc: 'Search for images on Pinterest via API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'query',
      desc: 'Search query for Pinterest images',
      example: 'cats',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const query = body.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: query'
      });
    }

    const { data } = await axios.get('https://egret-driving-cattle.ngrok-free.app/api/pin', {
      params: { query }
    });

    if (!data.success || !data.results || data.results.length === 0) {
      return res.status(500).json({
        status: false,
        error: 'No results found'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      count: data.count,
      query: data.query,
      results: data.results
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
