import { summarizeAll } from "./articleService";
import { sendDailyDigests } from "./digestService";

/** Fetches and summarizes today's news, then emails each user their digest. */
export async function runDailyPipeline() {
  const articles = await summarizeAll();
  const delivery = await sendDailyDigests();
  return { articlesSaved: articles.length, ...delivery };
}
