// Nude.js
const axios = require('axios');

const meta = {
  name: 'Nude',
  desc: 'Fetch random nude image from Redwan API',
  method: ['get'],
  category: 'nsfw',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('http://65.109.80.126:20511/api/nude');

    if (!data || !data.image) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch image'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      imageUrl: data.image,
      timestamp: data.timestamp,
      poweredBy: data.powered_by
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
