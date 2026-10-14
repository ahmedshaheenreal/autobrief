import { getArticleRepository } from "../db/repositories";
import { Article } from "../models/Article.model";
import { NEWS_TOPICS_ARRAY } from "../constants/topics";
import { fetchTopArticle } from "./newsApi";
import { summarizeText } from "./summarizer";
import { findOrCreateTopics } from "./topicService";

/**
 * Fetches, summarizes and stores the top article for one category.
 * Returns null when the article is already stored.
 */
export async function summarizeCategory(category: string): Promise<Article | null> {
  const fetched = await fetchTopArticle(category);
  const articleRepo = getArticleRepository();
  if (await articleRepo.findOne({ where: { url: fetched.url } })) {
    return null;
  }

  const summary = await summarizeText(fetched.content);
  const [topic] = await findOrCreateTopics([category]);
  return articleRepo.save(
    articleRepo.create({
      title: fetched.title,
      summary,
      url: fetched.url,
      source: fetched.source,
      published_at: fetched.publishedAt,
      topic,
    })
  );
}

/** Runs summarizeCategory for every topic; one failing category doesn't stop the rest. */
export async function summarizeAll(): Promise<Article[]> {
  const saved: Article[] = [];
  for (const category of NEWS_TOPICS_ARRAY) {
    try {
      const article = await summarizeCategory(category);
      if (article) saved.push(article);
    } catch (err) {
      console.error(
        `Error processing category "${category}":`,
        err instanceof Error ? err.message : err
      );
    }
  }
  return saved;
}
