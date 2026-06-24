// waifuSearch.js
const axios = require('axios');

const meta = {
  name: 'waifusearch',
  desc: 'Search waifu images by tag and optional filters from waifu.im API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'tag',
      desc: 'Tag to search for',
      example: 'maid',
      required: true
    },
    {
      name: 'height',
      desc: 'Minimum image height (e.g., >=2000)',
      example: '>=2000',
      required: false
    },
    {
      name: 'nsfw',
      desc: 'Filter NSFW images (true/false)',
      example: 'false',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const tag = body.tag;
    const height = body.height || '';
    const nsfw = body.nsfw;

    if (!tag) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: tag'
      });
    }

    // Construire l’URL
    let url = `https://api.waifu.im/search?included_tags=${encodeURIComponent(tag)}`;
    if (height) url += `&height=${encodeURIComponent(height)}`;

    const { data } = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!data.images || data.images.length === 0) {
      return res.json({ status: true, images: [] });
    }

    // Filtrer par NSFW si demandé
    let images = data.images;
    if (nsfw !== undefined) {
      const isNsfw = nsfw === 'true' || nsfw === true;
      images = images.filter(img => img.is_nsfw === isNsfw);
    }

    // Formater la réponse
    const formatted = images.map(img => ({
      id: img.image_id,
      url: img.url,
      preview: img.preview_url,
      width: img.width,
      height: img.height,
      is_nsfw: img.is_nsfw,
      artist: img.artist ? {
        name: img.artist.name,
        deviantart: img.artist.deviant_art,
        twitter: img.artist.twitter,
        pixiv: img.artist.pixiv,
        patreon: img.artist.patreon
      } : null,
      tags: img.tags.map(t => ({
        id: t.tag_id,
        name: t.name,
        description: t.description,
        is_nsfw: t.is_nsfw
      })),
      source: img.source
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
