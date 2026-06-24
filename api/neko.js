// neko.js
const axios = require('axios');

const meta = {
  name: 'neko',
  desc: 'Get random neko images from nekos.best API',
  method: ['get', 'post'],
  category: 'Image',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://nekos.best/api/v2/neko', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!data.results || data.results.length === 0) {
      return res.json({ status: true, images: [] });
    }

    // Formater la réponse
    const formatted = data.results.map(img => ({
      url: img.url,
      artist: img.artist_name ? {
        name: img.artist_name,
        href: img.artist_href
      } : null,
      source: img.source_url
    }));

    res.json({ status: true, images: formatted });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
