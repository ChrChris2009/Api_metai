// deepimageAI.js
const axios = require('axios');

const meta = {
  name: 'deepimageAI',
  desc: 'Generate high-quality images from a prompt using DeepImage via UniAPIs',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'prompt',
      desc: 'Description of the image to generate',
      example: 'A futuristic city at sunset',
      required: true
    },
    {
      name: 'version',
      desc: 'Optional version of the AI model',
      example: 'v1',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const prompt = body.prompt;
    const version = body.version || '';

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: prompt'
      });
    }

    const { data } = await axios.get('https://uniapis.onrender.com/api/deepimage', {
      params: { prompt, version }
    });

    if (!data.success) {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      id: data.data.id,
      image_url: data.data.output_url,
      backend_request_id: data.data.backend_request_id
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
