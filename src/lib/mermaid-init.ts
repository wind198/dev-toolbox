let initialized = false;

export async function ensureMermaidInitialized(): Promise<
  typeof import("mermaid").default
> {
  const mermaid = (await import("mermaid")).default;

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      htmlLabels: false,
      fontFamily: "Arial, Helvetica, sans-serif",
      theme: "base",
      themeVariables: {
        lineColor: "#334155",
        primaryTextColor: "#0f172a",
        fontFamily: "Arial, Helvetica, sans-serif",
        edgeLabelBackground: "#ffffff",
      },
      flowchart: {
        htmlLabels: false,
        useMaxWidth: false,
      },
      sequence: {
        useMaxWidth: false,
      },
    });
    initialized = true;
  }

  return mermaid;
}
