// cmdAnimeEro.js
const axios = require('axios');

const meta = {
  name: 'Ero',
  desc: 'Get a random NSFW anime image',
  category: 'anime',
  nsfw: true // Indique que c'est NSFW
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://delirius-apiofc.vercel.app/anime/ero');

    if (!data || !data.data) {
      return res.status(500).json({ status: false, error: 'API returned no data' });
    }

    const imageData = data.data;

    res.json({
      status: true,
      operator: 'Christus',
      id: imageData.id,
      title: imageData.title,
      likes: imageData.likes,
      image: imageData.image,
      size: imageData.size,
      uploadDate: imageData.upload,
      extension: imageData.ext,
      nsfw: imageData.nsfw,
      source: imageData.source
    });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };
