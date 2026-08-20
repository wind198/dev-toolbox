import { describe, it, expect } from "vitest";
import { isAllowedUrl } from "@/src/lib/url-utils";

describe("isAllowedUrl", () => {
  it("allows https URLs", () => {
    expect(isAllowedUrl("https://example.com/image.png")).toBe(true);
  });

  it("allows http URLs", () => {
    expect(isAllowedUrl("http://example.com/page")).toBe(true);
  });

  it("blocks javascript: URLs", () => {
    expect(isAllowedUrl("javascript:alert(1)")).toBe(false);
  });

  it("blocks data: URLs", () => {
    expect(isAllowedUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("blocks empty strings", () => {
    expect(isAllowedUrl("")).toBe(false);
  });

  it("blocks invalid URLs", () => {
    expect(isAllowedUrl("not-a-url")).toBe(false);
  });
});
