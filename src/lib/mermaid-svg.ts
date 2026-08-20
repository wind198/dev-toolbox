/** Strip Mermaid's default canvas background rect so SVG exports stay transparent. */
export function stripMermaidSvgBackground(svg: string): string {
  if (typeof DOMParser === "undefined") return svg;

  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.documentElement;

    root.querySelectorAll("rect.background, rect[class*='background']").forEach((rect) => {
      rect.remove();
    });

    return new XMLSerializer().serializeToString(root);
  } catch {
    return svg;
  }
}
