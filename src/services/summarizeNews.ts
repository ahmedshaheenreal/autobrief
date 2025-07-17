import { config } from "dotenv";
import { fetchArticle } from "../utils/FetchNews";
import { NEWS_TOPICS_ARRAY } from "../CONSANSTS/generalConstant";

config(); // Load .env

import fetch from "node-fetch";

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
      const formattedSummary = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>🗂️ Category: <span style="color:#0056b3;">${category}</span></h2>
    <h3>📰 ${article.title}</h3>
    <p><strong>📝 Summary:</strong><br>${summary}</p>
    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
  </div>
`;
      console.log(
        `\n🗂️ Category: ${category}\n📰 Title: ${article.title}\n📝 Summary:\n${summary}`
      );
    } catch (err) {
      console.error(`Error processing category "${category}":`, err.message);
    }
  }
}
