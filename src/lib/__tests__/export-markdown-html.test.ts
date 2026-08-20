import { describe, it, expect } from "vitest";
import { buildStandaloneMarkdownHtml } from "@/src/lib/export-markdown-html";

describe("buildStandaloneMarkdownHtml", () => {
  it("embeds cloned markdown, styles, and images; strips buttons", async () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="markdown-body">
        <h1>Hello Export</h1>
        <p>Text</p>
        <div class="mermaid-diagram">
          <button type="button">View fullscreen</button>
          <img src="data:image/png;base64,AAAA" alt="Mermaid diagram"/>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const html = await buildStandaloneMarkdownHtml(root);
    root.remove();

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Hello Export");
    expect(html).toContain("data:image/png;base64,AAAA");
    expect(html).toContain(".markdown-body");
    expect(html).not.toContain("View fullscreen");
    expect(html).toContain("<title>Hello Export</title>");
  });
});
