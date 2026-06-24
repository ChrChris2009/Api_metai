// cmdQuote.js
const axios = require('axios');

const meta = {
  name: 'quote',
  desc: 'Get a random quote',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/quote?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.quote || !data.author) {
      return res.status(500).json({
        status: false,
        error: 'API returned invalid quote data'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        quote: data.quote,
        author: data.author
      }
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
