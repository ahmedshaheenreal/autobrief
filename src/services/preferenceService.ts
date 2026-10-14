import { getPreferencesRepository, getUserRepository } from "../db/repositories";
import { UsePreferences } from "../models/UsePreferences.model";
import { HttpError } from "../errors/HttpError";
import { SEPARATOR } from "../constants/topics";
import { PreferencesInput } from "../validation/schemas";
import { findOrCreateTopics } from "./topicService";

/**
 * Canonical key for a set of topics. Users with the same topics share one
 * digest per day, so the key must not depend on the order topics were chosen.
 */
export const buildTopicString = (topicNames: string[]): string =>
  [...topicNames].sort().join(SEPARATOR);

/** Creates or replaces the preferences of the user with the given email. */
export const setUserPreferences = async (
  email: string,
  input: PreferencesInput
): Promise<UsePreferences> => {
  const usersRepo = getUserRepository();
  const user = await usersRepo.findOne({
    where: { email },
    relations: { details: true },
  });
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  const preferencesRepo = getPreferencesRepository();
  const preferences = user.details ?? preferencesRepo.create();
  preferences.topics = await findOrCreateTopics(input.topics);
  preferences.topic_String = buildTopicString(input.topics);
  preferences.delivery_time = input.delivery_time;
  preferences.delivery_frequency = input.delivery_frequency;
  preferences.delivery_method = input.delivery_method;

  const saved = await preferencesRepo.save(preferences);
  user.details = saved;
  await usersRepo.save(user);
  return saved;
};
