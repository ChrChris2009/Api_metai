// Modified copilot.js
const WebSocket = require('ws');
const axios = require('axios');

const meta = {
  name: 'copilot',
  desc: 'chat with Microsoft Copilot AI via WebSocket connection',
  method: [ 'get', 'post' ],
  category: 'AI',
  params: [
    {
      name: 'message',
      desc: 'The user message or query to send to Copilot AI',
      example: 'Hello, how are you?',
      required: true
    }, 
    { 
      name: 'model',
      desc: 'The AI model (default, think-deeper, gpt-5)',
      example: 'default',
      required: false,
      options: ['default', 'think-deeper', 'gpt-5']
    }
  ]
};

async function onStart({ req, res }) {
  let message, model;
  if (req.method === 'POST') {
    ({ message, model } = req.body);
  } else {
    ({ message, model } = req.query);
  }
  model = model || 'default';

  if (!message) {
    return res.status(400).json({
      error: 'Missing required parameter: message'
    });
  }

  try {
    // Initialize Copilot
    const headers = {
      origin: 'https://copilot.microsoft.com',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
    };

    const models = {
      default: 'chat',
      'think-deeper': 'reasoning',
      'gpt-5': 'smart'
    };

    if (!models[model]) {
      return res.status(400).json({
        error: `Invalid model. Available: ${Object.keys(models).join(', ')}`
      });
    }

    // Create conversation
    const { data } = await axios.post('https://copilot.microsoft.com/c/api/conversations', null, {
      headers
    });

    const conversationId = data.id;
    const ws = new WebSocket(
      `wss://copilot.microsoft.com/c/api/chat?api-version=2&features=-,ncedge,edgepagecontext&setflight=-,ncedge,edgepagecontext&ncedge=1`,
      { headers }
    );

    const response = { text: '', citations: [] };

    ws.on('open', () => {
      ws.send(JSON.stringify({
        event: 'setOptions',
        supportedFeatures: ['partial-generated-images'],
        supportedCards: ['weather', 'local', 'image', 'sports', 'video', 'ads', 'safetyHelpline', 'quiz', 'finance', 'recipe'],
        ads: {
          supportedTypes: ['text', 'product', 'multimedia', 'tourActivity', 'propertyPromotion']
        }
      }));

      ws.send(JSON.stringify({
        event: 'send',
        mode: models[model],
        conversationId,
        content: [{ type: 'text', text: message }],
        context: {}
      }));
    });

    ws.on('message', (chunk) => {
      try {
        const parsed = JSON.parse(chunk.toString());

        switch (parsed.event) {
          case 'appendText':
            response.text += parsed.text || '';
            break;

          case 'citation':
            response.citations.push({
              title: parsed.title,
              icon: parsed.iconUrl,
              url: parsed.url
            });
            break;

          case 'done':
            res.json({
              answer: response.text
            });
            ws.close();
            break;

          case 'error':
            res.status(500).json({ error: parsed.message });
            ws.close();
            break;
        }
      } catch (err) {
        ws.close();
        res.status(500).json({ error: err.message });
      }
    });

    ws.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };