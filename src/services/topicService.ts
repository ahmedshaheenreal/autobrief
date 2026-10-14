import { In } from "typeorm";
import { getTopicRepository } from "../db/repositories";
import { Topic } from "../models/Topic.model";

/** Returns Topic rows for the given names, creating any that don't exist yet. */
export const findOrCreateTopics = async (names: string[]): Promise<Topic[]> => {
  const topicsRepo = getTopicRepository();
  const existing = await topicsRepo.find({ where: { name: In(names) } });
  const existingNames = new Set(existing.map((topic) => topic.name));
  const missing = names
    .filter((name) => !existingNames.has(name))
    .map((name) => topicsRepo.create({ name }));
  const created = missing.length ? await topicsRepo.save(missing) : [];
  return [...existing, ...created];
};
