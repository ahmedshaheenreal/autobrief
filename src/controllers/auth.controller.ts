import { Request, Response } from "express";
import { newUserSchema } from "../utils/ValidateUser";
import {
  addNewUserToDatabase,
  findUserByEmail,
  validateTimezone,
} from "../services/userService";
import Joi from "joi";
import { generateToken } from "../utils/TokenHandler";
export type NewUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone: string;
};
export const signup = async (req: Request, res: Response) => {
  try {
    // Validate the request body against the schema
    const { value, error }: { value: NewUser; error: Joi.ValidationError } =
      newUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ message: error.details[0].message });
      return;
    }
    //vlidate timezone
    if (!value.timezone || !validateTimezone(value.timezone)) {
      res.status(400).json({ message: "Please Provide a valid timezone." });
      return;
    }
    // Check if the user already exists
    const existingUser = await findUserByEmail(value.email);
    if (existingUser) {
      res.status(409).json({ message: "User already exists with this email." });
      return;
    }
    //generate a token for the new user
    const token = generateToken({
      email: value.email,
    });
    // Add the new user to the database
    addNewUserToDatabase(value);
    res.status(201).json({
      message: "User signed up successfully!",
      token,
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
