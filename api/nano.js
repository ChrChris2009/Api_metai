// nano.js
const axios = require("axios");

const meta = {
    name: "nano",
    desc: "Generate AI image using Nano API",
    method: "get",
    category: "Image",
    operator: "Christus"
};

async function onStart({ req, res }) {
    try {
        const prompt = req.query.prompt || "A cat";

        const apiUrl = `https://zetbot-page.onrender.com/api/nano?prompt=${encodeURIComponent(
            prompt
        )}&seed=1234567&ref=Ha&ref1=123`;

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
