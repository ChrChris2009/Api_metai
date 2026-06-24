// playStoreSearch.js
const axios = require('axios');

const meta = {
  name: 'playStore',
  desc: 'Search applications on Google Play Store via Delirius API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'q',
      desc: 'Application name to search on Play Store',
      example: 'WhatsApp',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const q = body.q;

    if (!q) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: q'
      });
    }

    const { data } = await axios.get(
      'https://delirius-apiofc.vercel.app/search/playstore',
      { params: { q } }
    );

    if (!data || !data.status || !Array.isArray(data.data)) {
      return res.status(500).json({
        status: false,
        error: 'API returned an invalid response'
      });
    }

    res.json({
      status: true,
      operator: data.creator,
      query: q,
      total: data.data.length,
      results: data.data.map(app => ({
        name: app.name,
        developer: app.developer,
        rating: app.rating,
        rating_num: app.rating_num,
        link: app.link,
        developer_link: app.link_dev,
        image: app.image
      }))
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
