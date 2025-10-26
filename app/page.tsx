import type { Metadata } from "next";
import Link from "next/link";
import { toolGroups } from "@/src/data/tools";
import type { Group, Tool } from "@/src/types";

// Type assertion to ensure proper typing
const typedToolGroups = toolGroups as Group[];

export const metadata: Metadata = {
  title: "Ethan's Dev Toolbox - Developer Tools Collection",
  description:
    "A collection of useful developer tools for string conversion, URL encoding, JSON formatting, and more.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Dev Toolbox</h1>
          <p className="text-slate-600 mt-2">
            A collection of useful developer tools
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {typedToolGroups.map((group: Group) => (
            <div key={group.id} className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-900">
                {group.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.tools.map((tool: Tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="block p-6 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {tool.name}
                    </h3>
                    <p className="text-slate-600 text-sm">{tool.description}</p>
                    <div className="mt-4 text-blue-600 text-sm font-medium">
                      Use Tool →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
