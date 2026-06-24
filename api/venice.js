// Modified venice.js
const axios = require('axios');
const meta = {
  name: 'venice',
  desc: 'send a question to Venice AI',
  method: [ 'get', 'post' ],
  category: 'AI',
  params: [
    {
      name: 'question',
      desc: 'Input your question here',
      example: 'What is the capital of Philippines?',
      required: true
    }, 
    { 
      name: 'systemPrompt',
      desc: 'input your system prompt here',
      example: 'You are my assistant',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  let question, systemPrompt;
  if (req.method === 'POST') {
    ({ question, systemPrompt } = req.body);
  } else {
    ({ question, systemPrompt } = req.query);
  }
  if (!question) {
    return res.status(400).json({
      error: 'Missing required parameter: question'
    });
  }
  try {
    const { data } = await axios.request({
      method: 'POST',
      url: 'https://outerface.venice.ai/api/inference/chat',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        origin: 'https://venice.ai',
        referer: 'https://venice.ai/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
        'x-venice-version': 'interface@20250523.214528+393d253'
      },
      data: JSON.stringify({
        requestId: 'nekorinn',
        modelId: 'dolphin-3.0-mistral-24b',
        prompt: [
          {
            content: question,
            role: 'user'
          }
        ],
        systemPrompt: systemPrompt || '', // Use systemPrompt or default to empty string
        conversationType: 'text',
        temperature: 0.8,
        webEnabled: true,
        topP: 0.9,
        isCharacter: false,
        clientProcessingTime: 15
      }),
      transformResponse: [(data) => data]
    });
    const chunks = (typeof data === 'string' ? data : String(data))
      .split('\n')
      .filter((chunk) => chunk.trim())
      .map((chunk) => {
        try {
          return JSON.parse(chunk);
        } catch (err) {
          return null;
        }
      })
      .filter(Boolean);
    const result = chunks.map((c) => c.content || '').join('');
    return res.json({
      answer: result
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}
module.exports = { meta, onStart };