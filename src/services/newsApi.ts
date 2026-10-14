import axios from "axios";
import { config } from "../config/env";

const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";

export type FetchedArticle = {
  title: string;
  url: string;
  source: string;
  content: string;
  publishedAt: Date;
};

/** Fetches the current top US headline for a NewsAPI category. */
export async function fetchTopArticle(category: string): Promise<FetchedArticle> {
  const response = await axios.get(NEWS_API_URL, {
    params: {
      country: "us",
      category,
      pageSize: 1,
      apiKey: config.newsApiKey,
    },
  });

  const article = response.data?.articles?.[0];
  if (!article) {
    throw new Error(`No articles returned for category "${category}"`);
  }

  return {
    title: article.title,
    url: article.url,
    source: article.source?.name ?? "Unknown",
    content:
      article.description ||
      article.content ||
      article.title ||
      "No content found.",
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
  };
}
