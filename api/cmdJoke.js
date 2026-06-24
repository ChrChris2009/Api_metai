// cmdJoke.js
const axios = require('axios');

const meta = {
  name: 'joke',
  desc: 'Get a random joke',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/joke?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.joke) {
      return res.status(500).json({
        status: false,
        error: 'API returned no joke'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: data.joke
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
