"use client";

import React, { useEffect, useId, useState } from "react";
import { ensureMermaidInitialized } from "@/src/lib/mermaid-init";
import { stripMermaidSvgBackground } from "@/src/lib/mermaid-svg";

export interface MermaidDiagramProps {
  source: string;
  className?: string;
}

function MermaidDiagramComponent({ source, className }: MermaidDiagramProps) {
  const baseId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      setError(null);
      setSvg(null);

      if (!source.trim()) {
        setLoading(false);
        return;
      }

      try {
        const mermaid = await ensureMermaidInitialized();
        const id = `mermaid-${baseId}-${Date.now()}`;
        const result = await mermaid.render(id, source.trim());

        if (!cancelled) {
          setSvg(stripMermaidSvgBackground(result.svg));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [source, baseId]);

  if (loading) {
    return (
      <div className={`mermaid-diagram mermaid-diagram--loading ${className ?? ""}`}>
        <span className="text-sm text-slate-500">Rendering diagram…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mermaid-diagram mermaid-diagram--error ${className ?? ""}`}>
        <p className="text-sm text-slate-600">Unable to render Mermaid diagram</p>
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-red-500 mt-1 font-mono">{error.message}</p>
        )}
      </div>
    );
  }

  if (!svg) return null;

  return (
    <div
      className={`mermaid-diagram ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export const MermaidDiagram = React.memo(MermaidDiagramComponent);
