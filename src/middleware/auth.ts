import { Request, Response, NextFunction } from "express";
import { TokenPayload, validateToken } from "../utils/token";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const payload = validateToken(authHeader.slice("Bearer ".length));
  if (payload === null) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }

  res.locals.user = payload;
  next();
};

/** Returns the user attached by authMiddleware. */
export const getAuthUser = (res: Response): TokenPayload => res.locals.user;
