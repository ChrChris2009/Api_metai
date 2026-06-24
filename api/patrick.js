// patrick.js
const { createCanvas, loadImage: loadImageOrig } = require('@napi-rs/canvas');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

class Patrick {
  constructor() {
    this.frame = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/Patrick-scary.png";
    this.avatar = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/uzmfBO4.jpg";
  }

  setAvatar(value) {
    this.avatar = value;
    return this;
  }

  setFrame(value) {
    this.frame = value;
    return this;
  }

  async toAttachment() {
    const canvas = createCanvas(850, 1280);
    const ctx = canvas.getContext("2d");

    let avatar = await loadImageOrig(this.avatar);
    ctx.drawImage(avatar, 180, 49, 470, 570);

    let img = await loadImageOrig(this.frame);
    ctx.drawImage(img, 0, 0, 850, 1280);

    return canvas.toBuffer('image/png');
  }
}

const meta = {
  name: 'patrick',
  desc: 'Generate a Patrick image',
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
  let avatar, frame;
  if (req.method === 'POST') {
    ({ avatar } = req.body);
  } else {
    ({ avatar } = req.query);
  }

  if (!avatar) {
    return res.status(400).json({ error: 'Missing required parameters: avatar' });
  }

  if (!isValidURL(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar URL' });
  }


  try {
    const patrick = new Patrick();
    patrick.setAvatar(avatar);

    const buffer = await patrick.toAttachment();
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };