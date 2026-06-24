// TopAnimeRedwan.js
const axios = require('axios');

const meta = {
  name: 'Top-Anime',
  desc: 'Fetch top anime list from Redwan API',
  method: ['get'],
  category: 'info',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('http://65.109.80.126:20511/api/topanime');

    if (!data || !Array.isArray(data)) {
      return res.status(500).json({
        status: false,
        error: 'Failed to fetch top anime'
      });
    }

    // Format response
    const topAnime = data.map(anime => ({
      rank: anime.rank,
      title: anime.title,
      score: anime.score,
      type: anime.type,
      release: anime.release,
      members: anime.members,
      thumbnail: anime.thumbnail,
      link: anime.link
    }));

    res.json({
      status: true,
      operator: 'Redwan',
      topAnime
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
