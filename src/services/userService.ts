import { NewUser } from "../controllers/auth.controller";
import bcrypt from "bcrypt";
import AppDataSource from "../db/dbconfig";
import { UsePreferences } from "../models/UsePreferences.model";
import { Topic } from "../models/Topic.model";
const usersRepo = AppDataSource.getRepository("User");

export const addNewUserToDatabase = async (user: NewUser): Promise<void> => {
  //hash the password before saving
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  //create a new user entity and save it to the database
  const newUser = usersRepo.create(user);
  usersRepo.save(newUser);
};

export const findUserByEmail = async (
  email: string
): Promise<NewUser | null> => {
  //find a user by email
  const user = await usersRepo.findOne({ where: { email } });
  return user ? (user as NewUser) : null;
};

export const validateTimezone = (timezone: string): boolean => {
  // Check if the timezone is a valid IANA timezone string
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
    });
    return true;
  } catch (error) {
    // console.error("", error);
    return false;
  }
};

export const choosePreferences = async (
  preferences: string[],
  email: string
) => {
  const usePreferencesRepo = AppDataSource.getRepository(UsePreferences);
  const topicsRepo = AppDataSource.getRepository(Topic);

  const topics: Topic[] = [];
  // Create a new UsePreferences entity
  for (const preference of preferences) {
    const existingPreference = await topicsRepo.findOne({
      where: { name: preference },
    });
    topics.push(existingPreference);
  }
  const newPreferences: UsePreferences = usePreferencesRepo.create({
    topics: topics.sort(), // Sort topics alphabetically
    delivery_time: "08:00", // Default time, can be customized
    delivery_frequency: "daily", // Default frequency, can be customized
    delivery_method: "email", // Default method, can be customized
  });
  const savedPreferences = await usePreferencesRepo.save(newPreferences);

  const user = await usersRepo.findOne({ where: { email } });
  user.details = newPreferences;
  console.log("user", user);
  // Save the new preferences to the database
  await usersRepo.save(user);
};
