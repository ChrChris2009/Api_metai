// cmdCosplay.js
const axios = require('axios');

const meta = {
  name: 'cosplay-video',
  desc: 'Get a random cosplay video',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/cosplay?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.videoUrl) {
      return res.status(500).json({
        status: false,
        error: 'API returned no video'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        video: data.videoUrl
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
