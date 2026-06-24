// jo.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const meta = {
  name: 'jo',
  desc: 'Generate a jo image with an overlay image',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'image',
      desc: 'URL of the image to overlay',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let image;
  if (req.method === 'POST') {
    ({ image } = req.body);
  } else {
    ({ image } = req.query);
  }
  if (!image) {
    return res.status(400).json({
      error: 'Missing required parameter: image'
    });
  }
  try {
    const canvas = createCanvas(600, 337);
    const ctx = canvas.getContext('2d');

    const bgUrl = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/20211104-094134.png';

    ctx.save();
    ctx.beginPath();
    ctx.rotate(-8 * Math.PI / 180);
    const overlayImage = await loadImage(image);
    ctx.drawImage(overlayImage, 120, 173, 161, 113);
    ctx.restore();

    const bg = await loadImage(bgUrl);
    ctx.drawImage(bg, 0, 0, 600, 337);

    const buffer = await canvas.encode('png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };