import { config } from "dotenv";
import { OpenAI } from "openai";
import { fetchArticle } from "../utils/FetchNews";
import { NEWS_TOPICS_ARRAY } from "../CONSANSTS/generalConstant";
import { CohereClient } from "cohere-ai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

config(); // Load .env
// async function summarizeArticle(title: string, content: string) {
//   const prompt = `Summarize this news article in 3-4 sentences:\n\nTitle: ${title}\n\nContent: ${content}, please make the output as 1 summary per category, and I want it in a json object the key is category, the value is the title category and summery, please make the response include just the JSOn without any additions before or after so i can parse it, stick to the categories i've given u
//   `;
//   // const response = await openai.chat.completions.create({
//   //   model: "gpt-4",
//   //   messages: [{ role: "user", content: prompt }],
//   //   temperature: 0.7,
//   // });

//   // return response.choices[0].message.content?.trim();

//   const cohere = new CohereClient({
//     token: process.env.COHERE_API_KEY!,
//   });

//   const response = await cohere.generate({
//     model: "command",
//     prompt,
//     maxTokens: 300,
//     temperature: 0.25,
//   });
//   console.log("THis is the response:---", response.generations[0].text);
//   return response.generations[0].text.trim();
// }

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
