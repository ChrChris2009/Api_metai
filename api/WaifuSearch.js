// WaifuSearch.js
const axios = require('axios');

const meta = {
  name: 'WaifuSearch',
  desc: 'Search waifu images using Wildan Waifu API',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'search',
      desc: 'Search keyword for waifu images',
      example: 'waifu',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const search = req.method === 'POST'
      ? req.body.search
      : req.query.search;

    if (!search) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: search'
      });
    }

    const { data } = await axios.get(
      'https://wildan-suldyir-apis.vercel.app/api/waifu',
      { params: { search } }
    );

    if (!data || !data.data || !data.data.images) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch waifu images'
      });
    }

    const images = data.data.images.map(img => ({
      id: img.image_id,
      url: img.url,
      preview: img.preview_url,
      width: img.width,
      height: img.height,
      size: img.byte_size,
      nsfw: img.is_nsfw,
      color: img.dominant_color,
      tags: img.tags?.map(t => t.name) || []
    }));

    res.json({
      status: true,
      creator: data.creator,
      query: search,
      count: images.length,
      images,
      message: data.message
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
