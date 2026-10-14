import { authMiddleware, getAuthUser } from "../../../src/middleware/auth";
import { generateToken } from "../../../src/utils/token";
import { createMockRequest, createMockResponse } from "../../helpers/mocks";

describe("authMiddleware", () => {
  const run = (authorization?: string) => {
    const req = createMockRequest({ headers: { authorization } });
    const res = createMockResponse();
    const next = jest.fn();
    authMiddleware(req, res, next);
    return { res, next };
  };

  it("rejects requests without an Authorization header", () => {
    const { res, next } = run();

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects non-Bearer schemes", () => {
    const { res, next } = run("Basic dXNlcjpwYXNz");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects an invalid token", () => {
    const { res, next } = run("Bearer garbage");

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized: Invalid token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user and calls next for a valid token", () => {
    const token = generateToken({ email: "jane@example.com" });
    const { res, next } = run(`Bearer ${token}`);

    expect(next).toHaveBeenCalledWith();
    expect(res.status).not.toHaveBeenCalled();
    expect(getAuthUser(res)).toEqual({ email: "jane@example.com" });
  });
});
