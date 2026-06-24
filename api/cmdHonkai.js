// cmdHonkai.js
const axios = require('axios');

const meta = {
  name: 'honkai',
  desc: 'Get a random Honkai Star Rail edit video',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/honkai?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
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
      result: {
        video: data.video_url,
        title: data.title,
        duration: data.duration,
        music: data.music,
        author: {
          id: data.author?.id,
          username: data.author?.unique_id,
          nickname: data.author?.nickname,
          avatar: data.author?.avatar
        },
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
