// llama4.js
const axios = require('axios');

const meta = {
  name: 'llama4',
  desc: 'Chat with ZetBot Llama 4 AI',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Text prompt to send to the AI',
      example: 'Hi there!',
      required: true
    },
    {
      name: 'id',
      desc: 'Unique ID for conversation',
      example: '22',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const prompt = body.prompt;
    const id = body.id;

    if (!prompt || !id) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameters: prompt and id'
      });
    }

    const { data } = await axios.get('https://zetbot-page.onrender.com/api/llama4', {
      params: { prompt, id }
    });

    res.json({
      status: true,
      operator: data.operator,
      response: data.response,
      totalWords: data.totalWords
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
