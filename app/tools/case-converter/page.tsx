import type { Metadata } from "next";
import { CaseConverter } from "@/src/components/tools/CaseConverter";
import { ToolLayout } from "@/src/components/ToolLayout";

export const metadata: Metadata = {
  title: "Case Converter - Ethan's Dev Toolbox",
  description:
    "Convert text between different cases (camelCase, PascalCase, snake_case, kebab-case)",
};

export default function CaseConverterPage() {
  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between different cases"
    >
      <CaseConverter />
    </ToolLayout>
  );
}
