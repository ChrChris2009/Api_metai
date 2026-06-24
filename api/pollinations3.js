// pollinations3.js
const axios = require("axios");

const meta = {
    name: "pollinations3",
    desc: "Generate AI image using Pollinations API with model option",
    method: "get",
    category: "Image",
    operator: "Christus",
};

async function onStart({ req, res }) {
    try {
        const prompt = req.query.prompt || "cat";
        const model = req.query.model || "1";

        const apiUrl = `https://uniapis.onrender.com/api/pollinations?prompt=${encodeURIComponent(
            prompt
        )}&model=${encodeURIComponent(model)}`;

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
