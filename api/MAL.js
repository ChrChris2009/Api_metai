// MAL.js
const axios = require('axios');

const meta = {
  name: 'MAL',
  desc: 'Fetch anime details from MyAnimeList via ZetBot API',
  method: ['get'],
  category: 'info',
  params: [
    {
      name: 'title',
      desc: 'Title of the anime to search',
      example: 'Summertime Render',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const title = req.method === 'POST' ? req.body.title : req.query.title;

    if (!title) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: title'
      });
    }

    const { data } = await axios.get('https://zetbot-page.onrender.com/api/mal', {
      params: { title }
    });

    if (!data.title) {
      return res.status(404).json({
        status: false,
        error: 'Anime not found'
      });
    }

    res.json({
      status: true,
      operator: data.operator,
      title: data.title,
      japanese: data.japanese,
      type: data.type,
      premiered: data.premiered,
      broadcast: data.broadcast,
      aired: data.aired,
      producers: data.producers,
      studios: data.studios,
      source: data.source,
      episodes: data.episodes,
      duration: data.duration,
      genres: data.genres,
      popularity: data.popularity,
      ranked: data.ranked,
      score: data.score,
      rating: data.rating,
      description: data.description,
      scoreStats: data.scoreStats,
      members: data.members,
      favorites: data.favorites,
      url: data.url,
      picture: data.picture
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
