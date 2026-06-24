const axios = require('axios');

const meta = {
  name: 'pixelart',
  desc: 'Generate pixel-art from an uploaded image or from text prompt (pixelartgenerator.app)',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'mode',
      desc: "Operation mode: 'img' to convert an uploaded image, 'text' to generate from prompt",
      example: 'img',
      required: true,
      options: ['img', 'text']
    },
    {
      name: 'image',
      desc: 'Base64-encoded image data (required when mode=img). Data URI prefix (e.g. data:image/jpeg;base64,...) is accepted.',
      example: '<base64 string>',
      required: false
    },
    {
      name: 'prompt',
      desc: 'Text prompt used when mode=text',
      example: 'A cute pixel art cat',
      required: false
    },
    {
      name: 'ratio',
      desc: "Image ratio: '1:1' | '3:2' | '2:3' (default: '1:1')",
      example: '1:1',
      required: false,
      options: ['1:1', '3:2', '2:3']
    }
  ]
};

async function onStart({ req, res }) {
  let mode, image, prompt, ratio;
  if (req.method === 'POST') {
    ({ mode, image, prompt, ratio } = req.body || {});
  } else {
    ({ mode, image, prompt, ratio } = req.query || {});
  }

  mode = (mode || '').toString().toLowerCase();
  ratio = ratio || '1:1';

  if (!['img', 'text'].includes(mode)) {
    return res.status(400).json({ error: "Invalid mode. Use 'img' or 'text'." });
  }

  if (!['1:1', '3:2', '2:3'].includes(ratio)) {
    return res.status(400).json({ error: "Available ratios: 1:1, 3:2, 2:3" });
  }

  const commonHeaders = {
    'content-type': 'application/json',
    referer: 'https://pixelartgenerator.app/',
    'user-agent':
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
  };

  try {
    if (mode === 'img') {
      if (!image) {
        return res.status(400).json({ error: 'Missing required parameter: image (base64)' });
      }

      // strip data URI prefix if present
      const matched = String(image).match(/base64,(.*)$/);
      const b64 = matched ? matched[1] : image;
      const buffer = Buffer.from(b64, 'base64');
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        return res.status(400).json({ error: 'Invalid base64 image data' });
      }

      // request presigned upload url
      const { data: a } = await axios.post(
        'https://pixelartgenerator.app/api/upload/presigned-url',
        {
          filename: `${Date.now()}_rynn.jpg`,
          contentType: 'image/jpeg',
          type: 'pixel-art-source'
        },
        { headers: commonHeaders }
      );

      // upload image to presigned url
      await axios.put(a.data.uploadUrl, buffer, {
        headers: {
          'content-type': 'image/jpeg',
          'content-length': buffer.length
        }
      });

      // trigger generation
      const { data: b } = await axios.post(
        'https://pixelartgenerator.app/api/pixel/generate',
        {
          imageKey: a.data.key,
          prompt: '',
          size: ratio,
          type: 'image'
        },
        { headers: commonHeaders }
      );

      // poll status
      while (true) {
        const { data } = await axios.get(
          `https://pixelartgenerator.app/api/pixel/status?taskId=${b.data.taskId}`,
          { headers: commonHeaders }
        );

        if (data && data.data && data.data.status === 'SUCCESS') {
          return res.json({ image: data.data.images[0] });
        }

        // wait 1s before next poll
        await new Promise((r) => setTimeout(r, 1000));
      }
    } else {
      // text generation
      if (!prompt) {
        return res.status(400).json({ error: 'Missing required parameter: prompt' });
      }

      const { data: a } = await axios.post(
        'https://pixelartgenerator.app/api/pixel/generate',
        {
          prompt: prompt,
          size: ratio,
          type: 'text'
        },
        { headers: commonHeaders }
      );

      while (true) {
        const { data } = await axios.get(
          `https://pixelartgenerator.app/api/pixel/status?taskId=${a.data.taskId}`,
          { headers: commonHeaders }
        );

        if (data && data.data && data.data.status === 'SUCCESS') {
          return res.json({ image: data.data.images[0] });
        }

        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };