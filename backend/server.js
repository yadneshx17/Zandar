import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();

const PORT = process.env.PORT || 3001;

app.post("/api/preview", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Special handling for X / twitter
    if (url.includes("x.com") || url.includes("twitter.com")) {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await fetch(oembedUrl);
      // console.log(response);
      const data = await response.json();
      // console.log(data);

      return res.json({
        title: `${data.author_name} | Twitter`,
        html: data.html,
        type: "twitter",
      });
    }

    // Normal websites
    const response = await fetch(url, {
      timeout: 5000,
    });
    const html = await response.text();

    const $ = cheerio.load(html, {
      xmlMode: false,
      decodeEntities: true,
    });

    // Prefer OpenGraph title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      "Untitled";

    // handle in react
    // const favicon =
    //   $("link[rel='icon']").attr("href") ||
    //   $("link[rel='shortcut icon']").attr("href") ||
    //   "/favicon.ico";

    res.json({
      title: title.trim(),
      // favicon,
      // type: "website",
    });
    // console.log(html);
    // console.log(title);
  } catch (err) {
    console.error("Preview fetch failed:", err);
    res.json({ title: "Preview unavailable" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});
