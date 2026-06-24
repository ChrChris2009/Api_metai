// bonk.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const meta = {
  name: 'bonk',
  desc: 'Generate a bonk image with two avatars',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'avatar1',
      desc: 'URL of the first avatar image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    },
    {
      name: 'avatar2',
      desc: 'URL of the second avatar image',
      example: 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/IMG-20210621-WA0000.jpg',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let avatar1, avatar2;
  if (req.method === 'POST') {
    ({ avatar1, avatar2 } = req.body);
  } else {
    ({ avatar1, avatar2 } = req.query);
  }
  if (!avatar1 || !avatar2) {
    return res.status(400).json({
      error: 'Missing required parameters: avatar1 and avatar2'
    });
  }
  try {
    const canvas = createCanvas(600, 337);
    const ctx = canvas.getContext('2d');

    const bgUrl = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/11.jpg';
    const bg2Url = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/22.png';

    const background1 = await loadImage(bgUrl);
    ctx.drawImage(background1, 0, 0, 600, 337);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(422, 175, 40, 55, Math.PI / 4, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avawtar = await loadImage(avatar1);
    ctx.drawImage(avawtar, 373, 115, 110, 110);
    ctx.restore();

    const background2 = await loadImage(bg2Url);
    ctx.drawImage(background2, 0, 0, 600, 337);

    ctx.save();
    ctx.beginPath();
    ctx.arc(105, 100, 48, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await loadImage(avatar2);
    ctx.drawImage(avatar, 57, 56, 96, 96);
    ctx.restore();

    const buffer = await canvas.encode('png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };