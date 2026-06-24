// Modified thrdsdl.js
const axios = require('axios');

const meta = {
  name: "Threads Downloader",
  desc: "API to download Threads videos",
  method: [ 'get', 'post' ],
  category: "downloader",
  params: [
    {
      name: 'url',
      desc: 'The Threads video URL',
      example: 'https://www.threads.net/@username/post/123',
      required: true
    }
  ]
};

async function onStart({ res, req }) {
  let url;
  if (req.method === 'POST') {
    ({ url } = req.body);
  } else {
    ({ url } = req.query);
  }
  if (!url) return res.status(400).json({ error: "Missing required parameter: url" });
  if (!url.includes("threads.net") && !url.includes("threads.com")) return res.status(400).json({ error: "Invalid Threads URL" });

  const encodedUrl = encodeURIComponent(url);
  const apiUrl = `https://www.threads-downloader.io/download?url=${encodedUrl}`;

  const headers = {
    'authority': 'www.threads-downloader.io',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'referer': 'https://www.threads-downloader.io/',
    'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
  };

  try {
    const { data } = await axios.get(apiUrl, { headers });

    if (!data.videoUrl || !data.imgUrl) return res.status(500).json({ error: "Failed to fetch video data" });

    return res.json({
      answer: {
        video_url: data.videoUrl,
        thumbnail: data.imgUrl
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };