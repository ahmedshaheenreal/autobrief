import request from "supertest";
import { createApp } from "../../src/app";
import { registerUser } from "../../src/services/userService";
import { setUserPreferences } from "../../src/services/preferenceService";
import { HttpError } from "../../src/errors/HttpError";
import { generateToken } from "../../src/utils/token";

// Route tests exercise routing, middleware and controllers; services are mocked.
jest.mock("../../src/services/userService", () => ({ registerUser: jest.fn() }));
jest.mock("../../src/services/preferenceService", () => ({
  setUserPreferences: jest.fn(),
}));

const app = createApp();

describe("GET /", () => {
  it("responds with a greeting", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello, World!");
  });
});

describe("unknown routes", () => {
  it("respond 404 as JSON", async () => {
    const res = await request(app).get("/api/nope");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Not found" });
  });
});

describe("POST /api/signup", () => {
  const validUser = {
    email: "jane@example.com",
    password: "secret123",
    firstName: "Jane",
    lastName: "Doe",
    timezone: "Africa/Cairo",
  };

  it("creates the user and returns a token", async () => {
    jest.mocked(registerUser).mockResolvedValue({ user: {} as never, token: "tok" });

    const res = await request(app).post("/api/signup").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "User signed up successfully!", token: "tok" });
    expect(registerUser).toHaveBeenCalledWith(validUser);
  });

  it("returns 400 for invalid input without touching the service", async () => {
    const res = await request(app)
      .post("/api/signup")
      .send({ ...validUser, email: "nope" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Invalid email format." });
    expect(registerUser).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const res = await request(app)
      .post("/api/signup")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(res.status).toBe(400);
  });

  it("returns 409 when the email is taken", async () => {
    jest
      .mocked(registerUser)
      .mockRejectedValue(new HttpError(409, "User already exists with this email."));

    const res = await request(app).post("/api/signup").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: "User already exists with this email." });
  });

  it("returns 500 when the service fails unexpectedly", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.mocked(registerUser).mockRejectedValue(new Error("db down"));

    const res = await request(app).post("/api/signup").send(validUser);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal server error" });
  });
});

describe("POST /api/userpreferences", () => {
  const preferences = {
    topics: ["sports"],
    delivery_time: "08:00",
    delivery_frequency: "daily",
    delivery_method: "email",
  };
  const authHeader = () => `Bearer ${generateToken({ email: "jane@example.com" })}`;

  it("requires authentication", async () => {
    const res = await request(app).post("/api/userpreferences").send(preferences);

    expect(res.status).toBe(401);
    expect(setUserPreferences).not.toHaveBeenCalled();
  });

  it("validates the body after authenticating", async () => {
    const res = await request(app)
      .post("/api/userpreferences")
      .set("Authorization", authHeader())
      .send({ ...preferences, topics: ["cooking"] });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Invalid topic name." });
  });

  it("saves preferences for the user in the token", async () => {
    const res = await request(app)
      .post("/api/userpreferences")
      .set("Authorization", authHeader())
      .send(preferences);

    expect(res.status).toBe(201);
    expect(setUserPreferences).toHaveBeenCalledWith("jane@example.com", preferences);
  });

  it("returns 404 when the token's user no longer exists", async () => {
    jest
      .mocked(setUserPreferences)
      .mockRejectedValue(new HttpError(404, "User not found."));

    const res = await request(app)
      .post("/api/userpreferences")
      .set("Authorization", authHeader())
      .send(preferences);

    expect(res.status).toBe(404);
  });
});
