// Modified fbdlv2.js
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

const meta = {
  name: "Facebook Downloader V2",
  desc: "Extract downloadable links and metadata from a Facebook video URL using saveas.co",
  method: [ 'get', 'post' ],
  category: "downloader",
  params: [
    {
      name: 'url',
      desc: 'Direct Facebook video URL to extract download links from',
      example: 'https://www.facebook.com/watch?v=123456789',
      required: true
    }
  ]
};

async function asu(url) {
  try {
    const payload = qs.stringify({ fb_url: url });
    const res = await axios.post(
      "https://saveas.co/smart_download.php",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
        },
        timeout: 15000,
      }
    );

    const $ = cheerio.load(res.data);
    const thumb = $(".box img").attr("src") || null;
    const title = $(".box .info h2").text().trim() || null;
    const desc =
      $(".box .info p").first().text().replace("Description:", "").trim() ||
      null;
    const duration =
      $(".box .info p").last().text().replace("Duration:", "").trim() || null;
    const sd = $("#sdLink").attr("href") || null;
    const hd = $("#hdLink").attr("href") || null;

    return { title, desc, duration, thumb, sd, hd };
  } catch (e) {
    return { status: "error", message: e.message || String(e) };
  }
}

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

  try {
    const result = await asu(url);

    if (result?.status === "error") {
      return res.status(500).json({
        error: result.message || "Failed to extract data"
      });
    }

    return res.json({
      answer: result
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Internal server error"
    });
  }
}

module.exports = { meta, onStart };