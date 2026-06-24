// Modified unblur.js
const axios = require("axios");
const FormData = require("form-data");
const crypto = require("crypto");

const meta = {
  name: "unblur",
  desc: "Remove blur / upscale an image from a remote URL using unblurimage.ai",
  method: [ 'get', 'post' ],
  category: "tools",
  params: [
    {
      name: 'url',
      desc: 'Direct URL to the image to unblur',
      example: 'https://example.com/blurry-image.jpg',
      required: true
    }
  ]
};

async function unblurFromUrl(imageUrl) {
  const img = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const buffer = Buffer.from(img.data);
  const serial = crypto.randomBytes(16).toString("hex");
  const fname = `Image_${crypto.randomBytes(6).toString("hex")}.jpg`;

  const form = new FormData();
  form.append("original_image_file", buffer, {
    filename: fname,
    contentType: "image/jpeg",
  });
  form.append("scale_factor", 2);
  form.append("upscale_type", "image-upscale");

  const headers = { ...form.getHeaders(), "product-serial": serial };

  try {
    const res = await axios.post(
      "https://api.unblurimage.ai/api/imgupscaler/v2/ai-image-unblur/create-job",
      form,
      { headers, timeout: 120000 }
    );
    const jobId = res.data?.result?.job_id;
    if (!jobId) throw new Error("Job ID not found");

    let output;
    let done = false;
    const timeout = Date.now() + 180000; // 3 minutes
    while (!done && Date.now() < timeout) {
      const poll = await axios.get(
        `https://api.unblurimage.ai/api/imgupscaler/v2/ai-image-unblur/get-job/${jobId}`,
        { headers, timeout: 120000 }
      );
      if (poll.data?.code === 100000 && poll.data?.result?.output_url?.[0]) {
        output = poll.data.result.output_url[0];
        done = true;
      } else {
        // wait 3s before next poll
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    return { jobId, filename: fname, output };
  } catch (e) {
    return { error: e.response?.data || e.message || String(e) };
  }
}

async function onStart({ req, res }) {
  let url;
  if (req.method === 'POST') {
    ({ url } = req.body);
  } else {
    ({ url } = req.query);
  }

  if (!url) {
    return res.status(400).json({
      error: "Missing required parameter: url"
    });
  }

  try {
    const result = await unblurFromUrl(url);

    if (result?.error) {
      return res.status(500).json({
        error: result.error
      });
    }

    return res.json({
      answer: result.output
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Internal server error"
    });
  }
}

module.exports = { meta, onStart };