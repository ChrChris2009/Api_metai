// rapidoGrok.js
const axios = require('axios');

const meta = {
  name: 'GrokAI',
  desc: 'Send a prompt to Rapido Grok AI and get a response',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'ask',
      desc: 'Message or question to send to the AI',
      example: 'Hello',
      required: true
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
    const ask = body.ask;
    const apikey = body.apikey;

    if (!ask || !apikey) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: ask or apikey'
      });
    }

    const { data } = await axios.get('https://rapido.zetsu.xyz/api/grok', {
      params: { ask, apikey }
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
