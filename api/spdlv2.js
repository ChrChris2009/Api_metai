// Modified spdlv2.js
const axios = require("axios");

const meta = {
  name: "Spotify Downloader V2",
  desc: "Download Spotify songs",
  method: [ 'get', 'post' ],
  category: "downloader",
  params: [
    {
      name: 'url',
      desc: 'The Spotify song URL',
      example: 'https://open.spotify.com/track/5PyDJG7SQRgWXefgexqIge',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let url;
  if (req.method === 'POST') {
    ({ url } = req.body);
  } else {
    ({ url } = req.query);
  }

  if (!url) {
    return res.status(400).json({ 
      error: "Missing required parameter: url"
    });
  }

  if (!url.includes("open.spotify.com")) {
    return res.status(400).json({
      error: "Invalid Spotify URL"
    });
  }

  try {
    const response = await axios.post('https://spotify.downloaderize.com/wp-json/spotify-downloader/v1/fetch', 
      { type: "song", url },
      {
        headers: {
          'authority': 'spotify.downloaderize.com',
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/json',
          'origin': 'https://spotify.downloaderize.com',
          'referer': 'https://spotify.downloaderize.com/',
          'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
          'x-requested-with': 'XMLHttpRequest'
        }
      }
    );


    const data = response.data.data;

    return res.json({
      answer: {
        id: data.id,
        artist: data.artist,
        title: data.title,
        album: data.album,
        cover: data.cover,
        releaseDate: data.releaseDate,
        downloadLink: data.downloadLink
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };