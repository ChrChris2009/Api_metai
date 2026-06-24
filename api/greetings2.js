const { createCanvas, loadImage: loadImageOrig } = require('@napi-rs/canvas');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

class Greetings2 {
  constructor() {
    this.welcomeFm = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/20210818-120037.png';
    this.goodbyeFm = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/Goodbye2.png';
    this.bg = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRAJUlAjJvRP_n-rV7mmb6Xf3-Zutfy8agig&usqp=CAU';
    this.avatar = 'https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/rin.jpg';
    this.username = 'Lenz-cmd';
    this.groupname = 'SQUAD-404';
    this.member = '404';
    this.type = 'welcome';
  }

  setType(value) {
    this.type = value;
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

  setGroupname(value) {
    this.groupname = value;
    return this;
  }

  setMember(value) {
    this.member = value;
    return this;
  }

  async toAttachment() {
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');

    const background = await loadImageOrig(this.bg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const fmUrl = this.type === 'welcome' ? this.welcomeFm : this.goodbyeFm;
    const fram = await loadImageOrig(fmUrl);
    ctx.drawImage(fram, 0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.beginPath();
    ctx.rotate(-17 * Math.PI / 180);
    const avatar = await loadImageOrig(this.avatar);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.drawImage(avatar, -4, 130, 113, 113);
    ctx.strokeRect(-4, 130, 113, 113);
    ctx.restore();

    if (this.type === 'welcome') {
      let grpname = this.groupname || '';
      let name = grpname.length > 10 ? grpname.substring(0, 10) + '...' : grpname;
      ctx.globalAlpha = 1;
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, 392, 173);
    }

    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.member}th member`, 250, 290);

    let usrname = this.username;
    let namalu = usrname.length > 12 ? usrname.substring(0, 15) + '...' : usrname;
    ctx.globalAlpha = 1;
    ctx.font = 'bold 27px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(namalu, 242, 248);

    return canvas.toBuffer('image/png');
  }
}

const meta = {
  name: 'greetings 2',
  desc: 'Generate a welcome or goodbye image for a group',
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
      desc: 'URL to the background image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/backiee-265579-landscape.jpg',
      required: true
    },
    {
      name: 'groupname',
      desc: 'The group name to display (required for welcome type)',
      example: 'Ajiro HQ',
      required: false
    },
    {
      name: 'member',
      desc: 'The member count to display',
      example: '57',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let avatar, username, bg, groupname, member, type;
  if (req.method === 'POST') {
    ({ avatar, username, bg, groupname, member, type } = req.body);
  } else {
    ({ avatar, username, bg, groupname, member, type } = req.query);
  }

  if (!type || !['welcome', 'goodbye'].includes(type)) {
    return res.status(400).json({ error: 'Invalid or missing type parameter: must be "welcome" or "goodbye"' });
  }

  if (!avatar || !username || !bg || !member) {
    return res.status(400).json({ error: 'Missing required parameters: avatar, username, bg, member' });
  }

  if (type === 'welcome' && !groupname) {
    return res.status(400).json({ error: 'Missing groupname parameter for welcome type' });
  }

  if (!isValidURL(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar URL' });
  }

  if (!isValidURL(bg)) {
    return res.status(400).json({ error: 'Invalid bg URL' });
  }

  try {
    const greetings = new Greetings2();
    greetings.setType(type);
    greetings.setAvatar(avatar);
    greetings.setUsername(username);
    greetings.setBg(bg);
    if (groupname) greetings.setGroupname(groupname);
    greetings.setMember(member);

    const buffer = await greetings.toAttachment();
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };