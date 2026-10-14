import {
  summarizeAll,
  summarizeCategory,
} from "../../../src/services/articleService";
import { getArticleRepository } from "../../../src/db/repositories";
import { fetchTopArticle } from "../../../src/services/newsApi";
import { summarizeText } from "../../../src/services/summarizer";
import { findOrCreateTopics } from "../../../src/services/topicService";
import { NEWS_TOPICS_ARRAY } from "../../../src/constants/topics";
import { createMockRepository, MockRepository } from "../../helpers/mocks";

jest.mock("../../../src/db/repositories", () => ({
  getArticleRepository: jest.fn(),
}));
jest.mock("../../../src/services/newsApi", () => ({ fetchTopArticle: jest.fn() }));
jest.mock("../../../src/services/summarizer", () => ({ summarizeText: jest.fn() }));
jest.mock("../../../src/services/topicService", () => ({
  findOrCreateTopics: jest.fn(),
}));

const fetched = (category: string) => ({
  title: `${category} headline`,
  url: `https://news.example/${category}`,
  source: "Example News",
  content: `${category} content`,
  publishedAt: new Date("2026-10-14T08:00:00Z"),
});

describe("articleService", () => {
  let articleRepo: MockRepository;

  beforeEach(() => {
    articleRepo = createMockRepository();
    articleRepo.findOne.mockResolvedValue(null);
    jest.mocked(getArticleRepository).mockReturnValue(articleRepo as never);
    jest.mocked(fetchTopArticle).mockImplementation(async (c) => fetched(c));
    jest.mocked(summarizeText).mockResolvedValue("summary");
    jest
      .mocked(findOrCreateTopics)
      .mockImplementation(async (names) => names.map((name) => ({ name })) as never);
  });

  describe("summarizeCategory", () => {
    it("saves the summarized article with its topic and entity field names", async () => {
      const article = await summarizeCategory("sports");

      expect(summarizeText).toHaveBeenCalledWith("sports content");
      expect(article).toEqual({
        title: "sports headline",
        summary: "summary",
        url: "https://news.example/sports",
        source: "Example News",
        published_at: new Date("2026-10-14T08:00:00Z"),
        topic: { name: "sports" },
      });
    });

    it("skips articles that are already stored", async () => {
      articleRepo.findOne.mockResolvedValue({ id: 1 });

      await expect(summarizeCategory("sports")).resolves.toBeNull();
      expect(summarizeText).not.toHaveBeenCalled();
      expect(articleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("summarizeAll", () => {
    it("processes every news topic", async () => {
      const saved = await summarizeAll();

      expect(saved).toHaveLength(NEWS_TOPICS_ARRAY.length);
      expect(fetchTopArticle).toHaveBeenCalledTimes(NEWS_TOPICS_ARRAY.length);
    });

    it("keeps going when one category fails", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      jest.mocked(fetchTopArticle).mockImplementation(async (c) => {
        if (c === "business") throw new Error("rate limited");
        return fetched(c);
      });

      const saved = await summarizeAll();

      expect(saved).toHaveLength(NEWS_TOPICS_ARRAY.length - 1);
      expect(console.error).toHaveBeenCalledWith(
        'Error processing category "business":',
        "rate limited"
      );
    });
  });
});
