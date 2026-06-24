// snews.js
const { Canvas, createCanvas, loadImage: loadImageOrig, SKRSContext2D, Path2D, CanvasGradient, CanvasTextAlign, CanvasTextBaseline } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let setupDone = false;

class CanvCass {

  static async singleSetup() {
    // Removed font registration
  }

  static createRect(basis) {
    const { width, height } = basis;

    if (typeof width !== "number" || typeof height !== "number") {
      throw new Error("createRect: width and height must be provided as numbers.");
    }

    const x = basis.centerX ?? basis.centerX;
    const y = basis.centerY ?? basis.centerY;

    const left = basis.left ?? (typeof x === "number" ? x - width / 2 : typeof basis.right === "number" ? basis.right - width : undefined);

    const top = basis.top ?? (typeof y === "number" ? y - height / 2 : typeof basis.bottom === "number" ? basis.bottom - height : undefined);

    if (typeof left !== "number" || typeof top !== "number") {
      throw new Error("createRect: insufficient data to calculate position. Provide at least (x/y), (right/bottom), or (left/top).");
    }

    return {
      width,
      height,
      left,
      top,
      right: left + width,
      bottom: top + height,
      centerX: left + width / 2,
      centerY: top + height / 2,
    };
  }

  static rectToPath(rect) {
    const path = new Path2D();
    path.rect(rect.left, rect.top, rect.width, rect.height);
    return path;
  }

  static createCirclePath(center, radius) {
    const path = new Path2D();
    path.arc(center[0], center[1], radius, 0, Math.PI * 2);
    return path;
  }

  static colorA = "#9700af";
  static colorB = "#a69a00";

  static async loadImage(source, options) {
    const tries = 5;
    let i = 0;
    while (i <= tries) {
      i++;
      try {
        return await loadImageOrig(source, options);
      } catch (error) {
        await delay(500);
        continue;
      }
    }
  }

  constructor(...args) {
    let config;
    if (typeof args[0] === "number" && typeof args[1] === "number") {
      config = {
        width: args[0],
        height: args[1],
      };
    } else if (args[0] && "width" in args[0] && "height" in args[0]) {
      config = args[0];
    } else {
      throw new TypeError("Invalid First Parameter (Config)");
    }

    config.background ??= null;

    this._config = config;
    this._canvas = createCanvas(config.width, config.height);
    this._context = this._canvas.getContext("2d");
    this._context.imageSmoothingEnabled = true; // Enable anti-aliasing for higher quality
    this._context.imageSmoothingQuality = 'high'; // Set high quality smoothing
  }

  get config() {
    return this._config;
  }

  get width() {
    return this._config.width;
  }

  get height() {
    return this._config.height;
  }

  get left() {
    return 0;
  }

  get top() {
    return 0;
  }

  get right() {
    return this.width;
  }

  get bottom() {
    return this.height;
  }

  get centerX() {
    return this.width / 2;
  }

  get centerY() {
    return this.height / 2;
  }

  async drawBackground() {
    if (this._config.background !== null) {
      this.drawBox({
        left: this.left,
        top: this.top,
        width: this.width,
        height: this.height,
        fill: this._config.background,
      });
    } else {
      const bg = await CanvCass.loadImage(path.join(process.cwd(), "public", "canvcassbg.png"));
      if (bg) {
        this._context.drawImage(bg, this.left, this.top, this.width, this.height);
      }
    }
  }

  toPng() {
    return this._canvas.toBuffer("image/png");
  }

  drawBox(...args) {
    let rect;
    let style = {};

    if (typeof args[0] === "number" && typeof args[1] === "number" && typeof args[2] === "number" && typeof args[3] === "number") {
      rect = CanvCass.createRect({
        left: args[0],
        top: args[1],
        width: args[2],
        height: args[3],
      });
      style = args[4] ?? {};
    } else if (typeof args[0] !== "number" && "rect" in args[0]) {
      rect = args[0].rect;
      style = args[0];
      if ("rect" in style) {
        delete style.rect;
      }
    } else if (typeof args[0] !== "number") {
      const inline = args[0];
      rect = CanvCass.createRect({
        ...inline,
      });
      style = inline;
    } else {
      throw new TypeError("Invalid Arguments, please check the method overloads.");
    }

    const ctx = this._context;
    ctx.save();
    ctx.beginPath();
    let path = CanvCass.rectToPath(rect);

    if (style.stroke) {
      ctx.strokeStyle = style.stroke;
      ctx.lineWidth = Number(style.strokeWidth ?? "1");
      ctx.stroke(path);
    }

    if (style.fill) {
      ctx.fillStyle = style.fill;
      ctx.fill(path);
    }

    ctx.restore();
  }

