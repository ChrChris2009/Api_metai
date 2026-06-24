// cmdAnimeCharacter.js
const axios = require('axios');

const meta = {
  name: 'animeCharacter',
  desc: 'Get info and image of a specific anime character',
  category: 'anime',
  params: [
    {
      name: 'character',
      desc: 'Name of the anime character',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const characterName = req.method === 'POST' ? req.body.character : req.query.character;
    if (!characterName) {
      return res.status(400).json({ status: false, error: 'Character name is required' });
    }

    const { data } = await axios.get(
      `https://delirius-apiofc.vercel.app/anime/character?character=${encodeURIComponent(characterName)}`
    );

    if (!data || !data.data) {
      return res.status(500).json({ status: false, error: 'API returned no data' });
    }

    const character = data.data;

    res.json({
      status: true,
      operator: 'Christus',
      character: {
        name: character.name,
        anime: character.anime,
        image: character.image
      }
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };
