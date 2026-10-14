import jwt from "jsonwebtoken";
import { generateToken, validateToken } from "../../../src/utils/token";
import { config } from "../../../src/config/env";

describe("token utils", () => {
  it("round-trips the payload through generate and validate", () => {
    const token = generateToken({ email: "user@example.com" });

    expect(validateToken(token)).toEqual({ email: "user@example.com" });
  });

  it("sets an expiry on generated tokens", () => {
    const decoded = jwt.decode(generateToken({ email: "a@b.com" })) as jwt.JwtPayload;

    expect(decoded.exp).toBeGreaterThan(decoded.iat!);
  });

  it("returns null for a malformed token", () => {
    expect(validateToken("not-a-jwt")).toBeNull();
  });

  it("returns null for a token signed with another secret", () => {
    const token = jwt.sign({ email: "a@b.com" }, "some-other-secret");

    expect(validateToken(token)).toBeNull();
  });

  it("returns null for an expired token", () => {
    const token = jwt.sign(
      { email: "a@b.com", exp: Math.floor(Date.now() / 1000) - 60 },
      config.jwt.secret
    );

    expect(validateToken(token)).toBeNull();
  });

  it("returns null when the payload has no email", () => {
    const token = jwt.sign({ userId: 1 }, config.jwt.secret);

    expect(validateToken(token)).toBeNull();
  });
});
