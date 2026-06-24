// rapidoPerplexity.js
const axios = require('axios');

const meta = {
  name: 'PerplexityAI',
  desc: 'Send a query to Rapido Perplexity AI and get a detailed answer',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'query',
      desc: 'Question or query to send to the AI',
      example: 'What is 1?',
      required: true
    },
    {
      name: 'websearch',
      desc: 'Enable web search for a more detailed answer (true/false)',
      example: 'true',
      required: false
    },
    {
      name: 'apikey',
      desc: 'Your Rapido API key',
      example: 'rapi_55197dde42fb4272bfb8f35bd453ba25',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const query = body.query;
    const websearch = body.websearch || false;
    const apikey = body.apikey;

    if (!query || !apikey) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: query or apikey'
      });
    }

    const { data } = await axios.get('https://rapido.zetsu.xyz/api/perplexity', {
      params: { query, websearch, apikey }
    });

    if (!data.answer) {
      return res.status(500).json({ status: false, error: 'API returned an empty answer' });
    }

    res.json({
      status: true,
      operator: data.operator,
      answer: data.answer
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
