// xnxx.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const meta = {
  name: 'xnxx',
  desc: 'Generate a custom image with a fixed background, overlay image, and title text',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'image',
      desc: 'URL of the image to overlay',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    },
    {
      name: 'title',
      desc: 'Text to display as the title',
      example: 'Kold Bantutan',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let image, title;
  if (req.method === 'POST') {
    ({ image, title } = req.body);
  } else {
    ({ image, title } = req.query);
  }
  if (!image || !title) {
    return res.status(400).json({
      error: 'Missing required parameters: image and title'
    });
  }
  try {
    const canvas = createCanvas(720, 790);
    const ctx = canvas.getContext('2d');

    const bgUrl = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/Xnxx.png';
    const bg = await loadImage(bgUrl);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const overlayImage = await loadImage(image);
    ctx.drawImage(overlayImage, 0, 20, 720, 457);

    let name = title.length > 20 ? title.substring(0, 20) + '...' : title;
    ctx.globalAlpha = 1;
    ctx.font = '700 45px Arial';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.fillText(name, 30, 535);

    const buffer = await canvas.encode('png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };