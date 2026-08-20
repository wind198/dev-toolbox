/** Strip Mermaid's default canvas background rect so SVG exports stay transparent. */
export function stripMermaidSvgBackground(svg: string): string {
  if (typeof DOMParser === "undefined") return svg;

  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;

    root.querySelectorAll("rect.background, rect[class*='background']").forEach((rect) => {
      if (rect.closest(".edgeLabel")) return;
      rect.remove();
    });

    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}

const PIXEL_SIZE = /^\d+(\.\d+)?(px)?$/;
const PNG_SCALE = 2;

function isExternalHref(href: string): boolean {
  return href !== "" && !href.startsWith("#") && !href.startsWith("data:");
}

const SVG_NS = "http://www.w3.org/2000/svg";
const LABEL_FILL = "#0f172a";
const EDGE_LABEL_BG = "#ffffff";

function isEdgeLabel(el: Element): boolean {
  return Boolean(el.closest(".edgeLabel"));
}

/** foreignObject HTML labels do not paint in <img>/canvas — replace with SVG text. */
export function replaceForeignObjectsWithText(root: Element, doc: Document): void {
  root.querySelectorAll("foreignObject").forEach((fo) => {
    const label = (fo.textContent ?? "").replace(/\s+/g, " ").trim();
    const x = parseFloat(fo.getAttribute("x") ?? "0");
    const y = parseFloat(fo.getAttribute("y") ?? "0");
    const width = parseFloat(fo.getAttribute("width") ?? "0");
    const height = parseFloat(fo.getAttribute("height") ?? "0");
    const cx = Number.isFinite(x) && Number.isFinite(width) ? x + width / 2 : 0;
    const cy = Number.isFinite(y) && Number.isFinite(height) ? y + height / 2 : 0;

    const text = doc.createElementNS(SVG_NS, "text");
    text.setAttribute("x", String(cx));
    text.setAttribute("y", String(cy));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("fill", LABEL_FILL);
    text.setAttribute("font-size", "16");
    text.setAttribute("font-family", "Arial, Helvetica, sans-serif");
    text.textContent = label;

    if (isEdgeLabel(fo) && width > 0 && height > 0) {
      const group = doc.createElementNS(SVG_NS, "g");
      const rect = createLabelBackgroundRect(doc, x, y, width, height);
      group.append(rect, text);
      fo.replaceWith(group);
      return;
    }

    fo.replaceWith(text);
  });
}

function createLabelBackgroundRect(
  doc: Document,
  x: number,
  y: number,
  width: number,
  height: number,
): SVGRectElement {
  const rect = doc.createElementNS(SVG_NS, "rect");
  rect.setAttribute("x", String(x));
  rect.setAttribute("y", String(y));
  rect.setAttribute("width", String(width));
  rect.setAttribute("height", String(height));
  rect.setAttribute("fill", EDGE_LABEL_BG);
  rect.setAttribute("rx", "2");
  return rect;
}

/** Keep mermaid's getBBox-aligned rect; only force an opaque fill. Do not guess from text y. */
export function ensureEdgeLabelBackgrounds(root: Element): void {
  root.querySelectorAll(".edgeLabel rect").forEach((rect) => {
    rect.setAttribute("fill", EDGE_LABEL_BG);
    rect.setAttribute("opacity", "1");
  });
}

/** Ensure SVG has pixel width/height and nothing that taints canvas. */
export function prepareSvgForRaster(svg: string): string {
  if (typeof DOMParser === "undefined") return svg;

  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;

    if (!root.getAttribute("xmlns")) {
      root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    }

    replaceForeignObjectsWithText(root, doc);
    ensureEdgeLabelBackgrounds(root);

    root.querySelectorAll("text").forEach((el) => {
      if (!el.getAttribute("fill")) el.setAttribute("fill", LABEL_FILL);
    });

    root.querySelectorAll("image").forEach((el) => {
      const href = el.getAttribute("href") ?? el.getAttribute("xlink:href") ?? "";
      if (isExternalHref(href)) el.remove();
    });

    const viewBox = root.getAttribute("viewBox");
    const width = root.getAttribute("width");
    const height = root.getAttribute("height");
    const needsWidth = !width || !PIXEL_SIZE.test(width.trim());
    const needsHeight = !height || !PIXEL_SIZE.test(height.trim());

    if (viewBox && (needsWidth || needsHeight)) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite)) {
        const [, , vbWidth, vbHeight] = parts;
        if (needsWidth) root.setAttribute("width", String(vbWidth));
        if (needsHeight) root.setAttribute("height", String(vbHeight));
      }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>${new XMLSerializer().serializeToString(root)}`;
  } catch {
    return svg;
  }
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load SVG image"));
    img.src = src;
  });
}

/** Rasterize SVG to a white-background PNG data URL (survives HTML copy/paste). */
export async function svgToPngDataUrl(svg: string): Promise<string> {
  const prepared = prepareSvgForRaster(svg);
  const image = await loadImage(svgToDataUrl(prepared));
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("Unable to determine SVG size");
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * PNG_SCALE);
  canvas.height = Math.ceil(height * PNG_SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}
