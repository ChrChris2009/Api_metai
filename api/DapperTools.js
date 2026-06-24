// DapperTools.js
const axios = require('axios');

const meta = {
  name: 'DapperTools',
  desc: 'Get Dapper & developer code examples using Wildan API',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Developer question or request',
      example: 'Create a Dapper CRUD example',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const prompt = req.method === 'POST'
      ? req.body.prompt
      : req.query.prompt;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: prompt'
      });
    }

    const { data } = await axios.get(
      'https://wildan-suldyir-apis.vercel.app/api/dapper-tools',
      { params: { prompt } }
    );

    if (!data || !data.response) {
      return res.status(500).json({
        status: false,
        error: 'Failed to get developer response'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      prompt: data.prompt,
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
