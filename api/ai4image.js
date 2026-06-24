// ai4image.js
const axios = require('axios');

const meta = {
  name: 'ai4image',
  desc: 'Generate an image from a prompt using UniAPIs AI',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'prompt',
      desc: 'Description of the image to generate',
      example: 'A futuristic cityscape at sunset',
      required: true
    },
    {
      name: 'ratio',
      desc: 'Optional image ratio, e.g., 1:1 or 16:9',
      example: '1:1',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const prompt = body.prompt;
    const ratio = body.ratio || '';

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: prompt'
      });
    }

    const { data } = await axios.get('https://uniapis.onrender.com/api/ai4image', {
      params: { prompt, ratio }
    });

    if (!data.status) {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      image_link: data.result.image_link,
      base64_output: data.result.base64_output,
      generation_status: data.result.status,
      attempt: data.result.attempt
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
