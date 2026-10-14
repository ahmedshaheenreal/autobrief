import {
  buildTopicString,
  setUserPreferences,
} from "../../../src/services/preferenceService";
import {
  getPreferencesRepository,
  getUserRepository,
} from "../../../src/db/repositories";
import { findOrCreateTopics } from "../../../src/services/topicService";
import { SEPARATOR } from "../../../src/constants/topics";
import { PreferencesInput } from "../../../src/validation/schemas";
import { createMockRepository, MockRepository } from "../../helpers/mocks";

jest.mock("../../../src/db/repositories", () => ({
  getUserRepository: jest.fn(),
  getPreferencesRepository: jest.fn(),
}));
jest.mock("../../../src/services/topicService", () => ({
  findOrCreateTopics: jest.fn(),
}));

describe("buildTopicString", () => {
  it("is independent of the order topics were chosen in", () => {
    expect(buildTopicString(["technology", "business", "sports"])).toBe(
      buildTopicString(["sports", "technology", "business"])
    );
  });

  it("joins sorted topic names with the separator", () => {
    expect(buildTopicString(["sports", "business"])).toBe(
      `business${SEPARATOR}sports`
    );
  });

  it("does not reorder the caller's array", () => {
    const topics = ["sports", "business"];

    buildTopicString(topics);

    expect(topics).toEqual(["sports", "business"]);
  });
});

describe("setUserPreferences", () => {
  let usersRepo: MockRepository;
  let preferencesRepo: MockRepository;

  const input: PreferencesInput = {
    topics: ["technology", "business"],
    delivery_time: "07:30",
    delivery_frequency: "weekly",
    delivery_method: "webhook",
  };
  const topicEntities = [
    { id: 1, name: "technology" },
    { id: 2, name: "business" },
  ];

  beforeEach(() => {
    usersRepo = createMockRepository();
    preferencesRepo = createMockRepository();
    jest.mocked(getUserRepository).mockReturnValue(usersRepo as never);
    jest.mocked(getPreferencesRepository).mockReturnValue(preferencesRepo as never);
    jest.mocked(findOrCreateTopics).mockResolvedValue(topicEntities as never);
  });

  it("throws 404 when the user does not exist", async () => {
    usersRepo.findOne.mockResolvedValue(null);

    await expect(setUserPreferences("ghost@example.com", input)).rejects.toMatchObject({
      status: 404,
    });
    expect(preferencesRepo.save).not.toHaveBeenCalled();
  });

  it("creates preferences from the request instead of hardcoded defaults", async () => {
    const user = { id: 7, email: "jane@example.com", details: null };
    usersRepo.findOne.mockResolvedValue(user);

    const saved = await setUserPreferences(user.email, input);

    expect(findOrCreateTopics).toHaveBeenCalledWith(["technology", "business"]);
    expect(saved).toMatchObject({
      topics: topicEntities,
      topic_String: `business${SEPARATOR}technology`,
      delivery_time: "07:30",
      delivery_frequency: "weekly",
      delivery_method: "webhook",
    });
  });

  it("links the saved preferences to the user", async () => {
    const user = { id: 7, email: "jane@example.com", details: null };
    usersRepo.findOne.mockResolvedValue(user);

    const saved = await setUserPreferences(user.email, input);

    expect(usersRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, details: saved })
    );
  });

  it("updates existing preferences rather than creating a second row", async () => {
    const existing = { user_id: 3, topics: [], topic_String: "sports" };
    const user = { id: 7, email: "jane@example.com", details: existing };
    usersRepo.findOne.mockResolvedValue(user);

    const saved = await setUserPreferences(user.email, input);

    expect(preferencesRepo.create).not.toHaveBeenCalled();
    expect(saved).toBe(existing);
    expect(saved.user_id).toBe(3);
    expect(saved.topic_String).toBe(`business${SEPARATOR}technology`);
  });
});
