import bcrypt from "bcrypt";
import { getUserRepository } from "../db/repositories";
import { User } from "../models/User.model";
import { HttpError } from "../errors/HttpError";
import { NewUser } from "../validation/schemas";
import { generateToken } from "../utils/token";

const SALT_ROUNDS = 10;

export const findUserByEmail = (email: string): Promise<User | null> =>
  getUserRepository().findOne({ where: { email } });

export const createUser = async (input: NewUser): Promise<User> => {
  const password = await bcrypt.hash(input.password, SALT_ROUNDS);
  const usersRepo = getUserRepository();
  return usersRepo.save(usersRepo.create({ ...input, password }));
};

/** Creates the account and returns an auth token for it. */
export const registerUser = async (
  input: NewUser
): Promise<{ user: User; token: string }> => {
  if (await findUserByEmail(input.email)) {
    throw new HttpError(409, "User already exists with this email.");
  }
  const user = await createUser(input);
  const token = generateToken({ email: user.email });
  return { user, token };
};
