export const NEWS_TOPICS = {
  BUSINESS: "business",
  ENTERTAINMENT: "entertainment",
  GENERAL: "general",
  HEALTH: "health",
  SCIENCE: "science",
  SPORTS: "sports",
  TECHNOLOGY: "technology",
} as const;
export const NEWS_TOPICS_ARRAY: string[] = [
  "business",
  "entertainment",
  "general",
  "health",
  "science",
  "sports",
  "technology",
];
export const NEWS_TOPICS_SET: Set<string> = new Set(NEWS_TOPICS_ARRAY);
