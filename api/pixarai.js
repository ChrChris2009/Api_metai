// pixarai.js
const axios = require('axios');

const meta = {
  name: 'pixarai',
  desc: 'Generate images from a prompt using Pixarai via UniAPIs',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'prompt',
      desc: 'Description of the image to generate',
      example: 'A cute cat sitting on a sofa',
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

    const { data } = await axios.get('https://uniapis.onrender.com/api/pixarai', {
      params: { prompt }
    });

    if (!data.status) {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      image_url: data.result.url,
      id: data.result.id
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
