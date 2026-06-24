// cmdFlux1nm.js
const axios = require('axios');

const meta = {
  name: 'flux1nm',
  desc: 'Generate AI images via Flux1nm API',
  category: 'Image',
  params: [
    {
      name: 'prompt',
      desc: 'Text prompt to generate images',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const prompt = req.method === 'POST' ? req.body.prompt : req.query.prompt;
    if (!prompt) {
      return res.status(400).json({ status: false, error: 'Prompt is required' });
    }

    const { data } = await axios.get(`http://65.109.80.126:20511/api/flux1nm?prompt=${encodeURIComponent(prompt)}`);

    if (!data || !Array.isArray(data.images)) {
      return res.status(500).json({
        status: false,
        error: 'API returned no images'
      });
    }

    const images = data.images.map((img) => ({
      image_link: img.image_link,
      status: img.status
    }));

    res.json({
      status: true,
      operator: 'Christus',
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
