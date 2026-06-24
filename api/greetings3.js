const { createCanvas, loadImage: loadImageOrig } = require('@napi-rs/canvas');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

class Greetings3 {
  constructor() {
    this.welcomeBg = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/20210811-204006.jpg';
    this.goodbyeBg = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/20210811-203941.jpg';
    this.bg = null;
    this.avatar = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/rin.jpg';
    this.username = 'Lenz';
    this.type = null;
  }

  setType(value) {
    this.type = value;
    if (!this.bg) {
      this.bg = value === 'welcome' ? this.welcomeBg : this.goodbyeBg;
    }
    return this;
  }

  setAvatar(value) {
    this.avatar = value;
    return this;
  }

  setUsername(value) {
    this.username = value;
    return this;
  }

  setBg(value) {
    this.bg = value;
    return this;
  }

  async toAttachment() {
    if (!this.bg) {
      throw new Error('Background URL is required');
    }

    const canvas = createCanvas(650, 300);
    const ctx = canvas.getContext('2d');

    const background = await loadImageOrig(this.bg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    let usrname = this.username;
    let name = usrname.length > 10 ? usrname.substring(0, 10) + '...' : usrname;
    ctx.globalAlpha = 1;
    ctx.font = 'bold 45px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 290, 338);

    ctx.globalAlpha = 1;
    ctx.font = 'bold 30px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(name, 325, 273);

    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'white';
    ctx.arc(325, 150, 75, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await loadImageOrig(this.avatar);
    ctx.drawImage(avatar, 250, 75, 150, 150);
    ctx.restore();

    return canvas.toBuffer('image/png');
  }
}

const meta = {
  name: 'greetings 3',
  desc: 'Generate a welcome or goodbye image',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'type',
      desc: 'Type of greeting',
      options: ['welcome', 'goodbye'],
      example: 'welcome',
      required: true
    },
    {
      name: 'avatar',
      desc: 'URL to the avatar image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    },
    {
      name: 'username',
      desc: 'The username to display',
      example: 'AjiroDesu',
      required: true
    },
    {
      name: 'bg',
      desc: 'URL to the background image (optional, defaults to a predefined background based on type)',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/backiee-265579-landscape.jpg',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  let avatar, username, bg, type;
  if (req.method === 'POST') {
    ({ avatar, username, bg, type } = req.body);
  } else {
    ({ avatar, username, bg, type } = req.query);
  }

  if (!type || !['welcome', 'goodbye'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing type parameter: must be "welcome" or "goodbye"' });
  }

  if (!avatar || !username) {
    return res.status(400).json({ error: 'Missing required parameters: avatar, username' });
  }

  if (!isValidURL(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar URL' });
  }

  if (bg && !isValidURL(bg)) {
    return res.status(400).json({ error: 'Invalid bg URL' });
  }

  try {
    const greetings = new Greetings3();
    greetings.setType(type);
    greetings.setAvatar(avatar);
    greetings.setUsername(username);
    if (bg) {
      greetings.setBg(bg);
    }

    const buffer = await greetings.toAttachment();
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };