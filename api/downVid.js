// downVid.js
const axios = require('axios');

const meta = {
  name: 'downVid',
  desc: 'Download videos or audio from supported platforms via DownVid API',
  method: ['get', 'post'],
  category: 'downloader',
  params: [
    {
      name: 'url',
      desc: 'URL of the video to download',
      example: 'https://youtube.com/shorts/thULSWAvXkc',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const url = body.url;

    if (!url) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: url'
      });
    }

    const { data } = await axios.get('https://downvid.onrender.com/api/download', {
      params: { url }
    });

    if (data.status !== 'success') {
      return res.status(500).json({
        status: false,
        error: 'Failed to download video from the platform'
      });
    }

    res.json({
      status: true,
      message: data.message,
      video: data.video,
      audio: data.audio,
      title: data.data.data.title,
      thumbnail: `https://downvid.onrender.com${data.data.data.img_src}`,
      nowm: data.data.data.nowm
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
