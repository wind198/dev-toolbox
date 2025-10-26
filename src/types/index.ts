export type ToolId =
  | "case-converter"
  | "github-url-converter"
  | "url-encoder"
  | "json-formatter";

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
}

export interface SubCategory {
  id: string;
  name: string;
  tools: Tool[];
}

export interface Category {
  id: string;
  name: string;
  subCategories?: SubCategory[];
  tools?: Tool[];
}

export interface Group {
  id: string;
  name: string;
  tools: Tool[];
}

export interface ToolContextType {
  selectedTool: ToolId | null;
  setSelectedTool: (toolId: ToolId) => void;
}
