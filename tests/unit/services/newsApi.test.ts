import axios from "axios";
import { fetchTopArticle } from "../../../src/services/newsApi";

jest.mock("axios");

describe("fetchTopArticle", () => {
  const mockedGet = jest.mocked(axios.get);

  it("requests the top headline for the category", async () => {
    mockedGet.mockResolvedValue({
      data: { articles: [{ title: "t", url: "u", source: { name: "s" } }] },
    });

    await fetchTopArticle("sports");

    expect(mockedGet).toHaveBeenCalledWith(
      "https://newsapi.org/v2/top-headlines",
      expect.objectContaining({
        params: expect.objectContaining({ category: "sports", pageSize: 1 }),
      })
    );
  });

  it("maps the NewsAPI article to our shape", async () => {
    mockedGet.mockResolvedValue({
      data: {
        articles: [
          {
            title: "Big Win",
            url: "https://news.example/big-win",
            source: { name: "Example News" },
            description: "The home team won.",
            content: "Full content...",
            publishedAt: "2026-10-14T08:00:00Z",
          },
        ],
      },
    });

    await expect(fetchTopArticle("sports")).resolves.toEqual({
      title: "Big Win",
      url: "https://news.example/big-win",
      source: "Example News",
      content: "The home team won.",
      publishedAt: new Date("2026-10-14T08:00:00Z"),
    });
  });

  it("falls back to content, then title, when description is missing", async () => {
    mockedGet.mockResolvedValue({
      data: { articles: [{ title: "Only a title", url: "u", source: { name: "s" } }] },
    });

    const article = await fetchTopArticle("health");

    expect(article.content).toBe("Only a title");
  });

  it("throws when NewsAPI returns no articles", async () => {
    mockedGet.mockResolvedValue({ data: { articles: [] } });

    await expect(fetchTopArticle("science")).rejects.toThrow(
      'No articles returned for category "science"'
    );
  });
});
