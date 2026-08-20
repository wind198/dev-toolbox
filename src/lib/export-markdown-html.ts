const FALLBACK_MARKDOWN_CSS = `
.markdown-body { color: #0f172a; line-height: 1.7; font-size: 0.9375rem; }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 {
  font-weight: 600; line-height: 1.3; margin-top: 1.5em; margin-bottom: 0.5em; color: #0f172a;
}
.markdown-body h1 { font-size: 1.875rem; }
.markdown-body h2 { font-size: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25em; }
.markdown-body h3 { font-size: 1.25rem; }
.markdown-body h4 { font-size: 1.125rem; }
.markdown-body p { margin: 0.75em 0; }
.markdown-body a { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; }
.markdown-body strong { font-weight: 600; }
.markdown-body em { font-style: italic; }
.markdown-body ul, .markdown-body ol { margin: 0.75em 0; padding-left: 1.5em; }
.markdown-body ul { list-style-type: disc; }
.markdown-body ol { list-style-type: decimal; }
.markdown-body li { margin: 0.25em 0; }
.markdown-body blockquote {
  margin: 1em 0; padding: 0.5em 1em; border-left: 4px solid #cbd5e1; color: #475569;
  background: #f8fafc; border-radius: 0 0.375rem 0.375rem 0;
}
.markdown-body code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em; background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 0.25rem;
}
.markdown-body pre {
  margin: 1em 0; padding: 1em; background: #f1f5f9; border-radius: 0.5rem;
  overflow-x: auto; border: 1px solid #e2e8f0;
}
.markdown-body pre code { background: none; padding: 0; font-size: 0.8125rem; }
.markdown-body table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.875rem; }
.markdown-body th, .markdown-body td { border: 1px solid #e2e8f0; padding: 0.5em 0.75em; text-align: left; }
.markdown-body th { background: #f8fafc; font-weight: 600; }
.markdown-body hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
.markdown-body input[type="checkbox"] { margin-right: 0.5em; }
.mermaid-diagram { width: 100%; overflow-x: auto; margin: 1em 0; padding: 0; background: transparent; }
.mermaid-diagram img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
.markdown-image-wrapper { display: block; margin: 1em 0; }
.markdown-image-wrapper img { max-width: 100%; height: auto; border-radius: 0.375rem; }
`.trim();

function collectLoadedMarkdownCss(): string {
  const needles = [".markdown-body", ".mermaid-diagram", ".markdown-image"];
  const parts: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || !rule.selectorText) continue;
      if (needles.some((needle) => rule.selectorText.includes(needle))) {
        parts.push(rule.cssText);
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : FALLBACK_MARKDOWN_CSS;
}

function syncCheckboxState(source: Element, clone: Element): void {
  const live = source.querySelectorAll("input");
  const copied = clone.querySelectorAll("input");
  copied.forEach((input, index) => {
    const original = live[index];
    if (!(input instanceof HTMLInputElement) || !(original instanceof HTMLInputElement)) return;
    if (original.checked) input.setAttribute("checked", "");
    else input.removeAttribute("checked");
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function inlineRemoteImages(root: Element): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      const src = img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      try {
        const res = await fetch(src);
        if (!res.ok) return;
        img.setAttribute("src", await blobToDataUrl(await res.blob()));
      } catch {
        // keep original src
      }
    }),
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function buildStandaloneMarkdownHtml(previewRoot: HTMLElement): Promise<string> {
  const source = previewRoot.querySelector(".markdown-body") ?? previewRoot;
  const clone = source.cloneNode(true) as HTMLElement;
  clone.querySelectorAll("button").forEach((button) => button.remove());
  clone.classList.remove("mermaid-diagram--open", "mermaid-diagram--fullscreen");
  clone.querySelectorAll(".mermaid-diagram--open, .mermaid-diagram--fullscreen").forEach((el) => {
    el.classList.remove("mermaid-diagram--open", "mermaid-diagram--fullscreen", "fixed", "inset-0");
  });
  syncCheckboxState(source, clone);
  await inlineRemoteImages(clone);

  const title =
    clone.querySelector("h1")?.textContent?.trim() || "Markdown Preview";
  const css = collectLoadedMarkdownCss();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeHtml(title)}</title>
<style>
html, body { margin: 0; background: #ffffff; }
body {
  padding: 1.5rem;
  font-family: ui-sans-serif, system-ui, sans-serif;
  color: #0f172a;
}
img { max-width: 100%; height: auto; }
${css}
</style>
</head>
<body>
${clone.outerHTML}
</body>
</html>
`;
}

export function downloadTextFile(filename: string, contents: string, mime = "text/html;charset=utf-8"): void {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function previewHasPendingDiagrams(previewRoot: HTMLElement | null): boolean {
  return Boolean(previewRoot?.querySelector(".mermaid-diagram--loading"));
}

export async function waitForPendingDiagrams(
  previewRoot: HTMLElement,
  timeoutMs = 30_000,
): Promise<void> {
  const started = Date.now();
  while (previewHasPendingDiagrams(previewRoot) && Date.now() - started < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
