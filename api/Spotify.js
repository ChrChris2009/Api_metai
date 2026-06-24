// Spotify.js
const axios = require('axios');

const meta = {
  name: 'Spotify',
  desc: 'Search for tracks on Spotify via ZetBot API',
  method: ['get'],
  category: 'downloader',
  params: [
    {
      name: 'search',
      desc: 'Track or artist to search for',
      example: 'so far so good',
      required: true
    },
    {
      name: 'action',
      desc: 'Type of Spotify action (default: search)',
      example: 'search',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === 'POST' ? req.body : req.query;
    const search = body.search;
    const action = body.action || 'search';

    if (!search) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: search'
      });
    }

    const { data } = await axios.get('https://zetbot-page.onrender.com/api/spotify', {
      params: { search, action }
    });

    if (!data || !data.tracks || data.tracks.length === 0) {
      return res.status(404).json({
        status: false,
        error: 'No tracks found'
      });
    }

    const tracks = data.tracks.map(track => ({
      name: track.name,
      album: track.album,
      artists: track.artists.join(', '),
      releaseDate: track.release_date,
      duration: track.duration,
      popularity: track.popularity,
      spotifyUrl: track.spotify_url,
      albumImage: track.album_image,
      previewUrl: track.preview_url
    }));

    res.json({
      status: true,
      operator: data.operator,
      results: tracks
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
