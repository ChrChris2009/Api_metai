// cmdHentaiVid.js
const axios = require('axios');

const meta = {
  name: 'hentaiVid',
  desc: 'Fetch NSFW hentai videos from Delirius API',
  category: 'nsfw',
  params: [
    {
      name: 'query',
      desc: 'Optional search or category filter',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const query = req.method === 'POST' ? req.body.query : req.query.query || '';

    const { data } = await axios.get('https://delirius-apiofc.vercel.app/anime/hentaivid');

    if (!data || !Array.isArray(data)) {
      return res.status(500).json({
        status: false,
        error: 'API returned no data'
      });
    }

    // Formatage pour renvoyer uniquement les infos importantes
    const results = data.map((item) => ({
      title: item.title,
      category: item.category,
      views: item.views_count,
      link: item.link,
      video: item.video_1
    }));

    res.json({
      status: true,
      operator: 'Christus',
      count: results.length,
      results
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
