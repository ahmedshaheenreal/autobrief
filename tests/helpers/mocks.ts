import { Request, Response } from "express";

/** In-memory stand-in for a TypeORM Repository with the methods services use. */
export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data: object = {}) => ({ ...data })),
  save: jest.fn(async (entity: unknown) => entity),
});
export type MockRepository = ReturnType<typeof createMockRepository>;

export const createMockRequest = (overrides: Partial<Request> = {}) =>
  ({ headers: {}, body: {}, ...overrides }) as Request;

export const createMockResponse = () => {
  const res = { locals: {} } as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
