# Dev Toolbox


A personal collection of browser-based developer utilities. Built with Next.js and exported as a static site — no backend required.

## Tools

### String Converters

| Tool | Description |
|------|-------------|
| [Case Converter](/tools/case-converter) | Convert text to camelCase, PascalCase, snake_case, and kebab-case |
| [GitHub URL Converter](/tools/github-url-converter) | Swap between GitHub web URLs (`github.com/.../blob/...`) and raw content URLs (`raw.githubusercontent.com/...`) |

### Web Utilities

| Tool | Description |
|------|-------------|
| [URL Encoder/Decoder](/tools/url-encoder) | Encode and decode URL components with `encodeURIComponent` / `decodeURIComponent` |
| [JSON Formatter](/tools/json-formatter) | Parse, validate, and pretty-print JSON |

### Document Tools

| Tool | Description |
|------|-------------|
| [Markdown Preview](/tools/markdown-preview) | Live GitHub-flavored Markdown preview with Mermaid diagrams (hover a diagram for fullscreen on a white background) |

All tools support live conversion as you type and one-click copy for results.

## Tech Stack

- **Framework:** Next.js 16 (App Router, static export)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui
- **Forms:** react-hook-form + Zod validation
- **Markdown:** react-markdown, remark-gfm, mermaid
- **Utilities:** lodash-es

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build static site to `out/` |
| `pnpm start` | Serve production build |
| `pnpm lint` | Run ESLint |
| `pnpm type-check` | Run TypeScript checks |
| `pnpm test` | Run Vitest in watch mode |
| `pnpm test:run` | Run Vitest once |

## Project Structure

```
app/                          # Next.js App Router
├── page.tsx                  # Home — lists all tools by group
├── layout.tsx                # Root layout
└── tools/
    └── <tool-id>/page.tsx    # Individual tool pages

src/
├── components/
│   ├── ToolLayout.tsx        # Shared layout for tool pages
│   ├── markdown/             # MarkdownRenderer, MermaidDiagram, image lightbox
│   └── tools/
│       ├── <ToolName>.tsx    # Tool implementations
│       └── shared/           # ResultCard, CopyButton, validations
├── data/tools.ts             # Tool registry (groups + metadata)
├── lib/                      # mermaid init, SVG helpers, URL sanitization
└── types/index.ts            # ToolId, Tool, Group types

components/ui/                # shadcn/ui components
assets/mock/sample.md         # Default Markdown Preview content
```

## Adding a New Tool

1. **Register the tool** in `src/data/tools.ts` — add an entry with `id`, `name`, and `description` to the appropriate group.

2. **Extend the type** in `src/types/index.ts` — add the new `id` to the `ToolId` union.

3. **Create the component** in `src/components/tools/<ToolName>.tsx`. Use `ResultCard` and `CopyButton` from `shared/` for consistent output UI. Add a Zod schema in `shared/validations.ts` if the tool has form input.

4. **Add the page** at `app/tools/<tool-id>/page.tsx`:

   ```tsx
   import type { Metadata } from "next";
   import { MyTool } from "@/src/components/tools/MyTool";
   import { ToolLayout } from "@/src/components/ToolLayout";

   export const metadata: Metadata = {
     title: "My Tool - Dev Toolbox",
     description: "What this tool does",
   };

   export default function MyToolPage() {
     return (
       <ToolLayout title="My Tool" description="What this tool does">
         <MyTool />
       </ToolLayout>
     );
   }
   ```

The home page reads from `src/data/tools.ts` automatically — no other wiring needed.

## Deployment

The project is configured for static export (`output: "export"` in `next.config.mjs`). Run `pnpm build` and deploy the `out/` directory to any static host (Vercel, GitHub Pages, etc.).
