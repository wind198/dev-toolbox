import type { Metadata } from "next";
import { GitHubURLConverter } from "@/src/components/tools/GitHubURLConverter";
import { ToolLayout } from "@/src/components/ToolLayout";

export const metadata: Metadata = {
  title: "GitHub URL Converter - Ethan's Dev Toolbox",
  description: "Convert between GitHub URLs and raw content links",
};

export default function GitHubURLConverterPage() {
  return (
    <ToolLayout
      title="GitHub URL Converter"
      description="Convert between GitHub URLs and raw content links"
    >
      <GitHubURLConverter />
    </ToolLayout>
  );
}
