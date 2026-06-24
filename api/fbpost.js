const { createCanvas, loadImage, Path2D } = require('@napi-rs/canvas');

const meta = {
  name: 'facebook-post',
  desc: 'Generate a pixel-perfect Facebook post with emoji support, avatars, comments, and reactions.',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    // Main Post Params
    { name: 'text', desc: 'Main post content (supports emojis)', example: 'So excited to announce our new project! 🚀✨', required: true },
    { name: 'image', desc: 'Post image URL', example: '', required: false },
    { name: 'name', desc: 'Author name', example: 'Mark Zuckerberg', required: false },
    { name: 'avatar', desc: 'Author avatar URL', example: '', required: false },
    { name: 'verified', desc: 'Author verified?', example: 'true', options: ['true', 'false'], required: false },
    { name: 'time', desc: 'Time (e.g., 2h)', example: '2h', required: false },

    // Stats Params
    { name: 'likes', desc: 'Reaction count (e.g. 1.2K)', example: '1.2K', required: false },
    { name: 'comments', desc: 'Comment count string', example: '45 comments', required: false },
    { name: 'shares', desc: 'Share count string', example: '12 shares', required: false },

    // Comment Params
    { name: 'c_text', desc: 'Comment text', example: 'This looks incredible! 🔥', required: false },
    { name: 'c_name', desc: 'Commenter name', example: 'Sheryl Sandberg', required: false },
    { name: 'c_time', desc: 'Comment time', example: '1h', required: false },
    { name: 'c_verified', desc: 'Commenter verified?', example: 'true', options: ['true', 'false'], required: false },
    { name: 'c_avatar', desc: 'Commenter avatar URL', example: '', required: false },

    // System Params
    { name: 'theme', desc: 'Light or Dark mode', example: 'light', options: ['light', 'dark'], required: false }
  ]
};

// --- ASSETS (SVG PATHS) ---
const ICONS = {
  globe: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  dots: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  thumbSolid: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 6.41 8.75C6.16 9 6 9.34 6 9.75v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z",
  thumbOutline: "M21.99 12.86l-1.99 4.67A1 1 0 0 1 19.08 18H10V9.07l4.14-4.14a.51.51 0 0 1 .36-.15.5.5 0 0 1 .36.15l.07.07.57 2.68a2.49 2.49 0 0 0 .43 1.12l.06.09H21a2 2 0 0 1 2 2v2.5a2 2 0 0 1-.01.47zM7 18H4v-8h3v8zm14-7.5h-6.66l1.13-5.32a2.51 2.51 0 0 0-2.16-2.96l-.31-.02-.35.03-.17.17L6.5 8.66V20h12.57a3 3 0 0 0 2.76-1.8l1.98-4.66A4 4 0 0 0 24 13v-2.5a.5.5 0 0 0-.5-.5z",
  heartSolid: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  comment: "M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z",
  share: "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",
  verified: "M10.65 1.15c.57-.68 1.58-.77 2.25-.19l.98.84c.26.22.59.33.93.29l1.28-.14c.88-.09 1.66.52 1.75 1.37l.14 1.28c.04.34.23.64.52.85l1.05.74c.72.51.88 1.48.37 2.19l-.74 1.05c-.2.28-.28.62-.22.96l.24 1.26c.17.87-.41 1.69-1.28 1.83l-1.27.2c-.34.05-.64.24-.85.52l-.74 1.05c-.51.71-1.48.87-2.19.37l-1.05-.75c-.28-.2-.62-.28-.96-.22l-1.26.24c-.87.17-1.69-.41-1.83-1.28l-.2-1.27c-.05-.34-.24-.64-.52-.85l-1.05-.74c-.71-.51-.87-1.48-.37-2.19l.75-1.05c.2-.28.28-.62.22-.96l-.24-1.26c-.17-.87.41-1.69 1.28-1.83l1.27-.2c.34-.05.64-.24.85-.52l.74-1.05z M11.6 12.6l5.4-6.2-1.2-1.2-4.1 4.8-2.1-2-1.3 1.3 3.3 3.3z"
};

// --- HELPERS ---
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

function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

