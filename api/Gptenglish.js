// GPTRedwan.js
const axios = require('axios');

const meta = {
  name: 'GPTenglish',
  desc: 'Chat with Redwan GPT AI',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'q',
      desc: 'Text prompt to send to GPT',
      example: 'Hello, how are you?',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const q = body.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: q'
      });
    }

    const { data } = await axios.get('http://65.109.80.126:20511/api/gpt', {
      params: { q }
    });

    if (!data || !data.message) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch response from GPT'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      author: data.author,
      response: data.message
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
