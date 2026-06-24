// Modified oos.js
const axios = require("axios");

const meta = {
  name: "Oss",
  desc: "Generate a response using GPT OSS 120B via Gradient.chat streaming endpoint",
  method: [ 'get', 'post' ],
  category: 'AI',
  params: [
    {
      name: 'text',
      desc: 'The prompt or message to send to the model',
      example: 'Hello, how are you?',
      required: true
    }
  ]
};

async function gradientChat({ model, clusterMode, messages, enableThinking }) {
  // === Validate ===
  if (!["Qwen3 235B", "GPT OSS 120B"].includes(model)) {
    throw new Error("Model harus 'Qwen3 235B' atau 'GPT OSS 120B'");
  }
  if (!["nvidia", "hybrid"].includes(clusterMode)) {
    throw new Error("clusterMode harus 'nvidia' atau 'hybrid'");
  }

  // === Build params ===
  const params = { model, clusterMode, messages };
  if (model === "GPT OSS 120B") params.enableThinking = !!enableThinking;

  // === Request ===
  const response = await axios.post(
    "https://chat.gradient.network/api/generate",
    params,
    {
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        origin: "https://chat.gradient.network",
        referer: "https://chat.gradient.network/",
      },
      responseType: "text",
      timeout: 120000,
    }
  );

  // === Parse streaming-ish response (line delimited JSON) ===
  const raw = response.data;
  const lines = raw.trim().split(/\r?\n/);
  const result = {
    jobInfo: null,
    clusterInfo: null,
    replies: [],
    content: "",
    blockUpdates: [],
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      // skip non-json lines
      continue;
    }
    switch (obj.type) {
      case "jobInfo":
        result.jobInfo = obj.data;
        break;
      case "clusterInfo":
        result.clusterInfo = obj.data;
        break;
      case "reply":
        result.replies.push(obj.data);
        result.content += obj.data?.content || "";
        break;
      case "blockUpdate":
        result.blockUpdates.push(...(obj.data || []));
        break;
      default:
        // ignore unknown types
        break;
    }
  }

  return result;
}

async function onStart({ req, res }) {
  let text;
  if (req.method === 'POST') {
    ({ text } = req.body);
  } else {
    ({ text } = req.query);
  }

  if (!text) {
    return res.status(400).json({
      error: "Missing required parameter: text"
    });
  }

  try {
    const result = await gradientChat({
      model: "GPT OSS 120B", // fixed as in original
      clusterMode: "nvidia",
      messages: [{ role: "user", content: text }],
      enableThinking: true,
    });

    return res.json({
      answer: result.content
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || "Internal server error"
    });
  }
}

module.exports = { meta, onStart };