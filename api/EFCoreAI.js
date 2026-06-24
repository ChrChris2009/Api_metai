// EFCoreAI.js
const axios = require('axios');

const meta = {
  name: 'EFCoreAI',
  desc: 'Get Entity Framework Core examples using Wildan AI',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Entity Framework Core question or request',
      example: 'Create EF Core CRUD with SQL Server',
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
      'https://wildan-suldyir-apis.vercel.app/api/efcore-ai',
      { params: { prompt } }
    );

    if (!data || !data.response) {
      return res.status(500).json({
        status: false,
        error: 'Failed to get EF Core response'
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
