// aiart.js
const ws = require('ws');

const meta = {
  name: 'AI Art',
  desc: 'Generate AI art via yimeta.ai websocket (Anime | Realistic)',
  method: ['get', 'post'],
  category: 'AI',
  params: [
    {
      name: 'prompt',
      desc: 'Prompt describing the image to generate',
      example: 'A cute pixel art cat',
      required: true
    },
    {
      name: 'style',
      desc: "Style: 'Anime' or 'Realistic' (default: 'Anime')",
      example: 'Realistic',
      required: false,
      options: ['Anime', 'Realistic']
    },
    {
      name: 'negativePrompt',
      desc: 'Negative prompt (filters unwanted elements)',
      example: '(worst quality, low quality:1.4)',
      required: false
    },
    {
      name: 'scale',
      desc: 'Guidance/scale value (default: 7)',
      example: '7',
      required: false
    }
  ]
};

async function onStart({ req, res }) {
  let prompt, style, negativePrompt, scale;
  if (req.method === 'POST') {
    ({ prompt, style, negativePrompt, scale } = req.body || {});
  } else {
    ({ prompt, style, negativePrompt, scale } = req.query || {});
  }

  try {
    if (!prompt) {
      return res.status(400).json({ error: 'Missing required parameter: prompt' });
    }

    const _styles = ['Anime', 'Realistic'];
    style = style || 'Anime';
    if (!_styles.includes(style)) {
      return res.status(400).json({ error: `Available styles: ${_styles.join(', ')}` });
    }

    negativePrompt =
      negativePrompt ||
      '(worst quality, low quality:1.4), (greyscale, monochrome:1.1), cropped, lowres , username, blurry, trademark, watermark, title, multiple view, Reference sheet, curvy, plump, fat, strabismus, clothing cutout, side slit,worst hand, (ugly face:1.2), extra leg, extra arm, bad foot, text, name';

    scale = Number(scale ?? 7);

    const resultName = await new Promise((resolve, reject) => {
      try {
        const session_hash = Math.random().toString(36).substring(2);
        const socket = new ws('wss://app.yimeta.ai/ai-art-generator/queue/join');

        let finished = false;
        // safety timeout (120s)
        const timeout = setTimeout(() => {
          if (!finished) {
            finished = true;
            try { socket.terminate(); } catch (e) {}
            reject(new Error('Timeout waiting for generation (120s)'));
          }
        }, 120000);

        socket.on('open', () => {
          // wait for server messages (server will ask for hash / data)
        });

        socket.on('message', (raw) => {
          try {
            const d = JSON.parse(raw.toString('utf8'));
            switch (d.msg) {
              case 'send_hash':
                socket.send(
                  JSON.stringify({
                    fn_index: 31,
                    session_hash
                  })
                );
                break;

              case 'send_data':
                socket.send(
                  JSON.stringify({
                    fn_index: 31,
                    session_hash,
                    data: [style, prompt, negativePrompt, scale, '']
                  })
                );
                break;

              case 'estimation':
              case 'process_starts':
                // ignore / could emit progress later
                break;

              case 'process_completed':
                if (!finished) {
                  finished = true;
                  clearTimeout(timeout);
                  try { socket.close(); } catch (e) {}
                  // according to original code, image name is at d.output.data[0][0].name
                  const name =
                    d && d.output && d.output.data && d.output.data[0] && d.output.data[0][0]
                      ? d.output.data[0][0].name
                      : null;
                  if (name) {
                    resolve(name);
                  } else {
                    reject(new Error('Generation completed but no image returned'));
                  }
                }
                break;

              default:
                // unexpected message types are ignored
                break;
            }
          } catch (err) {
            // non-JSON or parse error
            // ignore or forward if critical
            // console.log('ws parse error', err);
          }
        });

        socket.on('error', (err) => {
          if (!finished) {
            finished = true;
            clearTimeout(timeout);
            reject(err);
          }
        });

        socket.on('close', () => {
          // if socket closes before completion
          if (!finished) {
            finished = true;
            clearTimeout(timeout);
            reject(new Error('WebSocket closed before generation completed'));
          }
        });
      } catch (err) {
        reject(err);
      }
    });

    // return a simple JSON with the filename (same as your original function resolved)
    return res.json({ image: resultName });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

module.exports = { meta, onStart };