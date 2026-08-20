import { describe, it, expect } from "vitest";
import { clipboardHtmlFromSelection } from "@/src/lib/clipboard-html";

function selectNodeContents(node: Node): Selection {
  const selection = window.getSelection();
  if (!selection) throw new Error("No selection");
  selection.removeAllRanges();
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.addRange(range);
  return selection;
}

describe("clipboardHtmlFromSelection", () => {
  it("returns null when selection has no images", () => {
    const root = document.createElement("div");
    root.textContent = "hello";
    document.body.appendChild(root);
    const html = clipboardHtmlFromSelection(selectNodeContents(root));
    root.remove();
    expect(html).toBeNull();
  });

  it("returns html including img and strips buttons", () => {
    const root = document.createElement("div");
    root.innerHTML =
      '<p>before</p><img src="data:image/png;base64,AAAA" alt="diagram"><button type="button">x</button><p>after</p>';
    document.body.appendChild(root);
    const html = clipboardHtmlFromSelection(selectNodeContents(root));
    root.remove();
    expect(html).toContain("<img");
    expect(html).toContain("data:image/png;base64,AAAA");
    expect(html).not.toContain("<button");
  });
});
