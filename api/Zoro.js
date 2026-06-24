// zoroAI.js
const axios = require('axios');

const meta = {
  name: 'zoroAI',
  desc: 'Send a prompt to Zoro AI via UniAPIs and get a response (may include HTML)',
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
      example: '1',
      required: true
    },
    {
      name: 'reset',
      desc: 'Reset the conversation (true/false)',
      example: 'false',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const prompt = body.prompt;
    const uid = body.uid;
    const reset = body.reset || false;

    if (!prompt || !uid) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: prompt or uid'
      });
    }

    const { data } = await axios.get('https://uniapis.onrender.com/api/zoro', {
      params: { prompt, uid, reset }
    });

    if (!data.status) {
      return res.status(500).json({ status: false, error: 'API returned an error' });
    }

    res.json({
      status: true,
      operator: data.operator,
      result: data.result,           // peut contenir HTML
      conversationId: data.conversationId,
      conversationLength: data.conversationLength
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
