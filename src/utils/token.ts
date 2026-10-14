import jwt from "jsonwebtoken";
import { config } from "../config/env";

export type TokenPayload = { email: string };

/** Signs a JWT for the given payload; expires per config.jwt.expiresIn. */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/** Returns the decoded payload, or null if the token is invalid or expired. */
export function validateToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (typeof decoded === "string" || typeof decoded.email !== "string") {
      return null;
    }
    return { email: decoded.email };
  } catch {
    return null;
  }
}
