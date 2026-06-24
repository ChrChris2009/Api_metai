// cmdAnimeVideo.js
const axios = require('axios');

const meta = {
  name: 'animevideo',
  desc: 'Get random anime video via UniAPIs',
  category: 'search',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://uniapis.onrender.com/api/animevideo'
    );

    if (!data || !data.status || !data.data) {
      return res.status(500).json({
        status: false,
        error: 'API returned no data'
      });
    }

    const video = data.data;

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        author: video.author,
        videoId: video.videoId,
        title: video.title,
        cover: video.cover,
        playUrl: video.playUrl,
        stats: {
          playCount: video.playCount,
          diggCount: video.diggCount,
          commentCount: video.commentCount,
          shareCount: video.shareCount,
          downloadCount: video.downloadCount
        },
        user: {
          nickname: video.user?.nickname,
          avatar: video.user?.avatar
        }
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
