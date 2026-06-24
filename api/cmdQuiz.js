// cmdQuiz.js
const axios = require('axios');

const meta = {
  name: 'quiz',
  desc: 'Get a random quiz question',
  category: 'FUN',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get(
      'https://rapido.zetsu.xyz/api/quiz?apikey=rapi_55197dde42fb4272bfb8f35bd453ba25'
    );

    if (!data || !data.question || !Array.isArray(data.options)) {
      return res.status(500).json({
        status: false,
        error: 'API returned invalid quiz data'
      });
    }

    res.json({
      status: true,
      operator: 'Christus',
      result: {
        question: data.question,
        options: data.options,
        correct_answer: data.correct_answer
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
