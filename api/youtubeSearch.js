// youtubeSearch.js
const axios = require('axios');

const meta = {
  name: 'youtubeSearch',
  desc: 'Search for videos on YouTube via Aryan Chauhan API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'q',
      desc: 'Search query',
      example: '1',
      required: true
    },
    {
      name: 'count',
      desc: 'Number of results to return',
      example: '1',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const q = body.q;
    const count = body.count || 1;

    if (!q) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: q'
      });
    }

    const { data } = await axios.get('https://arychauhann.onrender.com/api/youtubesearch', {
      params: { q, count }
    });

    if (!data.status || !data.result || data.result.length === 0) {
      return res.status(500).json({ status: false, error: 'No results found' });
    }

    res.json({
      status: true,
      operator: data.operator,
      result: data.result.map(video => ({
        title: video.title,
        url: video.url,
        timestamp: video.timestamp,
        duration: video.duration,
        views: video.views,
        published: video.published,
        author: video.author,
        channelId: video.channelId,
        thumbnail: video.thumbnail
      }))
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
