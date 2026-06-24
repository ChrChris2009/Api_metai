const axios = require('axios');

const meta = {
  name: 'deepimg',
  desc: 'Generate images from text prompt using deepimg.ai API',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Text prompt for image generation',
      example: 'girl wearing glasses',
      required: true
    },
    {
      name: 'style',
      desc: "Image style: 'default' | 'ghibli' | 'cyberpunk' | 'anime' | 'portrait' | 'chibi' | 'pixel art' | 'oil painting' | '3d' (default: 'default')",
      example: 'anime',
      required: false,
      options: ['default', 'ghibli', 'cyberpunk', 'anime', 'portrait', 'chibi', 'pixel art', 'oil painting', '3d']
    },
    {
      name: 'size',
      desc: "Image size ratio: '1:1' | '3:2' | '2:3' (default: '1:1')",
      example: '3:2',
      required: false,
      options: ['1:1', '3:2', '2:3']
    }
  ]
};

async function onStart({ req, res }) {
  let prompt, style, size;
  if (req.method === 'POST') {
    ({ prompt, style, size } = req.body || {});
  } else {
    ({ prompt, style, size } = req.query || {});
  }

  style = style || 'default';
  size = size || '1:1';

  if (!prompt) {
    return res.status(400).json({ error: 'Missing required parameter: prompt' });
  }

  const styleList = {
    'default': '-style Realism',
    'ghibli': '-style Ghibli Art',
    'cyberpunk': '-style Cyberpunk',
    'anime': '-style Anime',
    'portrait': '-style Portrait',
    'chibi': '-style Chibi',
    'pixel art': '-style Pixel Art',
    'oil painting': '-style Oil Painting',
    '3d': '-style 3D'
  };

  if (!styleList[style]) {
    return res.status(400).json({ error: `Available styles: ${Object.keys(styleList).join(', ')}` });
  }

  const sizeList = {
    '1:1': '1024x1024',
    '3:2': '1080x720',
    '2:3': '720x1080'
  };

  if (!sizeList[size]) {
    return res.status(400).json({ error: `Available sizes: ${Object.keys(sizeList).join(', ')}` });
  }

  const commonHeaders = {
    'content-type': 'application/json',
    origin: 'https://deepimg.ai',
    referer: 'https://deepimg.ai/',
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
  };

  try {
    const device_id = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const { data } = await axios.post('https://api-preview.apirouter.ai/api/v1/deepimg/flux-1-dev', {
      device_id: device_id,
      prompt: prompt + ' ' + styleList[style],
      size: sizeList[size],
      n: '1',
      output_format: 'png'
    }, { headers: commonHeaders });

    return res.json({ image: data.data.images[0].url });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };