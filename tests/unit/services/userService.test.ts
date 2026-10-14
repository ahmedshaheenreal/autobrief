import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  registerUser,
} from "../../../src/services/userService";
import { getUserRepository } from "../../../src/db/repositories";
import { validateToken } from "../../../src/utils/token";
import { HttpError } from "../../../src/errors/HttpError";
import { createMockRepository, MockRepository } from "../../helpers/mocks";

jest.mock("../../../src/db/repositories", () => ({
  getUserRepository: jest.fn(),
}));
jest.mock("bcrypt", () => ({ hash: jest.fn() }));

const newUser = {
  email: "jane@example.com",
  password: "secret123",
  firstName: "Jane",
  lastName: "Doe",
  timezone: "Africa/Cairo",
};

describe("userService", () => {
  let usersRepo: MockRepository;

  beforeEach(() => {
    usersRepo = createMockRepository();
    jest.mocked(getUserRepository).mockReturnValue(usersRepo as never);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
  });

  describe("findUserByEmail", () => {
    it("queries by email", async () => {
      const user = { id: 1, email: newUser.email };
      usersRepo.findOne.mockResolvedValue(user);

      await expect(findUserByEmail(newUser.email)).resolves.toBe(user);
      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { email: newUser.email },
      });
    });
  });

  describe("createUser", () => {
    it("stores a hashed password, never the plain one", async () => {
      await createUser(newUser);

      expect(bcrypt.hash).toHaveBeenCalledWith("secret123", 10);
      const saved = usersRepo.save.mock.calls[0][0];
      expect(saved).toMatchObject({ email: newUser.email, password: "hashed-password" });
    });

    it("does not mutate the input object", async () => {
      const input = { ...newUser };

      await createUser(input);

      expect(input.password).toBe("secret123");
    });
  });

  describe("registerUser", () => {
    it("rejects an email that is already registered with 409", async () => {
      usersRepo.findOne.mockResolvedValue({ id: 1, email: newUser.email });

      const promise = registerUser(newUser);

      await expect(promise).rejects.toBeInstanceOf(HttpError);
      await expect(promise).rejects.toMatchObject({ status: 409 });
      expect(usersRepo.save).not.toHaveBeenCalled();
    });

    it("saves the user and returns a token for their email", async () => {
      usersRepo.findOne.mockResolvedValue(null);

      const { user, token } = await registerUser(newUser);

      expect(usersRepo.save).toHaveBeenCalledTimes(1);
      expect(user.email).toBe(newUser.email);
      expect(validateToken(token)).toEqual({ email: newUser.email });
    });

    it("propagates database failures instead of reporting success", async () => {
      usersRepo.findOne.mockResolvedValue(null);
      usersRepo.save.mockRejectedValue(new Error("connection lost"));

      await expect(registerUser(newUser)).rejects.toThrow("connection lost");
    });
  });
});
