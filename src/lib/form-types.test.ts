import { describe, expect, it } from "vitest";
import { createErrorResponse } from "./form-types";

describe("createErrorResponse", () => {
  it("returns a generic error message", () => {
    const result = createErrorResponse(new Error("fail"), "test-context");
    expect(result.success).toBe(false);
    expect(result.message).toBe("An unexpected error occurred. Please try again.");
  });

  it("handles unknown error types", () => {
    const result = createErrorResponse("string error", "test-context");
    expect(result.success).toBe(false);
    expect(result.message).toBe("An unexpected error occurred. Please try again.");
  });

  it("handles null errors", () => {
    const result = createErrorResponse(null, "test-context");
    expect(result.success).toBe(false);
  });
});
