// nhentaiAPI.js
const axios = require('axios');

const meta = {
  name: 'nhentaiAPI',
  desc: 'Search hentai doujins via UniAPIs NHentai (NSFW)',
  method: ['get'],
  category: 'nsfw',
  params: [
    {
      name: 'query',
      desc: 'Keyword or ID to search for doujins',
      example: '1',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const query = req.method === 'POST' ? req.body.query : req.query.query;

    if (!query) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: query'
      });
    }

    const { data } = await axios.get('https://uniapis.onrender.com/api/nhentai', {
      params: { query }
    });

    if (!data || !data.operator) {
      return res.status(500).json({ status: false, error: 'API returned an invalid response' });
    }

    const results = Object.keys(data)
      .filter(key => !isNaN(key))
      .map(key => ({
        title: data[key].title,
        imgSrc: data[key].imgSrc.startsWith('//') ? 'https:' + data[key].imgSrc : data[key].imgSrc,
        link: data[key].link
      }));

    res.json({
      status: true,
      operator: data.operator,
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
