const fetch = require('node-fetch');
const FormData = require('form-data');

function isValidURL(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

const meta = {
  name: 'catbox',
  desc: 'Upload an image to Catbox.moe and retrieve the link',
  method: ['get', 'post'],
  category: 'tools',
  params: [
    {
      name: 'image',
      desc: 'The image data (base64 string or URL)',
      example: 'https://example.com/image.jpg',
      required: true
    },
    {
      name: 'type',
      desc: 'Type of the image input',
      options: ['base64', 'url'],
      example: 'url',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  let image, type;
  if (req.method === 'POST') {
    ({ image, type } = req.body);
  } else {
    ({ image, type } = req.query);
  }

  if (!image || !type) {
    return res.status(400).json({ error: 'Missing required parameters: image, type' });
  }

  if (!['base64', 'url'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type: must be "base64" or "url"' });
  }

  if (type === 'url' && !isValidURL(image)) {
    return res.status(400).json({ error: 'Invalid image URL' });
  }

  try {
    const form = new FormData();
    form.append('reqtype', type === 'url' ? 'urlupload' : 'fileupload');
    form.append('userhash', ''); // Empty for anonymous

    if (type === 'url') {
      form.append('url', image);
    } else {
      // base64 to buffer
      const buffer = Buffer.from(image, 'base64');
      form.append('fileToUpload', buffer, { filename: 'image.png' });
    }

    const apiResponse = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form
    });

    const result = await apiResponse.text();

    if (apiResponse.ok && result.startsWith('https://')) {
      return res.json({ link: result });
    } else {
      return res.status(500).json({ error: result || 'Upload failed' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };