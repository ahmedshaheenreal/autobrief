import {
  errorHandler,
  notFoundHandler,
} from "../../../src/middleware/errorHandler";
import { HttpError } from "../../../src/errors/HttpError";
import { createMockRequest, createMockResponse } from "../../helpers/mocks";

describe("errorHandler", () => {
  const handle = (err: unknown) => {
    const res = createMockResponse();
    errorHandler(err, createMockRequest(), res, jest.fn());
    return res;
  };

  it("uses the status and message of an HttpError", () => {
    const res = handle(new HttpError(409, "User already exists with this email."));

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "User already exists with this email.",
    });
  });

  it("maps client errors from body parsing to their status", () => {
    const res = handle(Object.assign(new SyntaxError("Unexpected token"), { status: 400 }));

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid request body" });
  });

  it("hides unexpected errors behind a 500", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    const res = handle(new Error("database exploded"));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });
});

describe("notFoundHandler", () => {
  it("responds 404", () => {
    const res = createMockResponse();

    notFoundHandler(createMockRequest(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
