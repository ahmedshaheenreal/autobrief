import { Router } from "express";
import { signup } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate";
import { newUserSchema } from "../validation/schemas";

export const authRouter = Router();

authRouter.post("/signup", validateBody(newUserSchema), signup);
