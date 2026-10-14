import { Router } from "express";
import { setPreferences } from "../controllers/preferences.controller";
import { authMiddleware } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { preferencesSchema } from "../validation/schemas";

export const preferencesRouter = Router();

// The user is identified by their token, never by a URL parameter.
preferencesRouter.post(
  "/",
  authMiddleware,
  validateBody(preferencesSchema),
  setPreferences
);
