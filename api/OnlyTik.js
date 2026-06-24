// OnlyTik.js
const axios = require('axios');

const meta = {
  name: 'OnlyTik',
  desc: 'Fetch a random TikTok video from Redwan API',
  method: ['get'],
  category: 'nsfw',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('http://65.109.80.126:20511/api/onlytik');

    if (!data || !data.selected_video || !data.selected_video.url) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch video'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      videoUrl: data.selected_video.url,
      likes: data.selected_video.likes,
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