async function onStart({ req, res }) {
  // 1. Parse Inputs
  const input = req.method === 'POST' ? req.body : req.query;

  const config = {
    text: input.text || 'This is a generated Facebook post.',
    image_url: input.image || input.image_url,
    name: input.name || 'Facebook User',
    avatar_url: input.avatar || input.avatar_url,
    verified: input.verified === 'true',
    time: input.time || '2h',

    likes: input.likes || '456',
    comments: input.comments || '88 comments',
    shares: input.shares || '12 shares',

    // Comment Data
    hasComment: !!input.c_text,
    commentText: input.c_text || '',
    commentName: input.c_name || 'Fan Name',
    commentVerified: input.c_verified === 'true',
    commentTime: input.c_time || '1h',
    commentAvatar: input.c_avatar || input.comment_avatar || '',

    theme: input.theme === 'dark' ? 'dark' : 'light'
  };

  // 2. Theme Definitions
  const THEMES = {
    light: {
      bg: '#ffffff',
      text: '#050505',
      subText: '#65676b',
      border: '#ced0d4',
      icon: '#65676b',
      reactionStroke: '#ffffff',
      commentBg: '#f0f2f5',
      commentText: '#050505',
      blue: '#1877f2'
    },
    dark: {
      bg: '#242526',
      text: '#e4e6eb',
      subText: '#b0b3b8',
      border: '#3e4042',
      icon: '#b0b3b8',
      reactionStroke: '#242526',
      commentBg: '#3a3b3c',
      commentText: '#e4e6eb',
      blue: '#1877f2'
    }
  };

  const colors = THEMES[config.theme];

  // 3. Setup Canvas Constants
  const scale = 2; 
  const cardWidth = 600; 
  const padding = 16; 
  const avatarSize = 40;
  const headerHeight = 60; 
  // Updated font stack to support emojis
  const fontFamily = 'Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif';

  // --- 4. CALCULATE LAYOUT ---

  const tempCanvas = createCanvas(cardWidth, 500);
  const tempCtx = tempCanvas.getContext('2d');

  // A. Post Text
  const hasImage = !!config.image_url;
  const isShortText = config.text.length < 85;
  const postFontSize = (isShortText && !hasImage) ? 22 : 15; 
  const postLineHeight = (isShortText && !hasImage) ? 28 : 20;

  tempCtx.font = `${postFontSize}px ${fontFamily}`;
  const textMaxWidth = cardWidth - (padding * 2);
  const textLines = wrapText(tempCtx, config.text, textMaxWidth);
  const textBlockHeight = textLines.length * postLineHeight;

  // B. Post Image
  let postImage = null;
  let imageHeight = 0;
  if (hasImage) {
    try {
      postImage = await loadImage(config.image_url);
      const ratio = postImage.height / postImage.width;
      imageHeight = cardWidth * ratio;
      if (imageHeight > 700) imageHeight = 700; // Cap height
    } catch (e) { console.error("Image error"); }
  }

  // C. Comment Section Layout
  let commentTotalHeight = 0;
  let commentLines = [];
  const commentAvatarSize = 32;
  const commentFontSize = 15;
  const commentLineHeight = 19;
  const commentBubblePaddingH = 12;
  const commentBubblePaddingV = 8;
  const commentGap = 8; 

  if (config.hasComment) {
    const maxBubbleWidth = cardWidth - (padding * 2) - commentAvatarSize - commentGap - (commentBubblePaddingH * 2);

    // Measure Name for width
    tempCtx.font = `bold 13px ${fontFamily}`;
    const nameWidth = tempCtx.measureText(config.commentName).width;
    const verifiedWidth = config.commentVerified ? 14 : 0;

    // Measure Text for wrapping
    tempCtx.font = `${commentFontSize}px ${fontFamily}`;
    commentLines = wrapText(tempCtx, config.commentText, maxBubbleWidth);

    // Bubble Dimensions
    const textBlockH = (commentLines.length * commentLineHeight);
    const bubbleHeight = 16 + 13 + 4 + textBlockH; // Padding + NameHeight + Gap + TextHeight

    // Meta text (Like Reply 1h) is below the bubble
    const metaHeight = 16; 

    commentTotalHeight = bubbleHeight + metaHeight + 4; // +4 for small gaps
  }

  // D. Calculate Y Positions
  const textTopY = headerHeight + 4;
  const imageTopY = textTopY + textBlockHeight + 12;
  const statsTopY = imageTopY + imageHeight + 10; // Stats line
  const statsRowHeight = 20;
  const dividerY = statsTopY + statsRowHeight + 10;
  const actionBarTopY = dividerY + 1;
  const actionBarHeight = 44;
  const divider2Y = actionBarTopY + actionBarHeight;

  let totalHeight = divider2Y;
  if (config.hasComment) {
     totalHeight += 12; // Gap before comments
     totalHeight += commentTotalHeight;
     totalHeight += 12; // Padding bottom
  } else {
     totalHeight += 2; // Tiny bottom padding if no comments
  }

  // --- 5. RENDER ---
  const canvas = createCanvas(cardWidth * scale, totalHeight * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, cardWidth, totalHeight);

  // > HEADER
  try {
    // Avatar
    let avatar;
    if (config.avatar_url) {
      avatar = await loadImage(config.avatar_url);
    } else {
      // Placeholder Avatar (Silhouette style)
      const avCanvas = createCanvas(avatarSize, avatarSize);
      const avCtx = avCanvas.getContext('2d');
      avCtx.fillStyle = '#e4e6eb';
      avCtx.beginPath();
      avCtx.arc(avatarSize/2, avatarSize/2, avatarSize/2, 0, Math.PI*2);
      avCtx.fill();
      avatar = avCanvas;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(padding + avatarSize/2, padding + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, padding, padding, avatarSize, avatarSize);
    ctx.restore();

    // Name
    ctx.fillStyle = colors.text;
    ctx.font = `bold 15px ${fontFamily}`;
    const nameX = padding + avatarSize + 10;
    const nameY = padding + 14;
    ctx.fillText(config.name, nameX, nameY);

    const mainNameW = ctx.measureText(config.name).width;
    if (config.verified) {
       drawPath(ctx, ICONS.verified, nameX + mainNameW + 4, nameY - 9, 0.7, colors.blue);
    }

    // Time & Globe
    ctx.fillStyle = colors.subText;
    ctx.font = `13px ${fontFamily}`;
    const timeY = nameY + 18;
    ctx.fillText(config.time, nameX, timeY);
    const timeWidth = ctx.measureText(config.time).width;
    ctx.fillText('·', nameX + timeWidth + 4, timeY);
    drawPath(ctx, ICONS.globe, nameX + timeWidth + 12, timeY - 9, 0.5, colors.subText);

    // Menu Dots
    drawPath(ctx, ICONS.dots, cardWidth - padding - 20, padding + 8, 1, colors.icon);
  } catch (e) {}

  // > BODY TEXT
  ctx.fillStyle = colors.text;
  ctx.font = `${postFontSize}px ${fontFamily}`;
  let currentLineY = textTopY + postFontSize; 
  textLines.forEach(line => {
    ctx.fillText(line, padding, currentLineY);
    currentLineY += postLineHeight;
  });

  // > IMAGE
  if (postImage && imageHeight > 0) {
    ctx.drawImage(postImage, 0, imageTopY, cardWidth, imageHeight);
  }

  // > STATS LINE
  const statsYCenter = statsTopY + 10;
  const iconRadius = 9;

  // Icons Layered
  ctx.beginPath();
  ctx.arc(padding + iconRadius, statsYCenter, iconRadius, 0, Math.PI*2);
  ctx.fillStyle = '#1877f2';
  ctx.fill();
  ctx.strokeStyle = colors.reactionStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  drawPath(ctx, ICONS.thumbSolid, padding + 4, statsYCenter - 6, 0.45, '#fff');

  ctx.beginPath();
  ctx.arc(padding + iconRadius + 14, statsYCenter, iconRadius, 0, Math.PI*2);
  ctx.fillStyle = '#fb404b';
  ctx.fill();
  ctx.stroke();
  drawPath(ctx, ICONS.heartSolid, padding + iconRadius + 9, statsYCenter - 6, 0.45, '#fff');

  // Like Count
  ctx.fillStyle = colors.subText;
  ctx.font = `15px ${fontFamily}`;
  const countX = padding + iconRadius + 32;
  ctx.fillText(config.likes, countX, statsYCenter + 5);

  // Comments/Shares (Right Aligned)
  const sharesW = ctx.measureText(config.shares).width;
  const commentsW = ctx.measureText(config.comments).width;

  ctx.fillText(config.shares, cardWidth - padding - sharesW, statsYCenter + 5);
  ctx.fillText(config.comments, cardWidth - padding - sharesW - 10 - commentsW, statsYCenter + 5);

  // > DIVIDER 1
  ctx.beginPath();
  ctx.moveTo(padding, dividerY);
  ctx.lineTo(cardWidth - padding, dividerY);
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // > ACTION BAR
  const btnW = (cardWidth - padding*2) / 3;
  const btnBaseX = padding;
  const btnIconY = actionBarTopY + 12;
  const btnTextY = actionBarTopY + 28;

  const drawBtn = (label, icon, idx) => {
     const cx = btnBaseX + (idx * btnW) + (btnW/2);
     ctx.font = `bold 14px ${fontFamily}`;
     const lw = ctx.measureText(label).width;
     const iw = 18; 
     const totalW = iw + 8 + lw;
     const startX = cx - (totalW/2);

     drawPath(ctx, icon, startX, btnIconY - 4, 0.9, colors.subText);
     ctx.fillStyle = colors.subText;
     ctx.fillText(label, startX + iw + 8, btnTextY);
  };

  drawBtn('Like', ICONS.thumbOutline, 0);
  drawBtn('Comment', ICONS.comment, 1);
  drawBtn('Share', ICONS.share, 2);

  // > DIVIDER 2 (If comments exist)
  if (config.hasComment) {
    ctx.beginPath();
    ctx.moveTo(padding, divider2Y);
    ctx.lineTo(cardWidth - padding, divider2Y);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    const commentY = divider2Y + 12;
    const commentX = padding + commentAvatarSize + commentGap;

    // Comment Avatar (Circular Clip)
    ctx.save();
    ctx.beginPath();
    ctx.arc(padding + commentAvatarSize/2, commentY + commentAvatarSize/2, commentAvatarSize/2, 0, Math.PI*2);
    ctx.clip();

    let cAvatarImg;
    try {
       if (config.commentAvatar) {
          cAvatarImg = await loadImage(config.commentAvatar);
       }
    } catch(e){}

    if (cAvatarImg) {
        ctx.drawImage(cAvatarImg, padding, commentY, commentAvatarSize, commentAvatarSize);
    } else {
        // Fallback placeholder
        ctx.fillStyle = '#e4e6eb';
        ctx.fill();
    }
    ctx.restore();

    // Calculate Bubble Width
    ctx.font = `bold 13px ${fontFamily}`;
    const nameW = ctx.measureText(config.commentName).width;
    const verW = config.commentVerified ? 14 : 0;
    const nameRowW = nameW + verW + 4;

    ctx.font = `${commentFontSize}px ${fontFamily}`;
    // Check max line width
    let maxLineW = 0;
    commentLines.forEach(l => {
       const w = ctx.measureText(l).width;
       if (w > maxLineW) maxLineW = w;
    });

    const contentW = Math.max(nameRowW, maxLineW);
    // Add padding
    const bubbleW = Math.min(contentW + (commentBubblePaddingH * 2), cardWidth - commentX - padding);
    const bubbleH = (commentBubblePaddingV*2) + 13 + 4 + (commentLines.length * commentLineHeight);

    // Draw Bubble
    drawRoundedRect(ctx, commentX, commentY, bubbleW, bubbleH, 18, colors.commentBg);

    // Draw Name
    ctx.fillStyle = colors.commentText;
    ctx.font = `bold 13px ${fontFamily}`;
    ctx.fillText(config.commentName, commentX + commentBubblePaddingH, commentY + commentBubblePaddingV + 11);

    if (config.commentVerified) {
        drawPath(ctx, ICONS.verified, commentX + commentBubblePaddingH + nameW + 3, commentY + commentBubblePaddingV + 2, 0.6, colors.blue);
    }

    // Draw Comment Text
    ctx.fillStyle = colors.commentText;
    ctx.font = `${commentFontSize}px ${fontFamily}`;
    let cLineY = commentY + commentBubblePaddingV + 11 + 4 + commentFontSize; 
    commentLines.forEach(l => {
       ctx.fillText(l, commentX + commentBubblePaddingH, cLineY);
       cLineY += commentLineHeight;
    });

    // Draw Meta (Like Reply Time)
    const metaY = commentY + bubbleH + 14;
    ctx.fillStyle = colors.subText;
    ctx.font = `bold 12px ${fontFamily}`;

    let metaX = commentX + 4; // Indented slightly from bubble start

    ctx.fillText('Like', metaX, metaY);
    metaX += ctx.measureText('Like').width + 10;

    ctx.fillText('Reply', metaX, metaY);
    metaX += ctx.measureText('Reply').width + 10;

    ctx.font = `12px ${fontFamily}`; // Time is usually not bold
    ctx.fillText(config.commentTime, metaX, metaY);
  }

  res.setHeader('Content-Type', 'image/png');
  res.send(canvas.toBuffer('image/png'));
}

module.exports = { meta, onStart };