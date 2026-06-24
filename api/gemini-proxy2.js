// geminiProxy.js
const axios = require('axios');

const meta = {
  name: 'gemini-proxy',
  desc: 'Send a prompt to UniAPIs Gemini Proxy 2 AI and get a response',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Message to send to the AI',
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

    const { data } = await axios.get('https://uniapis.onrender.com/api/gemini-proxy2', {
      params: { prompt }
    });

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'API returned an error'
      });
    }

    // Extraire le texte principal du premier candidat
    const resultText = data.raw?.candidates?.[0]?.content?.parts?.[0]?.text || data.result;

    res.json({
      status: true,
      operator: 'Christus', // Forcé ici
      model: data.model,
      result: resultText,
      raw: data.raw
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
