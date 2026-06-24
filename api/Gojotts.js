// Gojotts.js
const axios = require('axios');

const meta = {
  name: 'Gojotts',
  desc: 'Generate voice from text using Redwan Gojotts API',
  method: ['get', 'post'],
  category: 'voice',
  params: [
    {
      name: 'text',
      desc: 'Text to convert to voice',
      example: 'Hello World',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const text = req.method === 'POST' ? req.body.text : req.query.text;

    if (!text) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: text'
      });
    }

    const { data } = await axios.get('http://65.109.80.126:20511/api/gojotts', {
      params: { text }
    });

    if (!data || !data.result) {
      return res.status(500).json({
        status: false,
        error: 'Failed to generate voice'
      });
    }

    res.json({
      status: data.status,
      creator: data.creator,
      message: data.message,
      result: data.result,
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
