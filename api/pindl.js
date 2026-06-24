// Modified pindl.js
const axios = require("axios");
const FormData = require("form-data");

const meta = {
  name: "Pinterest Downloader",
  desc: "Download Pinterest videos",
  method: [ 'get', 'post' ],
  category: "downloader",
  params: [
    {
      name: 'url',
      desc: 'The Pinterest video URL',
      example: 'https://www.pinterest.com/pin/123456789/',
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
    return res.status(400).json({ error: "Missing required parameter: url" });
  }

  try {
    const form = new FormData();
    form.append('action', 'pinterest_action');
    form.append('pinterest', `pinterest_video_url=${encodeURIComponent(url)}`);

    const response = await axios.post('https://pintodown.com/wp-admin/admin-ajax.php', form, {
      headers: {
        ...form.getHeaders(),
        'authority': 'pintodown.com',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'origin': 'https://pintodown.com',
        'referer': 'https://pintodown.com/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    });

    const data = response.data.data;

    return res.json({
      answer: {
        mediaType: data.media_type,
        url: data.pin_url,
        poster: data.poster,
        video: data.video,
        title: data.title
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };