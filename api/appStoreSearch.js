// appStoreSearch.js
const axios = require('axios');

const meta = {
  name: 'appStore',
  desc: 'Search applications on Apple App Store via Delirius API',
  method: ['get', 'post'],
  category: 'search',
  params: [
    {
      name: 'q',
      desc: 'Application name to search',
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
      'https://delirius-apiofc.vercel.app/search/appstore',
      {
        params: { q }
      }
    );

    if (!Array.isArray(data)) {
      return res.status(500).json({
        status: false,
        error: 'API returned an invalid response'
      });
    }

    res.json({
      status: true,
      operator: 'Delirius API',
      query: q,
      total: data.length,
      results: data.map(app => ({
        id: app.id,
        title: app.title,
        developer: app.developer,
        description: app.genre,
        rating: app.rating,
        score: app.score,
        reviews: app.reviews,
        size: app.size,
        version: app.version,
        released: app.released,
        updated: app.updated,
        price: app.price,
        currency: app.currency,
        url: app.url,
        image: app.image,
        screenshots: app.screenshots,
        website: app.website
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
