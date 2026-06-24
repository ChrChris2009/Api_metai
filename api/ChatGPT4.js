// ChatGPT4.js
const axios = require('axios');

const meta = {
  name: 'ChatGPT4',
  desc: 'Chat with AI using Wildan ChatGPT-4 API',
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
    const prompt = req.method === 'POST' ? req.body.prompt : req.query.prompt;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: prompt'
      });
    }

    const { data } = await axios.get(
      'https://wildan-suldyir-apis.vercel.app/api/chatgpt4',
      { params: { prompt } }
    );

    if (!data || !data.response) {
      return res.status(500).json({
        status: false,
        error: 'Failed to get AI response'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      prompt,
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
