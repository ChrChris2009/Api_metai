// welcard.js
const { WelCard } = require("@delirius/welcard");
const fs = require("fs");

const meta = {
  name: 'Welcard',
  desc: 'Generate a customizable welcome card image and return the PNG image binary',
  method: ['get', 'post'],
  category: 'canvas',
  params: [
    { name: 'name', desc: 'Name to display on the card', example: 'Welcome', required: true },
    { name: 'author', desc: 'Author or participant name to display', example: 'Participants', required: true },
    { name: 'server', desc: 'Server or group name to display', example: 'Group Name 🪐', required: true },
    { name: 'thumbnail', desc: 'Thumbnail image URL', example: 'https://i.postimg.cc/3rLKbgLH/image.jpg', required: true },
    { name: 'color', desc: 'Card color (use "auto" for automatic detection)', example: 'auto', required: false },
    { name: 'brightness', desc: 'Brightness level (0 - 100)', example: 50, required: false },
    { name: 'download', desc: 'Set to true to force file download', example: 'true', required: false },
    { name: 'filename', desc: 'Filename for download (when download=true)', example: 'welcome.png', required: false }
  ]
};

async function onStart({ req, res }) {
  try {
    // Accept params from either POST body or GET query
    let { name, author, server, color, brightness, thumbnail, download, filename } =
      req.method === 'POST' ? req.body : req.query;

    // Validate required fields
    if (!name || !author || !server || !thumbnail) {
      return res.status(400).json({
        error: 'Missing required parameters. Please provide name, author, server, and thumbnail.'
      });
    }

    // Defaults
    color = color || 'auto';
    brightness = brightness !== undefined ? Number(brightness) : 50;
    download = download === true || download === 'true' || download === '1';
    filename = filename || 'card.png';

    // Build the welcome card
    const card = new WelCard()
      .setName(name)
      .setAuthor(author)
      .setServer(server)
      .setColor(color)
      .setBrightness(Number(brightness))
      .setThumbnail(thumbnail);

    const cardBuffer = await card.build();

    // Set headers for binary PNG response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', cardBuffer.length);

    if (download) {
      // Force download with provided filename
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      // Inline display
      res.setHeader('Content-Disposition', 'inline');
    }

    // Send the raw PNG buffer
    return res.status(200).send(cardBuffer);
  } catch (error) {
    console.error('welcard error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
