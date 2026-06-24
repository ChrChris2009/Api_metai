// sfmhentaiAPI.js
const axios = require('axios');

const meta = {
  name: 'sfmhentaiAPI',
  desc: 'Fetch SFM hentai videos from UniAPIs (NSFW)',
  method: ['get'],
  category: 'nsfw',
  params: []
};

async function onStart({ req, res }) {
  try {
    const { data } = await axios.get('https://uniapis.onrender.com/api/sfmhentai');

    if (!data || !data.operator) {
      return res.status(500).json({ status: false, error: 'API returned an invalid response' });
    }

    const videos = Object.keys(data)
      .filter(key => !isNaN(key))
      .map(key => ({
        title: data[key].title,
        link: data[key].link,
        category: data[key].category,
        share_count: data[key].share_count,
        views_count: data[key].views_count,
        type: data[key].type,
        video_1: data[key].video_1,
        video_2: data[key].video_2
      }));

    res.json({
      status: true,
      operator: data.operator,
      videos
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
