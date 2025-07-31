import { config } from "dotenv";
import { fetchArticle } from "../utils/FetchNews";
import { NEWS_TOPICS_ARRAY } from "../CONSANSTS/generalConstant";

config(); // Load .env

import fetch from "node-fetch";
import AppDataSource from "../db/dbconfig";

async function summarizeArticle(title: string, content: string) {
  const articleText = content;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: articleText }),
    }
  );
  const result = await response.json();

  return result[0].summary_text.trim();
}

export async function summarizeAll() {
  for (const category of NEWS_TOPICS_ARRAY) {
    try {
      const article = await fetchArticle(category);
      const summary = await summarizeArticle(article.title, article.content);

      console.log(
        `\n🗂️ Category: ${category}\n📰 Title: ${article.title}\n📝 Summary:\n${summary}`
      );

      //Save articles in database
      const articleRepo = AppDataSource.getRepository("Article");

      const newArticle = articleRepo.create({
        title: article.title,
        summary: summary,
        article_url: article.article_url,
        content: article.content,
        topic: { name: category }, // Assuming Topic model has a name field
        source: article.article_source,
      });
      await articleRepo.save(newArticle);
    } catch (err) {
      console.error(`Error processing category "${category}":`, err.message);
    }
  }
}
