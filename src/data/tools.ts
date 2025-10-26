import type { Group } from "../types";

export const toolGroups: Group[] = [
  {
    id: "string-converters",
    name: "String Converters",
    tools: [
      {
        id: "case-converter",
        name: "Case Converter",
        description: "Convert text between different cases",
      },
      {
        id: "github-url-converter",
        name: "GitHub URL Converter",
        description: "Convert between GitHub URLs and raw content links",
      },
    ],
  },
  {
    id: "web-utilities",
    name: "Web Utilities",
    tools: [
      {
        id: "url-encoder",
        name: "URL Encoder/Decoder",
        description: "Encode and decode URLs",
      },
      {
        id: "json-formatter",
        name: "JSON Formatter",
        description: "Format and validate JSON",
      },
    ],
  },
];
