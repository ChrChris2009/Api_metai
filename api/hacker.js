const Canvas = require("@napi-rs/canvas");

const meta = {
  name: 'hacker',
  desc: 'Generate a hacker themed image with the provided text',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'text',
      desc: 'The text to display on the image',
      example: 'AjiroDesu',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let text;
  if (req.method === 'POST') {
    ({ text } = req.body);
  } else {
    ({ text } = req.query);
  }

  if (!text) {
    return res.status(400).json({ error: 'Missing required parameter: text' });
  }

  try {
    // Create canvas
    const canvas = Canvas.createCanvas(1024, 1024);
    const ctx = canvas.getContext("2d");

    const bg = await Canvas.loadImage("https://img.freepik.com/premium-vector/digital-background-green-matrix-binary-computer-code-vector-illustration-hacker-concept_105800-408.jpg");
    ctx.drawImage(bg, 0, 0, 1024, 1024);

    // text 1
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#77ffff";
    ctx.globalAlpha = 1;
    ctx.font = "bold 80px georgia";
    ctx.textAlign = 'center';
    ctx.fillStyle = "#c4ffff";
    ctx.fillText(text, 512, 290);

    // text 2
    ctx.font = "bold 80px georgia";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#7fffff";
    ctx.strokeStyle = "#7fffff";
    ctx.strokeText(text, 512, 390);

    // text 3
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#77ffff";
    ctx.globalAlpha = 1;
    ctx.font = "bold 80px georgia";
    ctx.textAlign = 'center';
    ctx.fillStyle = "#c4ffff";
    ctx.fillText(text, 512, 490);

    // text 4
    ctx.font = "bold 80px georgia";
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#7fffff";
    ctx.strokeStyle = "#7fffff";
    ctx.strokeText(text, 512, 590);

    // text 5
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#77ffff";
    ctx.globalAlpha = 1;
    ctx.font = "bold 80px georgia";
    ctx.textAlign = 'center';
    ctx.fillStyle = "#c4ffff";
    ctx.fillText(text, 512, 690);

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#cfffff";
    ctx.globalAlpha = 1;
    const heker = await Canvas.loadImage("https://raw.githubusercontent.com/Zaxerion/databased/refs/heads/main/asset/1622517139282.png");
    ctx.drawImage(heker, 0, 0, 1024, 1024);

    const buffer = canvas.toBuffer('image/png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };