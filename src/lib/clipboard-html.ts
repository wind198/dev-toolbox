/** Build clipboard HTML from the current selection if it includes images. */
export function clipboardHtmlFromSelection(selection: Selection | null): string | null {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

  const div = document.createElement("div");
  for (let i = 0; i < selection.rangeCount; i++) {
    div.appendChild(selection.getRangeAt(i).cloneContents());
  }

  div.querySelectorAll("button").forEach((button) => button.remove());
  if (!div.querySelector("img")) return null;

  return div.innerHTML;
}

export function selectionIsInside(selection: Selection | null, root: Node | null): boolean {
  if (!selection || !root || selection.rangeCount === 0) return false;
  return root.contains(selection.getRangeAt(0).commonAncestorContainer);
}

export function writeSelectionHtmlToClipboard(event: ClipboardEvent, root?: Node | null): boolean {
  const selection = window.getSelection();
  if (root && !selectionIsInside(selection, root)) return false;

  const html = clipboardHtmlFromSelection(selection);
  if (!html || !event.clipboardData) return false;

  event.preventDefault();
  event.clipboardData.setData("text/html", html);
  event.clipboardData.setData("text/plain", selection?.toString() ?? "");
  return true;
}
