// Pinterest.js
const axios = require('axios');

const meta = {
  name: 'Pinterest',
  desc: 'Fetch images from Pinterest via ZetBot API',
  method: ['get'],
  category: 'Image',
  params: [
    {
      name: 'query',
      desc: 'Search query for pins',
      example: 'cat',
      required: true
    },
    {
      name: 'limit',
      desc: 'Number of pins to fetch (max 10)',
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

    const { data } = await axios.get('https://zetbot-page.onrender.com/api/pinterest', {
      params: { query, limit }
    });

    if (!data || !data.pins || data.pins.length === 0) {
      return res.status(404).json({
        status: false,
        error: 'No pins found'
      });
    }

    // Format the pins
    const pins = data.pins.map(pin => ({
      id: pin.id,
      title: pin.title || 'No title',
      imageUrl: pin.image,
      pinUrl: pin.pin_url,
      uploader: {
        username: pin.uploader.username,
        profileUrl: pin.uploader.profile_url
      }
    }));

    res.json({
      status: true,
      operator: data.operator,
      results: pins
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
