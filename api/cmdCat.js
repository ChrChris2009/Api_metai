// cmdCat.js
const axios = require('axios');

const meta = {
  name: 'cat',
  desc: 'Get a random cat image',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/cat?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.image) {
      return res.status(500).json({
        status: false,
        error: 'API returned no image'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        image: data.image
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
