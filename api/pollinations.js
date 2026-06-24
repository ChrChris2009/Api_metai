// pollinations.js
const axios = require("axios");

const meta = {
    name: "pollinations",
    desc: "Generate AI image using Pollinations API",
    method: "get",
    category: "Image",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const prompt = req.query.prompt || "Dog";

        const apiUrl = `https://zetbot-page.onrender.com/api/pollinations.ai?prompt=${encodeURIComponent(
            prompt
        )}`;

        const response = await axios.get(apiUrl, {
            responseType: "arraybuffer",
        });

        const imgBuffer = Buffer.from(response.data);

        res.writeHead(200, {
            "Content-Type": "image/png",
            "Content-Length": imgBuffer.length,
        });
        res.end(imgBuffer);

    } catch (error) {
        res.status(500).json({
            status: false,
            operator: "Christus",
            error: error.message,
        });
    }
}

module.exports = { meta, onStart };
