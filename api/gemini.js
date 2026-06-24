// cmdGemini.js
const axios = require('axios');

const meta = {
  name: 'gemini',
  desc: 'Get today\'s date and info using Gemini API',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'query',
      desc: 'Your question for the Gemini API',
      example: 'What day is today?',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const query = body.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: query'
      });
    }

    const { data } = await axios.get('https://delirius-apiofc.vercel.app/ia/gemini', {
      params: { query }
    });

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'API returned an error'
      });
    }

    // Retour formaté avec operator fixé à Christus
    res.json({
      status: true,
      operator: 'Christus',
      result: data.data.result
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
