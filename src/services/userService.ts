import { NewUser } from "../controllers/auth.controller";
import bcrypt from "bcrypt";
import AppDataSource from "../db/dbconfig";

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

export const choosePreferences = async (preferences: string[]) => {};
