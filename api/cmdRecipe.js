// cmdRecipe.js
const axios = require('axios');

const meta = {
  name: 'recipe',
  desc: 'Get a random recipe',
  category: 'random',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/recipe?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.name || !data.ingredients || !data.instructions) {
      return res.status(500).json({
        status: false,
        error: 'API returned invalid recipe data'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        name: data.name,
        category: data.category,
        ingredients: data.ingredients,
        instructions: data.instructions
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
