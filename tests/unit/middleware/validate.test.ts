import Joi from "joi";
import { validateBody } from "../../../src/middleware/validate";
import { createMockRequest, createMockResponse } from "../../helpers/mocks";

describe("validateBody", () => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      "any.required": "Name is required.",
    }),
  });

  it("responds 400 with the first validation message", () => {
    const req = createMockRequest({ body: {} });
    const res = createMockResponse();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Name is required." });
    expect(next).not.toHaveBeenCalled();
  });

  it("treats a missing body as empty", () => {
    const req = createMockRequest({ body: undefined });
    const res = createMockResponse();

    validateBody(schema)(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("replaces the body with the sanitized value and calls next", () => {
    const req = createMockRequest({ body: { name: "  Jane  " } });
    const res = createMockResponse();
    const next = jest.fn();

    validateBody(schema)(req, res, next);

    expect(req.body).toEqual({ name: "Jane" });
    expect(next).toHaveBeenCalledWith();
  });
});
