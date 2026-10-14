import { Between, In } from "typeorm";
import {
  getArticleRepository,
  getDigestRepository,
  getUserRepository,
} from "../db/repositories";
import { Article } from "../models/Article.model";
import { Digest, DeliveryStatus } from "../models/Digests.model";
import { SEPARATOR } from "../constants/topics";
import { endOfDay, startOfDay, toDateString } from "../utils/date";
import { escapeHtml } from "../utils/html";
import { sendEmail } from "./emailService";

export const DIGEST_SUBJECT = "Your News Daily Digest!";

export function renderDigestHtml(articles: Article[]): string {
  return articles
    .map(
      (article) => `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>🗂️ Category: <span style="color:#0056b3;">${escapeHtml(article.topic?.name ?? "general")}</span></h2>
  <h3>📰 ${escapeHtml(article.title)}</h3>
  <p><strong>📝 Summary:</strong><br>${escapeHtml(article.summary)}</p>
  <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
</div>`
    )
    .join("");
}

/**
 * Returns today's digest for a topic string, building it from today's
 * articles if needed. Returns null when there are no articles to send.
 */
export async function getOrCreateDigest(
  digestString: string,
  now: Date
): Promise<Digest | null> {
  const today = Between(startOfDay(now), endOfDay(now));
  const digestRepo = getDigestRepository();

  const existing = await digestRepo.findOne({
    where: { digestString, created_at: today },
    relations: { users: true, articles: true },
  });
  if (existing) return existing;

  const articles = await getArticleRepository().find({
    where: {
      topic: { name: In(digestString.split(SEPARATOR)) },
      createdAt: today,
    },
    relations: { topic: true },
  });
  if (articles.length === 0) return null;

  return digestRepo.save(
    digestRepo.create({
      digestString,
      articles,
      users: [],
      date: toDateString(now),
      digest_content: renderDigestHtml(articles),
    })
  );
}

/** Emails every user who has preferences the digest for their topics. */
export async function sendDailyDigests(
  now: Date = new Date()
): Promise<{ sent: number; failed: number }> {
  const users = await getUserRepository().find({ relations: { details: true } });
  // One digest per distinct topic combination, shared by every matching user.
  const digests = new Map<string, Digest | null>();
  let sent = 0;
  let failed = 0;

  for (const user of users) {
    const digestString = user.details?.topic_String;
    if (!digestString) continue;

    try {
      if (!digests.has(digestString)) {
        digests.set(digestString, await getOrCreateDigest(digestString, now));
      }
      const digest = digests.get(digestString);
      if (!digest) continue;

      await sendEmail(user.email, DIGEST_SUBJECT, digest.digest_content);
      if (!digest.users.some((recipient) => recipient.id === user.id)) {
        digest.users.push(user);
      }
      digest.delivered_at = now;
      digest.delivery_status = DeliveryStatus.DELIVERED;
      sent++;
    } catch (err) {
      failed++;
      console.error(`Failed to send digest to ${user.email}:`, err);
    }
  }

  const toSave = [...digests.values()].filter((d): d is Digest => d !== null);
  if (toSave.length) {
    await getDigestRepository().save(toSave);
  }
  return { sent, failed };
}
