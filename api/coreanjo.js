// coreanjo.js
const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const meta = {
  name: 'coreanjo',
  desc: 'Generate a Corean jo image using Delirius NSFW API',
  method: ['get', 'post'],
  category: 'nsfw',
  params: []
};

async function onStart({ req, res }) {
  try {
    // 1️⃣ Fetch Corean image
    const response = await axios.get('https://delirius-apiofc.vercel.app/nsfw/corean', {
      responseType: 'arraybuffer'
    });

    // 2️⃣ Convert fetched image to data URL
    const coreanImageUrl = `data:${response.headers['content-type']};base64,${Buffer.from(response.data).toString('base64')}`;

    // 3️⃣ Canvas setup
    const canvas = createCanvas(600, 337);
    const ctx = canvas.getContext('2d');

    const bgUrl =
      'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/20211104-094134.png';

    // 4️⃣ Draw Corean image (overlay)
    ctx.save();
    ctx.beginPath();
    ctx.rotate(-8 * Math.PI / 180);
    const coreanImage = await loadImage(coreanImageUrl);
    ctx.drawImage(coreanImage, 120, 173, 161, 113);
    ctx.restore();

    // 5️⃣ Draw background (frame)
    const bg = await loadImage(bgUrl);
    ctx.drawImage(bg, 0, 0, 600, 337);

    // 6️⃣ Return image
    const buffer = await canvas.encode('png');
    res.type('image/png').send(buffer);

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
