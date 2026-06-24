const { createCanvas, loadImage, Path2D } = require('@napi-rs/canvas');

const meta = {
  name: 'X Post',
  desc: 'Generate a pixel-perfect fake X (Twitter) post with authentic themes, metrics, and icons.',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    { name: 'text', desc: 'The main text content', example: 'Just bought a new tesla using dogecoin.', required: true },
    { name: 'name', desc: 'Display name', example: 'Elon Musk', required: false },
    { name: 'username', desc: 'Username without @', example: 'elonmusk', required: false },
    { name: 'avatar_url', desc: 'Avatar URL', example: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png', required: false },
    { name: 'time', desc: 'Time string', example: '4:20 PM', required: false },
    { name: 'date', desc: 'Date string', example: 'Jun 9, 2024', required: false },
    { name: 'views', desc: 'View count', example: '42.6M', required: false },
    { name: 'reposts', desc: 'Repost count', example: '12K', required: false },
    { name: 'likes', desc: 'Like count', example: '145K', required: false },
    { name: 'bookmarks', desc: 'Bookmark count', example: '2.5K', required: false },
    { name: 'verified', desc: 'Show verified badge', example: 'true', options: ['true', 'false'], required: false },
    { name: 'theme', desc: 'Color theme', example: 'dark', options: ['light', 'dim', 'dark'], required: false }
  ]
};

// --- Asset Paths (SVG Data) ---
const ICONS = {
  verified: "M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.687.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.589 2.589 4.4-5.624 1.56 1.195-5.413 6.569z",
  reply: "M1.751 10c0-4.42 3.584-8 8.025-8 4.466 0 8.025 3.58 8.025 8S14.241 18 9.776 18c-1.077 0-2.131-.214-3.102-.62l-3.128 1.564-.587-2.933C1.989 14.72 1.751 12.41 1.751 10zM9.776 3.5c-3.587 0-6.525 2.913-6.525 6.5s2.937 6.5 6.525 6.5c.875 0 1.727-.174 2.515-.514l2.545-1.273.476-2.382c.79-1.358.99-2.903.99-3.83 0-3.587-2.938-6.5-6.525-6.5z",
  repost: "M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z",
  like: "M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.894 1.81.846 4.17-.514 6.67z",
  bookmark: "M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z",
  share: "M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z",
  dots: "M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
};

// --- Helper Functions ---
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  let lines = [];
  let line = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(line + " " + word).width;
    if (width < maxWidth) {
      line += " " + word;
    } else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}

function drawPath(ctx, pathString, x, y, scale = 1, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  const p = new Path2D(pathString);
  ctx.fill(p);
  ctx.restore();
}

