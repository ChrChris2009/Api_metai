// youtube.js
const axios = require('axios');

const meta = {
  name: 'youtube',
  desc: 'Get base API URLs and endpoints from Mostakim registry',
  method: ['get'],
  category: 'downloader',
  params: [
    {
      name: 'key',
      desc: 'Specific API key (e.g: ytb, baby, imgur)',
      example: 'ytb',
      required: false
    },
    {
      name: 'random',
      desc: 'Get a random API from apis[]',
      example: 'true',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const key = req.query.key;
    const random = req.query.random === 'true';

    const { data } = await axios.get(
      'https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json'
    );

    if (!data) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch API registry'
      });
    }

    // 🎲 Random API from apis[]
    if (random && Array.isArray(data.apis)) {
      const randomApi =
        data.apis[Math.floor(Math.random() * data.apis.length)];

      return res.json({
        status: true,
        mode: 'random',
        api: randomApi
      });
    }

    // 🔎 Specific key
    if (key) {
      if (!data[key]) {
        return res.status(404).json({
          status: false,
          error: `API key '${key}' not found`
        });
      }

      return res.json({
        status: true,
        key,
        value: data[key]
      });
    }

    // 📜 Full registry
    res.json({
      status: true,
      source: 'Mostakim Base API Registry',
      total_keys: Object.keys(data).length,
      registry: data
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
