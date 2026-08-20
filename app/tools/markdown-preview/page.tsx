import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import { MarkdownPreview } from "@/src/components/tools/MarkdownPreview";

const initialContent = fs.readFileSync(
  path.join(process.cwd(), "assets/mock/sample.md"),
  "utf-8",
);

export const metadata: Metadata = {
  title: "Markdown Preview - Ethan's Dev Toolbox",
  description:
    "Live Markdown preview with Mermaid diagrams and GitHub-flavored Markdown support",
};

export default function MarkdownPreviewPage() {
  return <MarkdownPreview initialContent={initialContent} />;
}
