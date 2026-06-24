// CDP.js
const axios = require('axios');

const meta = {
  name: 'Cdp',
  desc: 'Fetch a character display picture (CDP) from ZetBot API',
  method: ['get'],
  category: 'Image',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://zetbot-page.onrender.com/api/cdp');

    if (!data.operator || !data.character) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch CDP data'
      });
    }

    res.json({
      status: true,
      operator: data.operator,
      character: data.character,
      anime: data.anime,
      avatar: data.avatar
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
