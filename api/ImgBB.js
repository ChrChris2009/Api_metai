// ImgBBUpload.js
const axios = require('axios');

const meta = {
  name: 'ImgBB',
  desc: 'Upload an image to ImgBB using Wildan API',
  method: ['get', 'post'],
  category: 'tools',
  params: [
    {
      name: 'imageUrl',
      desc: 'Direct image URL to upload',
      example: 'https://i.ibb.co/example.jpg',
      required: true
    }
  ]
};

async function onStart({ req, res }) {
  try {
    const imageUrl = req.method === 'POST'
      ? req.body.imageUrl
      : req.query.imageUrl;

    if (!imageUrl) {
      return res.status(400).json({
        status: false,
        error: 'Missing required parameter: imageUrl'
      });
    }

    const { data } = await axios.get(
      'https://wildan-suldyir-apis.vercel.app/api/imgbb',
      { params: { imageUrl } }
    );

    if (!data || data.success !== true) {
      return res.status(500).json({
        status: false,
        error: 'Failed to upload image'
      });
    }

    res.json({
      status: true,
      creator: data.creator,
      image: {
        url: data.image_url,
        display: data.display_url,
        viewer: data.viewer,
        delete: data.delete_url
      },
      info: data.info,
      size: data.size,
      uploaded_at: data.uploaded
    });

  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message || 'Internal server error'
    });
  }
}

module.exports = { meta, onStart };
