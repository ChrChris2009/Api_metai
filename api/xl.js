// xlAI.js
const axios = require('axios');

const meta = {
  name: 'xl',
  desc: 'Generate images from a prompt using XL AI via UniAPIs',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'prompt',
      desc: 'Description of the image to generate',
      example: 'A futuristic robot in a city',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const prompt = body.prompt;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: prompt'
      });
    }

    const { data } = await axios.get('https://uniapis.onrender.com/api/xl', {
      params: { prompt }
    });

    if (data.status !== 'success') {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      image_url: data.url
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
