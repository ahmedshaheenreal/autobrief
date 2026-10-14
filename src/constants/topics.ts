export const NEWS_TOPICS = {
  BUSINESS: "business",
  ENTERTAINMENT: "entertainment",
  GENERAL: "general",
  HEALTH: "health",
  SCIENCE: "science",
  SPORTS: "sports",
  TECHNOLOGY: "technology",
} as const;

export type NewsTopic = (typeof NEWS_TOPICS)[keyof typeof NEWS_TOPICS];

export const NEWS_TOPICS_ARRAY: NewsTopic[] = Object.values(NEWS_TOPICS);
export const NEWS_TOPICS_SET: Set<string> = new Set(NEWS_TOPICS_ARRAY);

export const DELIVERY_FREQUENCIES = ["daily", "weekly"] as const;
export const DELIVERY_METHODS = ["email", "webhook"] as const;
export type DeliveryFrequency = (typeof DELIVERY_FREQUENCIES)[number];
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const SEPARATOR = "*#$#$*";
