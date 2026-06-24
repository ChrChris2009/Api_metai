const Canvas = require("@napi-rs/canvas");

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const meta = {
  name: 'burn',
  desc: 'Generate a burn meme image with the provided avatar',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'avatar',
      desc: 'URL to the avatar image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let avatar;
  if (req.method === 'POST') {
    ({ avatar } = req.body);
  } else {
    ({ avatar } = req.query);
  }

  if (!avatar) {
    return res.status(400).json({ error: 'Missing required parameter: avatar' });
  }

  if (!isValidURL(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar URL' });
  }

  try {
    // Create canvas
    const canvas = Canvas.createCanvas(1057, 1280);
    const ctx = canvas.getContext("2d");

    const avatarImg = await Canvas.loadImage(avatar);
    ctx.drawImage(avatarImg, 70, 110, 340, 430);

    const frame = await Canvas.loadImage("https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/Spongebob.png");
    ctx.drawImage(frame, 0, 0, 1057, 1280);

    const buffer = canvas.toBuffer('image/png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };