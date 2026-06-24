// AnimeRandom.js
const axios = require('axios');

const meta = {
  name: 'AnimeRandom',
  desc: 'Fetch a random anime character from ZetBot API',
  method: ['get'],
  category: 'info',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://zetbot-page.onrender.com/api/anime-random');

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch random anime character'
      });
    }

    res.json({
      status: true,
      operator: data.operator,
      creator: data.creator,
      random: data.random
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
