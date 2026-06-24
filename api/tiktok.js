// tiktok.js
const axios = require("axios");

const meta = {
    name: "tiktok",
    desc: "Random NSFW TikTok image",
    method: "get",
    category: "nsfw",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const apiUrl = "https://delirius-apiofc.vercel.app/nsfw/tiktok";

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
