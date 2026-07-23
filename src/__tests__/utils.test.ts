import { describe, it, expect } from "vitest";
import { cn, formatDate, formatCredits, truncate } from "@/lib/utils";

describe("cn (classnames)", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("px-4", "px-2")).toBe("px-2");
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a date string in French locale", () => {
    const result = formatDate("2026-07-22");
    expect(result).toContain("juillet");
    expect(result).toContain("2026");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date(2026, 0, 15));
    expect(result).toContain("janvier");
  });
});

describe("formatCredits", () => {
  it("formats a number with French separators", () => {
    expect(formatCredits(1000)).toBe("1\u202f000");
  });
});

describe("truncate", () => {
  it("returns the string if shorter than max length", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates and adds ellipsis", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});
