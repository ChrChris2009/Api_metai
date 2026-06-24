// lenna.js
const axios = require('axios');

const meta = {
  name: 'LennaAI',
  desc: 'Send a prompt to UniAPIs Lenna (Leva AI) and get a response',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Message to send to Lenna AI',
      example: 'Hello',
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

    const { data } = await axios.get(
      'https://uniapis.onrender.com/api/lenna',
      { params: { prompt } }
    );

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'API returned an error'
      });
    }

    res.json({
      status: true,
      operator: 'Christus', // 🔥 TOUJOURS FORCÉ
      result: data.result
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
