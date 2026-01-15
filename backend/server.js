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

function isYouTube(url) {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function isTwitterX(url) {
  return url.includes("x.com") || url.includes("twitter.com");
}

function normalizeURL(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

app.post("/api/preview", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  
  const newUrl = normalizeURL(url);

  try {
    // Special handling for X / twitter
    if (isTwitterX(newUrl)) {
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(newUrl)}`;
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

    if (isYouTube(newUrl)) {
      try {
        const oembed = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(newUrl)}&format=json`,
        );

        if (!oembed.ok) {
          throw new Error(`YouTube oEmbed returned ${oembed.status}`);
        }

        const data = await oembed.json();

        return res.json({
          title: data.title,
          provider: "youtube",
          thumbnail: data.thumbnail_url,
        });
      } catch (err) {
        console.warn(
          "YouTube oEmbed failed, falling back to HTML scrape:",
          err,
        );
        // fall through to generic handler below
      }
    }

    // Normal websites
    const response = await fetch(newUrl, {
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
    res.json({ title: "Untitled" });
  }
});

app.get("/health", async (req, res) => {
  res.json({
    message: "Server is Working.......",
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});
