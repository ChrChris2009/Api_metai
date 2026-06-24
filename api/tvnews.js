const { Canvas, createCanvas, loadImage } = require('@napi-rs/canvas');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const meta = {
  name: 'TV News',
  desc: 'Generate a realistic TV news broadcast style image with headline, optional background and ticker text',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'headline',
      desc: 'The main headline text for the news',
      example: 'Breaking: Aliens Invade Earth',
      required: true
    },
    {
      name: 'bg',
      desc: 'Optional URL to the background image (defaults to a professional news studio)',
      example: 'https://t3.ftcdn.net/jpg/05/10/02/94/360_F_510029428_jEAIzygxz7TDH8szCuPnkwLnENTPVPTG.jpg',
      required: false
    },
    {
      name: 'ticker',
      desc: 'Optional text for the bottom news ticker (defaults to headline)',
      example: 'Stay tuned for more updates...',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  let headline, bg, ticker;
  if (req.method === 'POST') {
    ({ headline, bg, ticker } = req.body);
  } else {
    ({ headline, bg, ticker } = req.query);
  }

  if (!headline) {
    return res.status(400).json({ error: 'Missing required parameter: headline' });
  }

  headline = headline.toUpperCase();

  bg ||= 'https://media.istockphoto.com/id/1498903460/photo/tv-news-studio-background.jpg';

  if (!isValidURL(bg)) {
    return res.status(400).json({ error: 'Invalid bg URL' });
  }

  ticker ||= headline;
  ticker = ticker.toUpperCase();

  try {
    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw background with cover fit
    const bgImg = await loadImage(bg);
    const bgScale = Math.max(width / bgImg.width, height / bgImg.height);
    const bgSourceWidth = width / bgScale;
    const bgSourceHeight = height / bgScale;
    const bgSourceX = (bgImg.width - bgSourceWidth) / 2;
    const bgSourceY = (bgImg.height - bgSourceHeight) / 2;
    ctx.drawImage(bgImg, bgSourceX, bgSourceY, bgSourceWidth, bgSourceHeight, 0, 0, width, height);

    // Headline with shadow and word wrap
    ctx.font = 'bold 45px Arial';
    const headlineX = 40;
    const lineHeight = 50;
    const maxHeadlineWidth = width - 80;
    const headlineLines = wrapText(ctx, headline, headlineX, 0, maxHeadlineWidth, lineHeight);
    const numLines = headlineLines.length;
    const headlineTotalHeight = numLines * lineHeight;

    // Calculate chyron height dynamically
    const chyronPaddingTop = 20;
    const chyronPaddingBottom = 60;
    const chyronHeight = chyronPaddingTop + headlineTotalHeight + chyronPaddingBottom;
    const chyronY = height - chyronHeight;

    // Chyron bar with semi-transparent gradient
    const chyronGradient = ctx.createLinearGradient(0, chyronY, 0, height);
    chyronGradient.addColorStop(0, 'rgba(0,0,0,0.7)');
    chyronGradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = chyronGradient;
    ctx.fillRect(0, chyronY, width, chyronHeight);

    // Breaking news banner adjusted to text size
    ctx.font = 'bold 50px Arial';
    const breakingText = 'BREAKING NEWS';
    const breakingWidth = ctx.measureText(breakingText).width;
    const bannerPaddingX = 40;
    const bannerHeight = 80;
    const bannerWidth = breakingWidth + bannerPaddingX * 2;
    const bannerX = 40;
    const bannerY = chyronY - bannerHeight - 10;
    const bannerGradient = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerHeight);
    bannerGradient.addColorStop(0, '#ff0000');
    bannerGradient.addColorStop(1, '#cc0000');
    ctx.fillStyle = bannerGradient;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 10);
    ctx.fill();

    // Breaking news text with shadow
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(breakingText, bannerX + bannerWidth / 2, bannerY + bannerHeight / 2);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw headline
    ctx.font = 'bold 45px Arial';
    ctx.fillStyle = 'white';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const headlineY = chyronY + chyronPaddingTop;
    headlineLines.forEach((line, i) => {
      ctx.fillText(line, headlineX, headlineY + i * lineHeight);
    });
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Ticker bar
    ctx.fillStyle = 'rgba(50,50,50,0.9)';
    ctx.fillRect(0, height - 40, width, 40);
    ctx.font = 'bold 25px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(ticker, 20, height - 20);

    // LIVE indicator adjusted to text size
    ctx.font = 'bold 30px Arial';
    const liveText = 'LIVE';
    const liveWidth = ctx.measureText(liveText).width;
    const liveCircleRadius = 10;
    const liveCircleMargin = 10;
    const livePadding = 20;
    const liveBoxWidth = livePadding + (liveCircleRadius * 2) + liveCircleMargin + liveWidth + livePadding;
    const liveBoxHeight = 50;
    const liveBoxX = 40;
    const liveBoxY = 40;
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.roundRect(liveBoxX, liveBoxY, liveBoxWidth, liveBoxHeight, 10);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(liveBoxX + livePadding + liveCircleRadius, liveBoxY + liveBoxHeight / 2, liveCircleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(liveText, liveBoxX + livePadding + (liveCircleRadius * 2) + liveCircleMargin, liveBoxY + liveBoxHeight / 2);

    // News channel logo
    ctx.font = 'bold 40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText('GLOBAL NEWS NETWORK', width - 40, 40);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Current time
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    ctx.font = '25px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(currentTime, width - 40, 90);

    const buffer = canvas.toBuffer('image/png');
    res.type('image/png').send(buffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

module.exports = { meta, onStart };