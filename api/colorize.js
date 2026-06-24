// Modified colorize.js
const axios = require('axios');

const meta = {
    name: "Image Colorizer",
    desc: "Colorize a black and white image using pxpic.com API",
    method: [ 'get', 'post' ],
    category: "tools",
    params: [
      {
        name: 'imageUrl',
        desc: 'URL of the image to colorize',
        example: 'https://example.com/bw-image.jpg',
        required: true
      }
    ]
};

async function onStart({ res, req }) {
    let imageUrl;
    if (req.method === 'POST') {
      ({ imageUrl } = req.body);
    } else {
      ({ imageUrl } = req.query);
    }
    if (!imageUrl) return res.status(400).json({ error: "Missing required parameter: imageUrl" });

    try {
        const response = await axios.post('https://pxpic.com/callAiFunction', {
            imageUrl: imageUrl,
            targetFormat: "png",
            fileOriginalExtension: "jpg",
            needCompress: "no",
            imageQuality: "100",
            compressLevel: "6",
            aiFunction: "colorize",
            upscalingLevel: ""
        }, {
            headers: {
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-US,en;q=0.9',
                'Content-Type': 'application/json',
                'Origin': 'https://pxpic.com',
                'Referer': 'https://pxpic.com/task',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36',
                'Sec-Ch-Ua': '"Not A(Brand";v="8", "Chromium";v="132"',
                'Sec-Ch-Ua-Mobile': '?1',
                'Sec-Ch-Ua-Platform': '"Android"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin'
            }
        });

        return res.json({
            answer: response.data.resultImageUrl
        });
    } catch (error) {
        return res.status(500).json({ 
            error: error.message || 'Internal server error'
        });
    }
}

module.exports = { meta, onStart };