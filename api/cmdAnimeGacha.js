// cmdAnimeGacha.js
const axios = require('axios');

const meta = {
  name: 'animeGacha',
  desc: 'Get a random anime character from Delirius API',
  category: 'anime',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://delirius-apiofc.vercel.app/anime/gacha'
    );

    if (!data || !data.data) {
      return res.status(500).json({
        status: false,
        error: 'API returned no data'
      });
    }

    const character = data.data;

    res.json({
      status: true,
      operator: 'Christus',
      character: {
        name: character.name,
        anime: character.anime,
        gender: character.gender,
        image: character.image
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
