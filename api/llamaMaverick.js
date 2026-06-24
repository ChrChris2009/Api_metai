// llama4Maverick.js
const axios = require('axios');

const meta = {
  name: 'llama-Maverick',
  desc: 'Send a prompt to UniAPIs LLaMA-4 Maverick 17B Instruct and get a response',
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
      name: 'uid',
      desc: 'User ID for conversation tracking',
      example: '123',
      required: true
    },
    {
      name: 'url',
      desc: 'Optional context URL',
      example: 'https://example.com',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;

    const prompt = body.prompt;
    const uid = body.uid;
    const url = body.url || '';

    if (!prompt || !uid) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: prompt or uid'
      });
    }

    const { data } = await axios.get(
      'https://uniapis.onrender.com/api/llama-4-maverick-17b-128e-instruct',
      { params: { prompt, uid, url } }
    );

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'API returned an error'
      });
    }

    res.json({
      status: true,
      operator: 'Christus', // 🔥 FORCÉ
      reply: data.reply,
      uid: data.uid
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
