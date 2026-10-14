import { endOfDay, startOfDay, toDateString } from "../../../src/utils/date";
import { escapeHtml } from "../../../src/utils/html";
import { isValidTimezone } from "../../../src/utils/timezone";

describe("date utils", () => {
  const date = new Date(2026, 9, 14, 15, 30, 45, 123);

  it("startOfDay returns midnight of the same day without mutating input", () => {
    const start = startOfDay(date);

    expect(start).toEqual(new Date(2026, 9, 14, 0, 0, 0, 0));
    expect(date.getHours()).toBe(15);
  });

  it("endOfDay returns the last millisecond of the same day", () => {
    expect(endOfDay(date)).toEqual(new Date(2026, 9, 14, 23, 59, 59, 999));
  });

  it("toDateString formats as zero-padded YYYY-MM-DD", () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>alert("x" & 'y')</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;"
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Markets rally today")).toBe("Markets rally today");
  });
});

describe("isValidTimezone", () => {
  it.each(["Africa/Cairo", "America/New_York", "UTC"])("accepts %s", (tz) => {
    expect(isValidTimezone(tz)).toBe(true);
  });

  it.each(["Mars/Olympus", "not a timezone", ""])("rejects %p", (tz) => {
    expect(isValidTimezone(tz)).toBe(false);
  });
});
