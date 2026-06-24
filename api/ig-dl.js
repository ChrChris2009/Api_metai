// Modified ig-dl.js
const axios = require("axios");
const cheerio = require("cheerio");

const meta = {
  name: "Instagram Downloader",
  desc: "Download Instagram videos and reels without watermark",
  method: [ 'get', 'post' ],
  category: "downloader",
  params: [
    {
      name: 'url',
      desc: 'The Instagram video or reel URL',
      example: 'https://www.instagram.com/reel/ABC123/',
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

  const downloadUrl = `https://snapdownloader.com/tools/instagram-reels-downloader/download?url=${encodeURIComponent(url)}`;

  try {
    const { data: html } = await axios.get(downloadUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
      }
    });

    const $ = cheerio.load(html);

    const videoUrl = $('div.download-item a[href*="cdninstagram.com"]').attr('href');
    const thumbnail = $('div.download-item img').attr('src');

    if (!videoUrl) {
      return res.status(404).json({ error: "Video not found or private" });
    }

    return res.json({
      answer: {
        videoUrl: videoUrl,
        thumbnail: thumbnail
      }
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };