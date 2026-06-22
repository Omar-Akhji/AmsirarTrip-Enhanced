import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false, "baz")).toBe("foo baz");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("p-2 p-4")).toBe("p-4");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null)).toBe("foo");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
