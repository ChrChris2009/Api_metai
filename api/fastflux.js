// fastflux.js
const axios = require("axios");

const meta = {
    name: "fastflux",
    desc: "Generate AI image using FastFlux API",
    method: "get",
    category: "Image",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const text = req.query.text || "A cat";

        const apiUrl = `http://65.109.80.126:20511/api/fastfluximg?text=${encodeURIComponent(
            text
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
