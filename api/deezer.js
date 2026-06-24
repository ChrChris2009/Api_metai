// deezerSearch.js
const axios = require('axios');

const meta = {
  name: 'deezer',
  desc: 'Search music on Deezer via Delirius API',
  method: ['get', 'post'],
  category: 'downloader',
  params: [
    {
      name: 'q',
      desc: 'Song or artist to search',
      example: 'Feel Special',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const q = body.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: q'
      });
    }

    const { data } = await axios.get(
      'https://delirius-apiofc.vercel.app/search/deezer',
      {
        params: { q }
      }
    );

    if (!data.status || !Array.isArray(data.data)) {
      return res.status(500).json({
        status: false,
        error: 'API returned an error'
      });
    }

    res.json({
      status: true,
      operator: data.creator,
      total: data.data.length,
      results: data.data.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        rank: track.rank,
        preview: track.preview,
        image: track.image,
        url: track.url,
        explicit: track.explicit_lyrics
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
