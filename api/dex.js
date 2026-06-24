// dex.js
const axios = require("axios");

const meta = {
  name: "dex",
  desc: "Generate images from a prompt using Dex AI",
  method: ["get", "post"],
  category: "Image",
  params: [
    {
      name: "prompt",
      desc: "Description of the image to generate",
      example: "A cat",
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const body = req.method === "POST" ? req.body : req.query;
    const prompt = body.prompt;

    if (!prompt) {
      return res.status(400).json({
        status: false,
        error: "Missing required parameter: prompt"
      });
    }

    const { data } = await axios.get("http://65.109.80.126:20511/api/dex", {
      params: { prompt }
    });

    if (!data.status) {
      return res.status(500).json({
        status: false,
        error: "API returned an error"
      });
    }

    res.json({
      status: true,
      operator: "Christus",
      prompt,
      count: data.count,
      images: data.images.map(img => ({
        link: img.image_link,
        status: img.status
      }))
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message || "Internal server error"
    });
  }
}

module.exports = { meta, onStart };
