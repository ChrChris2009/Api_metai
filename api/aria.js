// rapidoAI.js
const axios = require('axios');

const meta = {
  name: 'AriaAI',
  desc: 'Send a prompt to Rapido Aria AI and get a response',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Message to send to the AI',
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
    const prompt = body.prompt;
    const apikey = body.apikey;

    if (!prompt || !apikey) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: prompt or apikey'
      });
    }

    const { data } = await axios.get('https://rapido.zetsu.xyz/api/aria', {
      params: { prompt, apikey }
    });

    if (!data.status) {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      response: data.response
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
