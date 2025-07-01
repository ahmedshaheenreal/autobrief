import { verify } from "crypto";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { validateToken } from "../utils/TokenHandler";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const token: string = authHeader.split(" ")[1];
  const data: any = validateToken(token);

  if (data === null) {
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
  req.body = req.body || {};
  req.body.userEmail = data.email as string;
  next();
};
