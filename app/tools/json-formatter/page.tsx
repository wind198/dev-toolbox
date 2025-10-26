import type { Metadata } from "next";
import { JSONFormatter } from "@/src/components/tools/JSONFormatter";
import { ToolLayout } from "@/src/components/ToolLayout";

export const metadata: Metadata = {
  title: "JSON Formatter - Ethan's Dev Toolbox",
  description: "Format and validate JSON",
};

export default function JSONFormatterPage() {
  return (
    <ToolLayout title="JSON Formatter" description="Format and validate JSON">
      <JSONFormatter />
    </ToolLayout>
  );
}
