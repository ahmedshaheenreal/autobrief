import { summarizeText } from "../../../src/services/summarizer";

describe("summarizeText", () => {
  const mockFetch = (body: unknown, init: { ok?: boolean; status?: number } = {}) =>
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      json: async () => body,
    } as Response);

  it("posts the text and returns the trimmed summary", async () => {
    const fetchSpy = mockFetch([{ summary_text: "  A short summary.  " }]);

    await expect(summarizeText("A long article")).resolves.toBe("A short summary.");
    const [, request] = fetchSpy.mock.calls[0];
    expect(request?.method).toBe("POST");
    expect(JSON.parse(request?.body as string)).toEqual({ inputs: "A long article" });
  });

  it("throws when the API responds with an error status", async () => {
    mockFetch({ error: "Model is loading" }, { ok: false, status: 503 });

    await expect(summarizeText("text")).rejects.toThrow("status 503");
  });

  it("throws on an unexpected response shape", async () => {
    mockFetch({ error: "something odd" });

    await expect(summarizeText("text")).rejects.toThrow(
      "Unexpected response from summarization API"
    );
  });
});
