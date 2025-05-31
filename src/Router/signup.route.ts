import { Router } from "express";
import { signup } from "../controllers/auth.controller";

export const signupRouter = Router();

signupRouter.post("/signup", signup);
