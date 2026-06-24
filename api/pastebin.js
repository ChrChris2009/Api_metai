// Modified pastebin.js
const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI({
  api_dev_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
  api_user_key: 'LFhKGk5aRuRBII5zKZbbEpQjZzboWDp9',
});

const meta = {
  name: 'pastebin',
  desc: 'Create a paste on Pastebin and return the raw URL',
  method: [ 'get', 'post' ],
  category: 'tools',
  params: [
    {
      name: 'text',
      desc: 'The text content to paste',
      example: 'Hello, world!',
      required: true
    }
  ]
};

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function onStart({ req, res }) {
  let text;
  if (req.method === 'POST') {
    ({ text } = req.body);
  } else {
    ({ text } = req.query);
  }

  if (!text) {
    return res.status(400).json({ error: 'Missing required parameter: text' });
  }

  try {
    const paste = await pastebin.createPaste({
      text: text,
      title: generateRandomString(10),
      format: null,
      privacy: 1
    });
    const raw = paste.replace("pastebin.com", "pastebin.com/raw");
    return res.json({ 
      answer: raw 
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}

module.exports = { meta, onStart };