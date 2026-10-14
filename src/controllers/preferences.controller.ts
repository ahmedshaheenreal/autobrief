import { Request, Response } from "express";
import { setUserPreferences } from "../services/preferenceService";
import { getAuthUser } from "../middleware/auth";
import { PreferencesInput } from "../validation/schemas";

// req.body has already been validated by validateBody(preferencesSchema).
export const setPreferences = async (req: Request, res: Response) => {
  const { email } = getAuthUser(res);
  await setUserPreferences(email, req.body as PreferencesInput);
  res.status(201).json({ message: "User preferences added successfully." });
};
