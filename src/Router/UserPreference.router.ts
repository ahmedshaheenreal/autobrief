import { Router, Request, Response } from "express";
import { AddUserPreference } from "../controllers/UserPreference.controller";
import { authMiddleware } from "../middleware/Auth";

const router = Router();

// Example: Get user preferences
router.post("/:userId", authMiddleware, AddUserPreference);

export default router;
