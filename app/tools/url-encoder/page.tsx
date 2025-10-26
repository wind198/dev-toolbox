import type { Metadata } from "next";
import { URLEncoderDecoder } from "@/src/components/tools/URLEncoderDecoder";
import { ToolLayout } from "@/src/components/ToolLayout";

export const metadata: Metadata = {
  title: "URL Encoder/Decoder - Ethan's Dev Toolbox",
  description: "Encode and decode URLs",
};

export default function URLEncoderPage() {
  return (
    <ToolLayout
      title="URL Encoder/Decoder"
      description="Encode and decode URLs"
    >
      <URLEncoderDecoder />
    </ToolLayout>
  );
}