async function onStart({ req, res }) {
  // 1. Parse Inputs
  const input = req.method === 'POST' ? req.body : req.query;

  const config = {
    text: input.text || 'Hello world! This is a generated X post.',
    name: input.name || 'X User',
    username: (input.username || 'xuser').replace('@', ''),
    avatar_url: input.avatar_url,
    time: input.time || '9:41 AM',
    date: input.date || 'Jun 22, 2024',
    views: input.views || '1.2M',
    reposts: input.reposts || '2.1K',
    likes: input.likes || '14K',
    bookmarks: input.bookmarks || '420',
    verified: input.verified === 'true' || input.verified === true,
    theme: ['light', 'dim', 'dark'].includes(input.theme) ? input.theme : 'dark' // Default to dark (lights out)
  };

  // 2. Theme Definitions (Authentic X Colors)
  const THEMES = {
    light: {
      bg: '#ffffff',
      text: '#0f1419',
      subText: '#536471',
      border: '#eff3f4',
      blue: '#1d9bf0',
      green: '#00ba7c',
      pink: '#f91880'
    },
    dim: {
      bg: '#15202b',
      text: '#f7f9f9',
      subText: '#8b98a5',
      border: '#38444d',
      blue: '#1d9bf0',
      green: '#00ba7c',
      pink: '#f91880'
    },
    dark: {
      bg: '#000000',
      text: '#e7e9ea',
      subText: '#71767b',
      border: '#2f3336',
      blue: '#1d9bf0',
      green: '#00ba7c',
      pink: '#f91880'
    }
  };

  const colors = THEMES[config.theme];

  // 3. Set up Layout Dimensions
  const scale = 2; // High DPI
  const width = 600;
  const margin = 20;
  const avatarSize = 48;
  const headerHeight = 60;

  // Pre-calculate Text Height
  const tempCanvas = createCanvas(width, 500);
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.font = '23px Helvetica, Arial, sans-serif'; // Main text size
  const textMaxWidth = width - (margin * 2);
  const textLines = wrapText(tempCtx, config.text, textMaxWidth);
  const lineHeight = 32;
  const textBlockHeight = textLines.length * lineHeight;

  // Layout Blocks
  const metaY = margin + headerHeight + textBlockHeight + 15;
  const metaHeight = 30;
  const divider1Y = metaY + metaHeight + 10;
  const statsY = divider1Y + 15;
  const statsHeight = 20;
  const divider2Y = statsY + statsHeight + 15;
  const actionsY = divider2Y + 15;
  const actionsHeight = 30;

  const totalHeight = actionsY + actionsHeight + margin;

  // 4. Initialize Real Canvas
  const canvas = createCanvas(width * scale, totalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, totalHeight);

  // --- RENDERING ---

  // A. Header (Avatar, Name, Handle)
  try {
    // Avatar
    let avatar;
    if (config.avatar_url) {
      avatar = await loadImage(config.avatar_url);
    } else {
      // Fallback Avatar
      const avCanvas = createCanvas(avatarSize, avatarSize);
      const avCtx = avCanvas.getContext('2d');
      avCtx.fillStyle = config.theme === 'light' ? '#cfd9de' : '#333639';
      avCtx.fillRect(0, 0, avatarSize, avatarSize);
      avatar = avCanvas;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(margin + avatarSize/2, margin + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, margin, margin, avatarSize, avatarSize);
    ctx.restore();

    // Name
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
    const nameX = margin + avatarSize + 12;
    const nameY = margin + 18;
    ctx.fillText(config.name, nameX, nameY);

    // Verified Badge
    if (config.verified) {
      const nameWidth = ctx.measureText(config.name).width;
      const badgeScale = 0.9;
      drawPath(ctx, ICONS.verified, nameX + nameWidth + 4, nameY - 12, badgeScale, colors.blue);
    }

    // Handle
    ctx.fillStyle = colors.subText;
    ctx.font = '15px Helvetica, Arial, sans-serif';
    ctx.fillText(`@${config.username}`, nameX, nameY + 20);

    // Dots Icon (Top Right)
    drawPath(ctx, ICONS.dots, width - margin - 20, margin + 10, 1, colors.subText);

  } catch (e) { console.error("Header error", e); }

  // B. Main Text
  ctx.fillStyle = colors.text;
  ctx.font = '23px Helvetica, Arial, sans-serif';
  let currentY = margin + headerHeight + 10; // Start below header
  textLines.forEach(line => {
    ctx.fillText(line, margin, currentY);
    currentY += lineHeight;
  });

  // C. Metadata (Time · Date · Views)
  const metaFontSize = '15px Helvetica, Arial, sans-serif';
  ctx.font = metaFontSize;
  ctx.fillStyle = colors.subText;

  const timeWidth = ctx.measureText(config.time).width;
  const dateWidth = ctx.measureText(config.date).width;
  const dotWidth = ctx.measureText(" · ").width;

  // Draw Time
  ctx.fillText(config.time, margin, metaY + 20);

  // Draw Dot
  ctx.fillText("·", margin + timeWidth + 2, metaY + 20);

  // Draw Date
  ctx.fillText(config.date, margin + timeWidth + dotWidth, metaY + 20);

  // Draw Dot
  const dateEnd = margin + timeWidth + dotWidth + dateWidth + 2;
  ctx.fillText("·", dateEnd, metaY + 20);

  // Draw Views (White/Black bold, label gray)
  ctx.fillStyle = colors.text;
  ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
  const viewsX = dateEnd + dotWidth;
  ctx.fillText(config.views, viewsX, metaY + 20);
  const viewsValWidth = ctx.measureText(config.views).width;

  ctx.fillStyle = colors.subText;
  ctx.font = '15px Helvetica, Arial, sans-serif';
  ctx.fillText("Views", viewsX + viewsValWidth + 4, metaY + 20);

  // D. Divider 1
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, divider1Y);
  ctx.lineTo(width - margin, divider1Y);
  ctx.stroke();

  // E. Stats (Reposts, Quotes, Likes, Bookmarks)
  // Helper to draw stat item
  let statX = margin;
  const drawStat = (val, label) => {
    if (!val) return;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 15px Helvetica, Arial, sans-serif';
    ctx.fillText(val, statX, statsY + 15);
    const valWidth = ctx.measureText(val).width;

    ctx.fillStyle = colors.subText;
    ctx.font = '15px Helvetica, Arial, sans-serif';
    ctx.fillText(label, statX + valWidth + 4, statsY + 15);

    const labelWidth = ctx.measureText(label).width;
    statX += valWidth + labelWidth + 20; // spacing
  };

  drawStat(config.reposts, "Reposts");
  drawStat(config.likes, "Likes");
  drawStat(config.bookmarks, "Bookmarks");

  // F. Divider 2
  ctx.beginPath();
  ctx.moveTo(margin, divider2Y);
  ctx.lineTo(width - margin, divider2Y);
  ctx.stroke();

  // G. Action Icons (Bottom Row)
  const iconY = actionsY;
  const iconScale = 1.1;
  const sectionWidth = (width - margin * 2) / 4; // 4 icons distributed

  // Reply
  drawPath(ctx, ICONS.reply, margin + (sectionWidth * 0) + 10, iconY, iconScale, colors.subText);
  // Repost
  drawPath(ctx, ICONS.repost, margin + (sectionWidth * 1) + 10, iconY, iconScale, colors.subText);
  // Like
  drawPath(ctx, ICONS.like, margin + (sectionWidth * 2) + 10, iconY, iconScale, colors.subText);
  // Share
  drawPath(ctx, ICONS.share, margin + (sectionWidth * 3) + 10, iconY, iconScale, colors.subText);

  // 5. Output
  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
}

module.exports = { meta, onStart };