  drawCircle(arg1, arg2, arg3) {
    let centerX;
    let centerY;
    let radius;
    let style = {};

    if (Array.isArray(arg1) && typeof arg2 === "number") {
      centerX = arg1[0];
      centerY = arg1[1];
      radius = arg2;
      style = arg3 ?? {};
    } else {
      const config = arg1;
      [centerX, centerY] = config.center;
      radius = config.radius;
      style = config;
    }

    const ctx = this._context;
    const { fill, stroke, strokeWidth } = style;

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Number(strokeWidth ?? "1");
      ctx.stroke();
    }

    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.restore();
  }

  drawText(arg1, arg2, arg3, arg4) {
    const ctx = this._context;

    let text;
    let x;
    let y;
    let options = {};

    if (typeof arg1 === "string" && typeof arg2 === "number" && typeof arg3 === "number") {
      text = arg1;
      x = arg2;
      y = arg3;
      options = arg4 ?? {};
    } else if (typeof arg1 === "string" && typeof arg2 === "object") {
      text = arg1;
      const opt = arg2;
      x = opt.x ?? 0;
      y = opt.y ?? 0;
      options = opt;
    } else {
      const config = arg1;
      text = config.text;
      x = config.x;
      y = config.y;
      options = config;
    }

    this._processFont(options);

    const {
      fill = "white",
      stroke,
      strokeWidth = 1,
      cssFont: font = "",
      align = "center",
      baseline = "middle",
      vAlign = "middle",
      size,
      yMargin = 0,
      breakTo = "bottom",
      breakMaxWidth = Infinity,
      letterSpacing,
    } = options;
    const origY = y;

    if (vAlign === "top") {
      y -= size / 2;
    }

    if (vAlign === "bottom") {
      y += size / 2;
    }

    ctx.save();
    if (typeof letterSpacing === "number") {
      ctx.letterSpacing = `${letterSpacing}px`;
    }

    const lineHeight = size + (yMargin ?? 0);
    const direction = breakTo === "top" ? -1 : 1;

    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    let { lines, maxWidth } = this.splitBreakDetailed(
      {
        ...options,
        text,
      },
      breakMaxWidth
    );
    lines = lines.filter(Boolean);

    let tx = x;
    let ty = y;

    if (breakTo === "top") {
      lines.reverse();
    }
    if (breakTo === "center") {
      ty -= ((lines.length - 1) / 2) * lineHeight;
    }

    const linePos = [];

    for (const line of lines) {
      if (stroke) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.strokeText(line, tx, ty);
      }
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillText(line, tx, ty);
      }
      linePos.push([tx, ty]);
      ty += lineHeight * direction;
    }

    let modY = y;

    if (vAlign === "top") {
      modY += size;
    }

    if (vAlign === "bottom") {
      modY -= size;
    }

    const rect = CanvCass.createRect({
      width: maxWidth,
      height: Math.abs(modY - linePos.at(-1)[1]),
      ...(breakTo === "bottom" ? { top: origY } : {}),
      ...(breakTo === "top" ? { bottom: origY } : {}),
      ...(breakTo === "center" ? { centerY: origY } : {}),
      ...(align === "left" ? { left: x } : {}),
      ...(align === "right" ? { right: x } : {}),
      ...(align === "center" ? { centerX: x } : {}),
      ...(align === "start" ? { left: x } : {}),
      ...(align === "end" ? { right: x } : {}),
    });

    ctx.restore();

    const result = {
      lines,
      rect,
      text,
      linePos,
      fill,
      lineHeight,
      direction,
      stroke,
      strokeWidth,
      cssFont: font,
      align,
      baseline,
      vAlign,
      size,
      yMargin,
      breakTo,
      breakMaxWidth,
      x,
      y: origY,
      newY: y,
      fontType: options.fontType,
    };
    return result;
  }

  createDim(rect, options = {}) {
    const { fadeStart = 0, fadeEnd = 1, color = "rgba(0, 0, 0, 0.7)" } = options;
    const ctx = this._context;

    const gradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);

    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(fadeStart, "transparent");
    gradient.addColorStop(fadeEnd, color);

    return gradient;
  }

  _processFont(options) {
    if (!options.cssFont) {
      options.fontType ??= "cnormal";
      options.size ??= 50;
      if (options.fontType === "cbold") {
        options.cssFont = `bold ${options.size}px sans-serif`;
      }
      if (options.fontType === "cnormal") {
        options.cssFont = `normal ${options.size}px sans-serif`;
      }
      if (options.fontType === "auto") {
        options.cssFont = `${options.size}px sans-serif`;
      }
    }
  }

  measureText(style) {
    const ctx = this._context;
    ctx.save();
    this._processFont(style);
    const { cssFont: font = "" } = style;
    ctx.font = font;
    const result = ctx.measureText(style.text);

    ctx.restore();

    return result;
  }

  splitBreakDetailed(style, maxW) {
    const lines = [];
    const widths = [];
    const paragraphs = style.text.split("\n");
    for (const paragraph of paragraphs) {
      let words = paragraph.split(" ");
      let currentLine = "";
      let accuW = 0;
      for (let word of words) {
        let wordWidth = this.measureText({ ...style, text: word }).width;
        while (wordWidth > maxW) {
          let splitIndex = word.length;
          while (splitIndex > 0) {
            const part = word.slice(0, splitIndex) + "-";
            const partWidth = this.measureText({ ...style, text: part }).width;
            if (partWidth <= maxW) break;
            splitIndex--;
          }
          const part = word.slice(0, splitIndex) + "-";
          lines.push(currentLine ? currentLine + " " + part : part);
          widths.push(this.measureText({ ...style, text: currentLine ? currentLine + " " + part : part }).width);
          currentLine = "";
          word = word.slice(splitIndex);
          wordWidth = this.measureText({ ...style, text: word }).width;
        }
        const addSpace = currentLine ? " " : "";
        const totalWidth = accuW + this.measureText({ ...style, text: addSpace + word }).width;
        if (totalWidth > maxW) {
          if (currentLine) {
            lines.push(currentLine);
            widths.push(accuW);
          }
          currentLine = word;
          accuW = this.measureText({ ...style, text: word }).width;
        } else {
          currentLine += addSpace + word;
          accuW = totalWidth;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
        widths.push(accuW);
      }
    }
    const maxWidth = Math.max(...widths);
    return {
      lines,
      maxWidth,
    };
  }

  async drawImage(imageOrSrc, left, top, options = {}) {
    const ctx = this._context;

    let image;

    if (typeof imageOrSrc !== "string" && "onload" in imageOrSrc) {
      image = imageOrSrc;
    } else {
      image = await CanvCass.loadImage(imageOrSrc);
    }

    ctx.save();

    if (options.clipTo) {
      ctx.clip(options.clipTo);
    }

    let width = options.width;
    let height = options.height;

    if (width && !height) {
      height = (width / image.width) * image.height;
    } else if (!width && height) {
      width = (height / image.height) * image.width;
    } else if (!width && !height) {
      width = image.width;
      height = image.height;
    }

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    const fit = options.fit || 'none'; // Add fit option: 'contain', 'cover', or 'none'

    if (fit === 'contain' || fit === 'cover') {
      const imgRatio = image.width / image.height;
      const targetRatio = width / height;

      let scale;
      if (fit === 'contain') {
        scale = Math.min(width / image.width, height / image.height);
      } else { // 'cover'
        scale = Math.max(width / image.width, height / image.height);
      }

      drawWidth = image.width * scale;
      drawHeight = image.height * scale;

      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    } else if (options.maximizeFit) { // Legacy, treat as contain
      const ratio = image.width / image.height;
      if (width > height * ratio) {
        drawWidth = height * ratio;
      } else if (height > width / ratio) {
        drawHeight = width / ratio;
      }
      // Add centering for legacy maximizeFit
      offsetX = (width - drawWidth) / 2;
      offsetY = (height - drawHeight) / 2;
    }

    if (!options.clipTo) {
      const r = CanvCass.createRect({
        width,
        height,
        left,
        top,
      });
      ctx.clip(CanvCass.rectToPath(r));
    }
    ctx.drawImage(
      image,
      options.sourceOffsetLeft ?? 0,
      options.sourceOffsetTop ?? 0,
      options.cropWidth ?? image.width,
      options.cropHeight ?? image.height,
      left + offsetX,
      top + offsetY,
      drawWidth,
      drawHeight
    );

    ctx.restore();
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const meta = {
  name: 'snews',
  desc: 'Generate a satire news image via CanvCass from CassidyBot by lianecagara',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    {
      name: 'headline',
      desc: 'The headline text for the satire news',
      example: 'He love Jea',
      required: true
    },
    {
      name: 'name',
      desc: 'The name to use in the headline (e.g., "Lance claims that ...")',
      example: 'Lance',
      required: true
    },
    {
      name: 'pfp',
      desc: 'URL to the profile picture',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/1756728735205.jpg',
      required: true
    },
    {
      name: 'bg',
      desc: 'Optional URL to the background image (defaults to pfp)',
      example: 'https://raw.githubusercontent.com/lanceajiro/Storage/refs/heads/main/backiee-265579-landscape.jpg',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  let headline, name, pfp, bg;
  if (req.method === 'POST') {
    ({ headline, name, pfp, bg } = req.body);
  } else {
    ({ headline, name, pfp, bg } = req.query);
  }

  if (!headline || !name || !pfp) {
    return res.status(400).json({ error: 'Missing required parameters: headline, name, pfp' });
  }

  if (!isValidURL(pfp)) {
    return res.status(400).json({ error: 'Invalid pfp URL' });
  }

  bg ||= pfp;

  if (!isValidURL(bg)) {
    return res.status(400).json({ error: 'Invalid bg URL' });
  }

  const isBgDifferent = bg !== pfp;

  if (!setupDone) {
    await CanvCass.singleSetup();
    setupDone = true;
  }

  headline = `${name} claims that ${headline}`;

  let times = 0;

  while (true) {
    times++;
    try {
      const canv = new CanvCass(1080, 1080); // Increased resolution for higher quality
      await canv.drawBackground();
      const margin = 80; // Scaled up margin for higher res

      await delay(500);
      const bgImage = await CanvCass.loadImage(bg);
      await canv.drawImage(bgImage, canv.left, canv.top, {
        width: canv.width,
        height: canv.height,
        fit: 'cover', // Use cover fit for background to fill without distortion
      });

      const bottomHalf = CanvCass.createRect({
        bottom: canv.bottom,
        left: 0,
        width: canv.width,
        height: canv.height / 1.1,
      });
      const gradient = canv.createDim(bottomHalf, { color: "rgba(0,0,0,1)" });
      canv.drawBox({ rect: bottomHalf, fill: gradient });

      const headlineRect = CanvCass.createRect({
        top: canv.bottom - 300, // Scaled up
        left: margin,
        width: canv.width - margin * 2,
        height: 150, // Scaled up
      });
      const headlineResult = canv.drawText(headline, {
        align: "left",
        vAlign: "top",
        baseline: "middle",
        fontType: "cbold",
        size: 57, // Scaled up font size for higher res
        fill: "white",
        x: headlineRect.left,
        breakTo: "top",
        y: headlineRect.bottom,
        breakMaxWidth: headlineRect.width,
        yMargin: 6, // Scaled up
      });

      if (isBgDifferent || 1) {
        const cw = (canv.width - margin * 2) / 3;

        const circleBox = CanvCass.createRect({
          left: canv.left + margin,
          bottom: headlineResult.rect.top - headlineResult.lineHeight / 2,
          width: cw,
          height: cw,
        });

        const ccc = [circleBox.centerX, circleBox.centerY];
        const r = cw / 2;

        const circlePath = CanvCass.createCirclePath(ccc, r);
        await delay(500);

        const pfpImage = await CanvCass.loadImage(pfp);
        await canv.drawImage(pfpImage, circleBox.left, circleBox.top, {
          width: cw,
          height: cw,
          clipTo: circlePath,
          fit: 'cover', // Use cover fit to fill circle without distortion
        });

        canv.drawCircle(ccc, r, { stroke: CanvCass.colorA, strokeWidth: 8 }); // Thicker stroke for premium look
      }

      const lineH = 6; // Scaled up
      const lineTop = headlineRect.bottom + 30; // Scaled up
      const lineLeft = margin;
      const lineW = canv.width - margin * 2;

      const lineRectA = CanvCass.createRect({
        top: lineTop,
        left: lineLeft,
        width: lineW / 2,
        height: lineH,
      });
      const lineRectB = CanvCass.createRect({
        top: lineTop,
        left: lineLeft + lineW / 2,
        width: lineW / 2,
        height: lineH,
      });
      canv.drawBox({ rect: lineRectA, fill: CanvCass.colorA });
      canv.drawBox({ rect: lineRectB, fill: CanvCass.colorB });

      const logoRect = CanvCass.createRect({
        width: canv.width - margin * 2,
        height: 30, // Scaled up
        left: canv.left + margin,
        top: lineRectA.bottom + 15, // Scaled up
      });

      const titleText = "News";
      const titleFontType = "cbold";
      const titleSize = logoRect.height;

      canv.drawText(titleText, {
        align: "left",
        vAlign: "top",
        fontType: titleFontType,
        size: titleSize,
        x: logoRect.left,
        y: logoRect.bottom,
        fill: "cyan",
      });

      const subtitleText = "News and Nonsense";
      const subtitleFontType = "cnormal";
      const subtitleSize = 15; // Scaled up

      canv.drawText(subtitleText, {
        align: "left",
        vAlign: "bottom",
        fontType: subtitleFontType,
        size: subtitleSize,
        x: logoRect.left,
        y: logoRect.bottom + 3, // Scaled up
        fill: "white",
      });

      canv.drawText("Note: This is purely a work of satire", {
        align: "right",
        vAlign: "top",
        baseline: "middle",
        fontType: "cnormal",
        size: 22, // Scaled up
        fill: "rgba(255,255,255,0.6)",
        x: logoRect.right,
        y: logoRect.bottom,
      });

      const buffer = canv.toPng();
      res.type('image/png').send(buffer);
      break;
    } catch (error) {
      if (times >= 4) {
        return res.status(500).json({ error: error.message || 'Internal server error' });
      }
      await delay(1000);
      continue;
    }
  }
}

module.exports = { meta, onStart };