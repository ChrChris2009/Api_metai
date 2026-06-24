// anime.js
const axios = require("axios");

const meta = {
  name: "anime",
  desc: "Search anime using Jikan (MyAnimeList) API",
  method: ["get", "post"],
  category: "anime",
  params: [
    {
      name: "q",
      desc: "Anime name to search",
      example: "Naruto",
      required: true
    },
    {
      name: "limit",
      desc: "Number of results (max 25)",
      example: "5",
      required: false
    },
    {
      name: "sfw",
      desc: "Safe for work only (true/false)",
      example: "true",
      required: false
    }
  ]
};

function formatAnime(a) {
  return {
    mal_id: a.mal_id,
    title: a.title,
    title_japanese: a.title_japanese,
    type: a.type,
    episodes: a.episodes,
    status: a.status,
    year: a.year,
    rating: a.rating,
    score: a.score,
    popularity: a.popularity,
    synopsis: a.synopsis,
    genres: a.genres?.map(g => g.name) || [],
    themes: a.themes?.map(t => t.name) || [],
    image: a.images?.jpg?.large_image_url,
    url: a.url
  };
}

async function onStart({ req, res }) {
  try {
    const body = req.method === "POST" ? req.body : req.query;

    const q = body.q;
    const limit = Math.min(Number(body.limit) || 5, 25);
    const sfw = body.sfw === "true";

    if (!q) {
      return res.status(400).json({
        status: false,
        error: "Missing required parameter: q"
      });
    }

    const { data } = await axios.get(
      "https://api.jikan.moe/v4/anime",
      {
        params: {
          q,
          limit,
          sfw
        }
      }
    );

    const results = data.data.map(formatAnime);

    res.json({
      status: true,
      operator: "Christus",
      query: q,
      count: results.length,
      results
    });

  } catch (err) {
    res.status(500).json({
      status: false,
      error: err.message || "Failed to fetch anime data"
    });
  }
}

module.exports = { meta, onStart };
