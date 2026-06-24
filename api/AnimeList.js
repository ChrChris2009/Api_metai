// AnimeList.js
const axios = require('axios');

const meta = {
  name: 'AnimeList',
  desc: 'Fetch the full list of anime characters from ZetBot API',
  method: ['get'],
  category: 'info',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://zetbot-page.onrender.com/api/anime-list');

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch anime list'
      });
    }

    res.json({
      status: true,
      operator: data.operator,
      creator: data.creator,
      anime_List: data.anime_List
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
