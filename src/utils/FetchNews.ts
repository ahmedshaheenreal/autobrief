import axios from "axios";
import { config } from "dotenv";
import { OpenAI } from "openai";

config(); // Load .env

export async function fetchArticle(category: string) {
  const response = await axios.get("https://newsapi.org/v2/top-headlines", {
    params: {
      country: "us", // Required by NewsAPI
      category, // One of: business, entertainment, general, health, science, sports, technology
      pageSize: 1, // Max number of articles to fetch
      apiKey: process.env.NEWS_API_KEY, // Pass as query param, not header
    },
    headers: {
      "x-api-key": process.env.NEWS_API_KEY,
    },
  });

  const article = response.data.articles[0];
  return {
    title: article.title,
    article_url: article.url,
    article_source: article.source.name,
    content:
      article.summary ||
      article.excerpt ||
      article.content ||
      "No content found.",
  };
}
