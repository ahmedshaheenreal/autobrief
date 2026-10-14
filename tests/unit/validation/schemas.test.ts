import {
  newUserSchema,
  preferencesSchema,
} from "../../../src/validation/schemas";

describe("newUserSchema", () => {
  const validUser = {
    email: "jane@example.com",
    password: "secret123",
    firstName: "Jane",
    lastName: "Doe",
    timezone: "Africa/Cairo",
  };

  const messageFor = (overrides: object) =>
    newUserSchema.validate({ ...validUser, ...overrides }).error?.details[0]
      .message;

  it("accepts a valid user", () => {
    expect(newUserSchema.validate(validUser).error).toBeUndefined();
  });

  it("trims names", () => {
    const { value } = newUserSchema.validate({ ...validUser, firstName: "  Jane " });

    expect(value.firstName).toBe("Jane");
  });

  it("rejects an invalid email", () => {
    expect(messageFor({ email: "not-an-email" })).toBe("Invalid email format.");
  });

  it.each(["short1", "lettersonly", "12345678"])(
    "rejects weak password %p",
    (password) => {
      expect(messageFor({ password })).toMatch(/at least 8 characters/);
    }
  );

  it("rejects a missing first name", () => {
    expect(messageFor({ firstName: undefined })).toBe("First name is required.");
  });

  it("rejects an unknown timezone", () => {
    expect(messageFor({ timezone: "Mars/Olympus" })).toBe(
      "Please Provide a valid timezone."
    );
  });

  it("rejects a missing timezone", () => {
    expect(messageFor({ timezone: undefined })).toBe("Timezone is required.");
  });

  it("rejects unknown fields", () => {
    expect(messageFor({ isAdmin: true })).toMatch(/not allowed/);
  });
});

describe("preferencesSchema", () => {
  const validPreferences = {
    topics: ["sports", "technology"],
    delivery_time: "08:00",
    delivery_frequency: "daily",
    delivery_method: "email",
  };

  const messageFor = (overrides: object) =>
    preferencesSchema.validate({ ...validPreferences, ...overrides }).error
      ?.details[0].message;

  it("accepts valid preferences", () => {
    expect(preferencesSchema.validate(validPreferences).error).toBeUndefined();
  });

  it("rejects an unknown topic", () => {
    expect(messageFor({ topics: ["sports", "cooking"] })).toBe("Invalid topic name.");
  });

  it("rejects an empty topic list", () => {
    expect(messageFor({ topics: [] })).toBe("At least one topic is required.");
  });

  it("rejects duplicate topics", () => {
    expect(messageFor({ topics: ["sports", "sports"] })).toBe(
      "Topics must not contain duplicates."
    );
  });

  it.each(["8:00", "24:00", "12:60", "noon"])(
    "rejects delivery_time %p",
    (delivery_time) => {
      expect(messageFor({ delivery_time })).toBe(
        "delivery_time must be in HH:mm format."
      );
    }
  );

  it("rejects an unknown delivery_frequency", () => {
    expect(messageFor({ delivery_frequency: "hourly" })).toMatch(/daily, weekly/);
  });

  it("rejects an unknown delivery_method", () => {
    expect(messageFor({ delivery_method: "sms" })).toMatch(/email, webhook/);
  });
});
