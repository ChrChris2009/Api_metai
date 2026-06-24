// greeting.js
const { createCanvas, loadImage: loadImageOrig } = require('@napi-rs/canvas');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function formatVariable(prefix, variable) {
  return prefix + variable.charAt(0).toUpperCase() + variable.slice(1);
}

class Greeting {
  constructor() {
    this.bg = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/1px.png";
    this.avatar = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/default-avatar.png";
    this.guildIcon = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/default-avatar.png";
    this.username = "Clyde";
    this.guildName = "ServerName";
    this.memberCount = "0";
    this.colorTitleBorder = "#000000";
    this.colorMemberCount = "#ffffff";
    this.textMemberCount = "- {count}th member !";
    this.colorBorder = "#000000";
    this.colorUsername = "#ffffff";
    this.colorUsernameBox = "#000000";
    this.opacityUsernameBox = "0.4";
    this.colorDiscriminator = "#ffffff";
    this.opacityDiscriminatorBox = "0.4";
    this.colorDiscriminatorBox = "#000000";
    this.colorMessage = "#ffffff";
    this.colorHashtag = "#ffffff";
    this.colorBackground = "#000000";
    this.opacityBorder = "0.4";
    this.assent = "";
    this.textMessage = "{server}";
    this.colorAvatar = "#ffffff"; // Default for avatar and guild icon borders
  }

  setAvatar(value) {
    this.avatar = value;
    return this;
  }

  setGuildIcon(value) {
    this.guildIcon = value;
    return this;
  }

  setUsername(value) {
    this.username = value;
    return this;
  }

  setGuildName(value) {
    this.guildName = value;
    return this;
  }

  setMemberCount(value) {
    this.memberCount = value;
    return this;
  }

  setBg(value) {
    this.bg = value;
    return this;
  }

  setColor(variable, value) {
    const formattedVariable = formatVariable("color", variable);
    if (this[formattedVariable]) this[formattedVariable] = value;
    return this;
  }

  setText(variable, value) {
    const formattedVariable = formatVariable("text", variable);
    if (this[formattedVariable]) this[formattedVariable] = value;
    return this;
  }

  setOpacity(variable, value) {
    const formattedVariable = formatVariable("opacity", variable);
    if (this[formattedVariable]) this[formattedVariable] = value;
    return this;
  }

  async toAttachment() {
    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext("2d");

    const message = this.textMessage.replace(/{server}/g, this.guildName);
    const memberCountText = this.textMemberCount.replace(/{count}/g, this.memberCount);

    // Fill background color
    ctx.fillStyle = this.colorBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    let background = await loadImageOrig(this.bg);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw overlay image
    let overlay = await loadImageOrig(this.assent);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

    // Draw username
    ctx.globalAlpha = 1;
    ctx.font = "bold 45px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = this.colorUsername;
    ctx.fillText(this.username, canvas.width - 890, canvas.height - 60);

    // Draw member count
    ctx.fillStyle = this.colorMemberCount;
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(memberCountText, 90, canvas.height - 15);

    // Draw guild name
    ctx.globalAlpha = 1;
    ctx.font = "bold 45px sans-serif";
    ctx.textAlign = 'center';
    ctx.fillStyle = this.colorMessage;
    let guildDisplayName = message.length > 13 ? message.substring(0, 10) + "..." : message;
    ctx.fillText(guildDisplayName, canvas.width - 225, canvas.height - 44);

    // Draw avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = this.colorAvatar;
    ctx.arc(180, 160, 110, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    let avatarImg = await loadImageOrig(this.avatar);
    ctx.drawImage(avatarImg, 45, 40, 270, 270);
    ctx.restore();

    // Draw guild icon circle
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = this.colorAvatar;
    ctx.arc(canvas.width - 150, canvas.height - 200, 80, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    let guildImg = await loadImageOrig(this.guildIcon);
    ctx.drawImage(guildImg, canvas.width - 230, canvas.height - 280, 160, 160);
    ctx.restore();

    return canvas.toBuffer('image/png');
  }
}

const meta = {
  name: 'greetings',
  desc: 'Generate a welcome or goodbye image',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'type',
      desc: 'The type of greeting: welcome or goodbye',
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
      name: 'guildIcon',
      desc: 'URL to the guild icon image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1760059385426.jpg',
      required: true
    },
    {
      name: 'bg',
      desc: 'URL to the background image',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/backiee-265579-landscape.jpg',
      required: true
    },
    {
      name: 'username',
      desc: 'The username to display',
      example: 'AjiroDesu',
      required: true
    },
    {
      name: 'guildName',
      desc: 'The guild name to display',
      example: 'My Server',
      required: true
    },
    {
      name: 'memberCount',
      desc: 'The member count to display',
      example: '100',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let type, avatar, guildIcon, bg, username, guildName, memberCount;
  if (req.method === 'POST') {
    ({ type, avatar, guildIcon, bg, username, guildName, memberCount } = req.body);
  } else {
    ({ type, avatar, guildIcon, bg, username, guildName, memberCount } = req.query);
  }

  if (!type || !avatar || !guildIcon || !bg || !username || !guildName || !memberCount) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  if (!isValidURL(avatar)) {
    return res.status(400).json({ error: 'Invalid avatar URL' });
  }

  if (!isValidURL(guildIcon)) {
    return res.status(400).json({ error: 'Invalid guildIcon URL' });
  }

  if (!isValidURL(bg)) {
    return res.status(400).json({ error: 'Invalid bg URL' });
  }

  try {
    const greeting = new Greeting();
    if (type.toLowerCase() === 'welcome') {
      greeting.textMessage = "{server}";
      greeting.colorAvatar = "#03A9F4"; // Using colorTitle from original for borders
      greeting.assent = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/welcome.png";
    } else if (type.toLowerCase() === 'goodbye') {
      greeting.textMessage = "{server}";
      greeting.colorAvatar = "#df0909"; // Using colorTitle from original for borders
      greeting.assent = "https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/goodbye.png";
    } else {
      return res.status(400).json({ error: 'Invalid type: must be welcome or goodbye' });
    }

    greeting.setAvatar(avatar);
    greeting.setGuildIcon(guildIcon);
    greeting.setBg(bg);
    greeting.setUsername(username);
    greeting.setGuildName(guildName);
    greeting.setMemberCount(memberCount);

    const buffer = await greeting.toAttachment();
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };