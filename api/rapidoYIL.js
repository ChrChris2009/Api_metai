// rapidoYIL.js
const axios = require('axios');

const meta = {
  name: 'YiLAI',
  desc: 'Send a prompt to Rapido Yi-L AI and get a response',
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
      name: 'uid',
      desc: 'User ID for conversation tracking',
      example: '3',
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
    const uid = body.uid;
    const apikey = body.apikey;

    if (!ask || !uid || !apikey) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: ask, uid or apikey'
      });
    }

    const { data } = await axios.get('https://rapido.zetsu.xyz/api/yi-l', {
      params: { ask, uid, apikey }
    });

    if (!data.response) {
      return res.status(500).json({ status: false, error: 'API returned an empty response' });
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
