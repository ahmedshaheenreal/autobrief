import { findOrCreateTopics } from "../../../src/services/topicService";
import { getTopicRepository } from "../../../src/db/repositories";
import { createMockRepository, MockRepository } from "../../helpers/mocks";

jest.mock("../../../src/db/repositories", () => ({
  getTopicRepository: jest.fn(),
}));

describe("findOrCreateTopics", () => {
  let topicsRepo: MockRepository;

  beforeEach(() => {
    topicsRepo = createMockRepository();
    jest.mocked(getTopicRepository).mockReturnValue(topicsRepo as never);
  });

  it("returns existing topics without saving anything", async () => {
    topicsRepo.find.mockResolvedValue([{ id: 1, name: "sports" }]);

    const topics = await findOrCreateTopics(["sports"]);

    expect(topics).toEqual([{ id: 1, name: "sports" }]);
    expect(topicsRepo.save).not.toHaveBeenCalled();
  });

  it("creates only the topics that are missing", async () => {
    topicsRepo.find.mockResolvedValue([{ id: 1, name: "sports" }]);

    const topics = await findOrCreateTopics(["sports", "health", "science"]);

    expect(topicsRepo.save).toHaveBeenCalledWith([
      { name: "health" },
      { name: "science" },
    ]);
    expect(topics.map((t) => t.name)).toEqual(["sports", "health", "science"]);
  });
});
