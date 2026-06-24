// cmdAnimeCharacterList.js
const axios = require('axios');

const meta = {
  name: 'anime-Character',
  desc: 'Get a list of characters from a specific anime',
  category: 'anime',
  params: [
    {
      name: 'anime',
      desc: 'Name of the anime',
      required: true
    },
    {
      name: 'page',
      desc: 'Page number (default 0)',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const animeName = req.method === 'POST' ? req.body.anime : req.query.anime;
    const page = req.method === 'POST' ? req.body.page || 0 : req.query.page || 0;

    if (!animeName) {
      return res.status(400).json({ status: false, error: 'Anime name is required' });
    }

    const { data } = await axios.get(
      `https://delirius-apiofc.vercel.app/anime/characterlist?query=${encodeURIComponent(animeName)}&page=${page}`
    );

    if (!data || !data.data) {
      return res.status(500).json({ status: false, error: 'API returned no data' });
    }

    const characters = data.data.map((char) => ({
      name: char.name,
      anime: char.anime,
      gender: char.gender,
      image: char.image
    }));

    res.json({
      status: true,
      operator: 'Christus',
      anime: data.name,
      totalCharacters: data.total,
      genderDistribution: data.gender,
      characters
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };
