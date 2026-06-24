// Kanda.js
const axios = require('axios');

const meta = {
  name: 'Kanda',
  desc: 'Fetch Kanda video from Redwan API',
  method: ['get'],
  category: 'nsfw',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('http://65.109.80.126:20511/api/kanda');

    if (!data || !data.status) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch video'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      videoUrl: data.video_url,
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
