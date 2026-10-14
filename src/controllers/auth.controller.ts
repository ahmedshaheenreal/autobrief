import { Request, Response } from "express";
import { registerUser } from "../services/userService";
import { NewUser } from "../validation/schemas";

// req.body has already been validated by validateBody(newUserSchema).
export const signup = async (req: Request, res: Response) => {
  const { token } = await registerUser(req.body as NewUser);
  res.status(201).json({ message: "User signed up successfully!", token });
};
