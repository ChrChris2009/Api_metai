// PinterestSearchV2.js
const axios = require('axios');

const meta = {
  name: 'PinterestSearchV2',
  desc: 'Search images using Delirius Pinterest v2 API',
  method: ['get'],
  category: 'info',
  params: [
    {
      name: 'text',
      desc: 'Search query for Pinterest images',
      example: 'nayeon',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const query = req.method === 'POST' ? req.body.text : req.query.text;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: text'
      });
    }

    const { data } = await axios.get(
      'https://delirius-apiofc.vercel.app/search/pinterestv2',
      { params: { text: query } }
    );

    if (!data || !data.status || !Array.isArray(data.data)) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch Pinterest images'
      });
    }

    // Formatage propre
    const images = data.data.map(item => ({
      id: item.id,
      title: item.title,
      author: {
        name: item.name,
        username: item.username,
        profile_image: item.profile_image,
        followers: item.followers
      },
      description: item.description,
      likes: item.likes,
      created_at: item.created_at,
      image: item.image
    }));

    res.json({
      status: true,
      operator: data.creator,
      query,
      count: images.length,
      images
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
