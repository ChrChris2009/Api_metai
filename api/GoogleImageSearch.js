// GoogleImageSearch.js
const axios = require('axios');

const meta = {
  name: 'GoogleImageSearch',
  desc: 'Search images using Redwan Google Image Search API',
  method: ['get'],
  category: 'Image',
  params: [
    {
      name: 'search',
      desc: 'Search query for images',
      example: 'Aizen',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const query = req.method === 'POST' ? req.body.search : req.query.search;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: search'
      });
    }

    const { data } = await axios.get('http://65.109.80.126:20511/api/google-image-search', {
      params: { search: query }
    });

    if (!data || !data.images) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch images'
      });
    }

    // Format response
    const images = data.images.map(img => ({
      url: img.url,
      width: img.width,
      height: img.height
    }));

    res.json({
      status: true,
      operator: data.creator,
      query: data.searchQuery,
      count: data.count,
      images
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
