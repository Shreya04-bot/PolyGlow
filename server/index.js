const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const RAPID_API_KEY = process.env.RAPID_API_KEY;

app.post("/translate", async (req, res) => {
  const { q, source, target } = req.body;
  console.log("📥 Request body received:", req.body);

  if (!q || !source || !target) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await fetch("https://deep-translate1.p.rapidapi.com/language/translate/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": "deep-translate1.p.rapidapi.com",
        "x-rapidapi-key": RAPID_API_KEY
      },
      body: JSON.stringify({ q, source, target })
    });

    const data = await response.json();

    if (!data?.data?.translations) {
      console.error("❌ Unexpected response format:", data);
      return res.status(502).json({ error: "Invalid response from translation service" });
    }

    console.log("✅ Translated text:", data.data.translations.translatedText);
    res.json({ translatedText: data.data.translations.translatedText });

  } catch (err) {
    console.error("❌ INTERNAL SERVER ERROR:", err.message);
    res.status(500).json({ error: "Translation failed. Please try again later." });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server is running at http://localhost:5000");
});
