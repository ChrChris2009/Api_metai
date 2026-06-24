// cmdWuwa.js
const axios = require('axios');

const meta = {
  name: 'wuwa',
  desc: 'Get a Wuthering Waves video from TikTok via Rapido API',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/wuwa?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.video_url) {
      return res.status(500).json({
        status: false,
        error: 'API returned no video'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      video: {
        url: data.video_url,
        title: data.title,
        duration: data.duration,
        author: {
          nickname: data.author.nickname,
          avatar: data.author.avatar
        },
        music: data.music,
        thumbnail: data.thumbnail
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
