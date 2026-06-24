// PinterestSearch.js
const axios = require('axios');

const meta = {
  name: 'PinterestSearch',
  desc: 'Search images on Pinterest using Redwan API',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'search',
      desc: 'Search query for Pinterest images',
      example: 'Aizen',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const search = req.method === 'POST' ? req.body.search : req.query.search;

    if (!search) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: search'
      });
    }

    const { data } = await axios.get('http://65.109.80.126:20511/api/api/pinterest', {
      params: { search }
    });

    if (!data || !data.data || data.data.length === 0) {
      return res.status(500).json({
        status: false,
        error: 'No images found'
      });
    }

    // Format response
    const images = data.data.map(url => ({ url }));

    res.json({
      status: true,
      creator: data.creator,
      query: search,
      count: data.count,
      images,
      author: {
        name: data.name,
        instagram: data.instagram,
        facebook: data.facebook
      }
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
