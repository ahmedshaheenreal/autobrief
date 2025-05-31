/**
 * Generates a JWT token with the given payload.
 * The token is signed using the secret key and expires in 1 hour.
 *
 * @param payload - The payload to include in the JWT token.
 * @returns The generated JWT token as a string.
 */

/**
 * Validates a JWT token and returns the decoded payload if valid.
 * If the token is invalid or expired, returns null.
 *
 * @param token - The JWT token to validate.
 * @returns The decoded payload as an object if valid, otherwise null.
 */
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.TOKEN_SECRET || "your-secret-key";
const EXPIRES_IN = "1h";

export function generateToken(payload: object): string {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
}

export function validateToken(token: string): object | null {
  try {
    return jwt.verify(token, SECRET_KEY) as object;
  } catch (err) {
    return null;
  }
}
