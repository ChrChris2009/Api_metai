// LlamaChatRedwan.js
const axios = require('axios');

const meta = {
  name: 'Llama-Chat',
  desc: 'Chat with Redwan Llama Chat AI',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'text',
      desc: 'Text prompt to send to Llama Chat',
      example: 'Hello!',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const text = body.text;

    if (!text) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: text'
      });
    }

    const { data } = await axios.get('http://65.109.80.126:20511/api/llama-chat', {
      params: { text }
    });

    if (!data || !data.response) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch response from Llama Chat'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      query: data.query,
      response: data.response,
      powered_by: data.powered_by
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
