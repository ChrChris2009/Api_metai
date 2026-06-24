// fotor.js
const axios = require("axios");

const meta = {
    name: "fotor",
    desc: "Generate AI image using Fotor API",
    method: "get",
    category: "Image",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const prompt = req.query.prompt || "A cat";

        const apiUrl = `https://rapido.zetsu.xyz/api/fotor?prompt=${encodeURIComponent(
            prompt
        )}&apikey=rapi_55197dde42fb4272bfb8f35bd453ba25`;

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
