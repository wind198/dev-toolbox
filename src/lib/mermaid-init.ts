let initialized = false;

export async function ensureMermaidInitialized(): Promise<
  typeof import("mermaid").default
> {
  const mermaid = (await import("mermaid")).default;

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: {
        background: "transparent",
      },
    });
    initialized = true;
  }

  return mermaid;
}
