import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownRenderer } from "@/src/components/markdown/MarkdownRenderer";

const { mockRender, mockSvgToPng } = vi.hoisted(() => ({
  mockRender: vi.fn(),
  mockSvgToPng: vi.fn(),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: mockRender,
  },
}));

vi.mock("@/src/lib/mermaid-init", () => ({
  ensureMermaidInitialized: vi.fn().mockResolvedValue({
    initialize: vi.fn(),
    render: mockRender,
  }),
}));

vi.mock("@/src/lib/mermaid-svg", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/src/lib/mermaid-svg")>();
  return {
    ...actual,
    svgToPngDataUrl: mockSvgToPng,
  };
});

describe("MarkdownRenderer", () => {
  beforeEach(() => {
    mockRender.mockReset();
    mockRender.mockResolvedValue({ svg: "<svg data-testid='mermaid-svg'></svg>" });
    mockSvgToPng.mockReset();
    mockSvgToPng.mockResolvedValue("data:image/png;base64,AAAA");
  });

  it("renders headings and paragraphs", () => {
    render(
      <MarkdownRenderer content={"# Hello World\n\nThis is a paragraph."} />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Hello World",
    );
    expect(screen.getByText("This is a paragraph.")).toBeInTheDocument();
  });

  it("renders GFM tables", () => {
    render(
      <MarkdownRenderer
        content={"| Col A | Col B |\n| ----- | ----- |\n| a | b |"}
      />,
    );
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Col A")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("renders mermaid blocks via MermaidDiagram", async () => {
    render(
      <MarkdownRenderer
        content={"```mermaid\nflowchart LR\n    A --> B\n```"}
      />,
    );

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });

    expect(mockRender.mock.calls[0][1]).toContain("flowchart LR");
    expect(document.querySelector("pre .mermaid-diagram")).not.toBeInTheDocument();
    expect(document.querySelector(".mermaid-diagram")).toBeInTheDocument();
    expect(await screen.findByRole("img", { name: "Mermaid diagram" })).toHaveAttribute(
      "src",
      "data:image/png;base64,AAAA",
    );
  });

  it("renders normal fenced code as pre/code, not Mermaid", () => {
    render(
      <MarkdownRenderer
        content={"```typescript\nconst x = 1;\n```"}
      />,
    );

    const pre = document.querySelector("pre");
    expect(pre).toBeInTheDocument();
    expect(pre?.querySelector("code")).toHaveTextContent("const x = 1;");
    expect(mockRender).not.toHaveBeenCalled();
  });

  it("renders multiple mermaid blocks", async () => {
    render(
      <MarkdownRenderer
        content={
          "```mermaid\nflowchart LR\n    A --> B\n```\n\n```mermaid\nflowchart TD\n    C --> D\n```"
        }
      />,
    );

    await waitFor(() => {
      expect(document.querySelectorAll(".mermaid-diagram").length).toBe(2);
    });

    expect(mockRender.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("shows mermaid fullscreen overlay on hover button click and closes on Escape", async () => {
    const user = userEvent.setup();

    render(
      <MarkdownRenderer
        content={"```mermaid\nflowchart LR\n    A --> B\n```"}
      />,
    );

    const expand = await screen.findByRole("button", { name: "View fullscreen" });
    const diagram = document.querySelector(".mermaid-diagram");
    expect(diagram).toBeTruthy();

    await user.hover(diagram!);
    expect(expand).toBeVisible();

    await user.click(expand);

    const overlay = screen.getByRole("dialog", { name: "Fullscreen diagram" });
    expect(overlay).toHaveClass("bg-white");
    expect(screen.queryByRole("button", { name: "View fullscreen" })).not.toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Fullscreen diagram" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View fullscreen" })).toBeInTheDocument();
  });

  it("shows fallback for invalid mermaid without crashing", async () => {
    mockRender.mockRejectedValue(new Error("Syntax error in graph"));

    render(
      <MarkdownRenderer
        content={"```mermaid\ninvalid diagram syntax\n```"}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Unable to render Mermaid diagram"),
      ).toBeInTheDocument();
    });
  });

  it("renders remote https images", () => {
    render(
      <MarkdownRenderer
        content={"![Puzzle](https://example.com/puzzle.png)"}
      />,
    );

    const img = screen.getByRole("img", { name: "Puzzle" });
    expect(img).toHaveAttribute("src", "https://example.com/puzzle.png");
  });

  it("blocks unsafe image URLs", () => {
    render(
      <MarkdownRenderer
        content={"![Bad](javascript:alert(1))"}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(
      screen.getByText("[Image blocked: invalid or unsafe URL]"),
    ).toBeInTheDocument();
  });

  it("blocks unsafe link URLs", () => {
    render(
      <MarkdownRenderer content={"[Click me](javascript:alert(1))"} />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
