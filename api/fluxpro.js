// fluxpro.js
const axios = require("axios");

const meta = {
    name: "fluxpro",
    desc: "Generate AI image using FluxPro API",
    method: "get",
    category: "Image",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const prompt = req.query.prompt || "cat in space";

        const apiUrl = `https://uniapis.onrender.com/api/fluxpro?prompt=${encodeURIComponent(
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
