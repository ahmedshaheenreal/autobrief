import {
  DIGEST_SUBJECT,
  getOrCreateDigest,
  renderDigestHtml,
  sendDailyDigests,
} from "../../../src/services/digestService";
import {
  getArticleRepository,
  getDigestRepository,
  getUserRepository,
} from "../../../src/db/repositories";
import { sendEmail } from "../../../src/services/emailService";
import { Digest, DeliveryStatus } from "../../../src/models/Digests.model";
import { Article } from "../../../src/models/Article.model";
import { SEPARATOR } from "../../../src/constants/topics";
import { createMockRepository, MockRepository } from "../../helpers/mocks";

jest.mock("../../../src/db/repositories", () => ({
  getArticleRepository: jest.fn(),
  getDigestRepository: jest.fn(),
  getUserRepository: jest.fn(),
}));
jest.mock("../../../src/services/emailService", () => ({ sendEmail: jest.fn() }));

const article = (overrides: Partial<Article> = {}) =>
  ({
    id: 1,
    title: "Big Win",
    summary: "The home team won.",
    topic: { name: "sports" },
    ...overrides,
  }) as Article;

const NOW = new Date(2026, 9, 14, 9, 0, 0);

describe("renderDigestHtml", () => {
  it("renders the category, title and summary of each article", () => {
    const html = renderDigestHtml([
      article(),
      article({ title: "Chip shortage", topic: { name: "technology" } as never }),
    ]);

    expect(html).toContain("sports");
    expect(html).toContain("Big Win");
    expect(html).toContain("The home team won.");
    expect(html).toContain("Chip shortage");
  });

  it("escapes HTML coming from news sources", () => {
    const html = renderDigestHtml([article({ title: "<img src=x onerror=alert(1)>" })]);

    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt;");
  });

  it("returns an empty string for no articles", () => {
    expect(renderDigestHtml([])).toBe("");
  });
});

describe("digest delivery", () => {
  let userRepo: MockRepository;
  let articleRepo: MockRepository;
  let digestRepo: MockRepository;

  beforeEach(() => {
    userRepo = createMockRepository();
    articleRepo = createMockRepository();
    digestRepo = createMockRepository();
    jest.mocked(getUserRepository).mockReturnValue(userRepo as never);
    jest.mocked(getArticleRepository).mockReturnValue(articleRepo as never);
    jest.mocked(getDigestRepository).mockReturnValue(digestRepo as never);
    jest.mocked(sendEmail).mockResolvedValue("message-id");
    digestRepo.findOne.mockResolvedValue(null);
    articleRepo.find.mockResolvedValue([article()]);
  });

  describe("getOrCreateDigest", () => {
    it("returns today's existing digest without rebuilding it", async () => {
      const existing = { id: 5, users: [], articles: [] };
      digestRepo.findOne.mockResolvedValue(existing);

      await expect(getOrCreateDigest("sports", NOW)).resolves.toBe(existing);
      expect(articleRepo.find).not.toHaveBeenCalled();
    });

    it("builds a digest from today's articles in the user's topics", async () => {
      const digest = await getOrCreateDigest(`business${SEPARATOR}sports`, NOW);

      const { where } = articleRepo.find.mock.calls[0][0];
      expect(where.topic.name.value).toEqual(["business", "sports"]);
      expect(where.createdAt.value).toEqual([
        new Date(2026, 9, 14, 0, 0, 0, 0),
        new Date(2026, 9, 14, 23, 59, 59, 999),
      ]);
      expect(digest).toMatchObject({
        digestString: `business${SEPARATOR}sports`,
        date: "2026-10-14",
        users: [],
      });
      expect(digest?.digest_content).toContain("Big Win");
      expect(digestRepo.save).toHaveBeenCalledTimes(1);
    });

    it("returns null and saves nothing when there are no articles", async () => {
      articleRepo.find.mockResolvedValue([]);

      await expect(getOrCreateDigest("sports", NOW)).resolves.toBeNull();
      expect(digestRepo.save).not.toHaveBeenCalled();
    });
  });

  describe("sendDailyDigests", () => {
    const user = (id: number, topic_String?: string) => ({
      id,
      email: `user${id}@example.com`,
      details: topic_String ? { topic_String } : null,
    });

    it("emails each user with preferences and records them as recipients", async () => {
      userRepo.find.mockResolvedValue([user(1, "sports"), user(2, "sports")]);

      const result = await sendDailyDigests(NOW);

      expect(result).toEqual({ sent: 2, failed: 0 });
      expect(sendEmail).toHaveBeenCalledWith(
        "user1@example.com",
        DIGEST_SUBJECT,
        expect.stringContaining("Big Win")
      );
      const [savedDigests] = digestRepo.save.mock.calls.at(-1)! as [Digest[]];
      expect(savedDigests).toHaveLength(1);
      expect(savedDigests[0].users.map((u) => u.id)).toEqual([1, 2]);
      expect(savedDigests[0].delivery_status).toBe(DeliveryStatus.DELIVERED);
      expect(savedDigests[0].delivered_at).toBe(NOW);
    });

    it("builds each distinct digest only once", async () => {
      userRepo.find.mockResolvedValue([
        user(1, "sports"),
        user(2, "sports"),
        user(3, "health"),
      ]);

      await sendDailyDigests(NOW);

      expect(digestRepo.findOne).toHaveBeenCalledTimes(2);
    });

    it("skips users who have not chosen preferences", async () => {
      userRepo.find.mockResolvedValue([user(1)]);

      await expect(sendDailyDigests(NOW)).resolves.toEqual({ sent: 0, failed: 0 });
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("does not send empty digests", async () => {
      articleRepo.find.mockResolvedValue([]);
      userRepo.find.mockResolvedValue([user(1, "sports")]);

      await expect(sendDailyDigests(NOW)).resolves.toEqual({ sent: 0, failed: 0 });
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("does not add a user twice when the digest is re-sent", async () => {
      const recipient = user(1, "sports");
      digestRepo.findOne.mockResolvedValue({
        digest_content: "<p>digest</p>",
        users: [recipient],
        articles: [],
      });
      userRepo.find.mockResolvedValue([recipient]);

      await sendDailyDigests(NOW);

      const [savedDigests] = digestRepo.save.mock.calls.at(-1)! as [Digest[]];
      expect(savedDigests[0].users).toHaveLength(1);
    });

    it("keeps sending to other users when one email fails", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      userRepo.find.mockResolvedValue([user(1, "sports"), user(2, "sports")]);
      jest
        .mocked(sendEmail)
        .mockRejectedValueOnce(new Error("SMTP down"))
        .mockResolvedValueOnce("message-id");

      const result = await sendDailyDigests(NOW);

      expect(result).toEqual({ sent: 1, failed: 1 });
      const [savedDigests] = digestRepo.save.mock.calls.at(-1)! as [Digest[]];
      expect(savedDigests[0].users.map((u) => u.id)).toEqual([2]);
    });
  });
});
