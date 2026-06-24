// pornhub.js
const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');
const FormData = require('form-data');

const meta = {
  name: 'pornhub',
  desc: 'Create "Pornhub style" logo image using ephoto360 (returns PNG image)',
  method: ['get', 'post'],
  category: 'Image',
  params: [
    {
      name: 'text1',
      desc: 'First text (left)',
      example: 'Lance',
      required: true
    },
    {
      name: 'text2',
      desc: 'Second text (right, highlighted)',
      example: 'Ajiro',
      required: true
    }
  ]
};

/**
 * Scrapes ephoto360 page, submits form and builds the final image URL.
 * Returns a fully-qualified image URL.
 */
async function createPornhubLogo(text1, text2) {
  const baseUrl = 'https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html';

  // Get initial page to collect tokens and cookies
  const initialResp = await axios.get(baseUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 15000
  });

  const cookies = Array.isArray(initialResp.headers['set-cookie'])
    ? initialResp.headers['set-cookie'].join('; ')
    : initialResp.headers['set-cookie'] || '';

  const $ = cheerio.load(initialResp.data);
  const token = $('input[name=token]').val() || '';
  const buildServer = $('input[name=build_server]').val() || '';
  const buildServerId = $('input[name=build_server_id]').val() || '';

  // Fill the form used by the site
  const form = new FormData();
  form.append('text[]', text1);
  form.append('text[]', text2);
  form.append('token', token);
  form.append('build_server', buildServer);
  form.append('build_server_id', buildServerId);

  // Post the form to the same page to get form_value_input
  const postResp = await axios.post(baseUrl, form, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Cookie: cookies,
      ...form.getHeaders()
    },
    timeout: 20000
  });

  const $$ = cheerio.load(postResp.data);
  const rawFormValue = $$('input[name=form_value_input]').val();
  if (!rawFormValue) throw new Error('Failed to retrieve form value from ephoto360');

  let formValueInput;
  try {
    formValueInput = JSON.parse(rawFormValue);
  } catch (err) {
    throw new Error('Failed to parse form value input from ephoto360 response');
  }

  // Create request body in x-www-form-urlencoded format as the site expects
  const body = qs.stringify(formValueInput, { arrayFormat: 'brackets' });

  // Request image creation endpoint (AJAX)
  const createResp = await axios.post('https://en.ephoto360.com/effect/create-image', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Cookie: cookies,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: baseUrl,
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 20000
  });

  if (!createResp.data || !createResp.data.image) {
    throw new Error('Image creation failed: unexpected response from ephoto360');
  }

  // buildServer may be a base URL; ensure we construct a valid absolute URL
  const imagePath = createResp.data.image;
  if (imagePath.startsWith('http')) return imagePath;
  if (!buildServer) {
    // Fallback: if buildServer missing, try to resolve relative to main host
    return `https://en.ephoto360.com${imagePath}`;
  }
  return buildServer + imagePath;
}

/**
 * API handler compatible with your module style.
 * Sends back image bytes with appropriate headers.
 */
async function onStart({ req, res }) {
  const params = req.method === 'POST' ? req.body || {} : req.query || {};
  const { text1, text2 } = params;

  if (!text1 || !text2) {
    return res.status(400).json({
      error: 'Missing required parameter(s): text1 and text2 are required'
    });
  }

  try {
    const imageUrl = await createPornhubLogo(String(text1), String(text2));

    // Fetch the generated image as binary
    const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 20000 });

    // Determine content-type: default to image/png if unknown
    const contentType = imageResp.headers['content-type'] || 'image/png';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline; filename="pornhub.png"');
    return res.status(200).send(Buffer.from(imageResp.data));
  } catch (err) {
    return res.status(500).json({
      error: err && err.message ? err.message : 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
