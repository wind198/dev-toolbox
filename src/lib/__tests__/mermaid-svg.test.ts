import { describe, it, expect } from "vitest";
import {
  prepareSvgForRaster,
  stripMermaidSvgBackground,
} from "@/src/lib/mermaid-svg";

const SVG_WITH_MARKERS = `<?xml version="1.0"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40">
  <rect class="background" width="100" height="40" fill="#fff"/>
  <defs>
    <marker id="flowchart-v2-pointEnd" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
      <path d="M0,0 L8,4 L0,8 Z" fill="#334155"/>
    </marker>
  </defs>
  <path class="flowchart-link" d="M10,20 L90,20" stroke="#334155" marker-end="url(#flowchart-v2-pointEnd)"/>
</svg>`;

const SVG_VIEWBOX_ONLY = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80"><rect width="240" height="80"/></svg>`;

describe("stripMermaidSvgBackground", () => {
  it("removes background rects", () => {
    const result = stripMermaidSvgBackground(SVG_WITH_MARKERS);
    expect(result).not.toMatch(/class="background"/);
    expect(result).not.toMatch(/class='background'/);
  });

  it("keeps marker defs and marker-end", () => {
    const result = stripMermaidSvgBackground(SVG_WITH_MARKERS);
    expect(result).toContain("<marker");
    expect(result).toContain("marker-end");
    expect(result).toContain("url(#flowchart-v2-pointEnd)");
  });

  it("keeps edge label background rects", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g class="edgeLabel"><rect class="background" x="1" y="-12" width="30" height="16"/></g><rect class="background" width="100" height="40"/></svg>`;
    const result = stripMermaidSvgBackground(svg);
    expect(result).toContain('y="-12"');
    expect(result).not.toMatch(/width="100"/);
  });
});

describe("prepareSvgForRaster", () => {
  it("sets numeric width and height from viewBox", () => {
    const result = prepareSvgForRaster(SVG_VIEWBOX_ONLY);
    expect(result).toMatch(/width="240"/);
    expect(result).toMatch(/height="80"/);
  });

  it("replaces percentage width/height with viewBox size", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 25" width="100%" height="100%"><rect/></svg>`;
    const result = prepareSvgForRaster(svg);
    expect(result).toMatch(/width="50"/);
    expect(result).toMatch(/height="25"/);
    expect(result).not.toContain("100%");
  });

  it("converts foreignObject labels to SVG text", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><foreignObject x="0" y="0" width="120" height="40"><div xmlns="http://www.w3.org/1999/xhtml">Puzzle Selection</div></foreignObject></svg>`;
    const result = prepareSvgForRaster(svg);
    expect(result).not.toContain("foreignObject");
    expect(result).toContain("Puzzle Selection");
    expect(result).toMatch(/<text[\s>]/);
  });

  it("preserves mermaid edge-label background position", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><g class="edgeLabel"><rect class="background" x="0" y="-12" width="28" height="16"/><text y="-10.1"><tspan dy="1.1em">Yes</tspan></text></g></svg>`;
    const result = prepareSvgForRaster(svg);
    expect(result).toContain('y="-12"');
    expect(result).toMatch(/<rect[^>]*fill="#ffffff"/);
  });

  it("adds a white rect behind converted edge-label foreignObject", () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 40"><g class="edgeLabel"><foreignObject x="10" y="8" width="40" height="20"><div xmlns="http://www.w3.org/1999/xhtml">Yes</div></foreignObject></g></svg>`;
    const result = prepareSvgForRaster(svg);
    expect(result).toContain("Yes");
    expect(result).toMatch(/<rect[^>]*fill="#ffffff"/);
  });
});
