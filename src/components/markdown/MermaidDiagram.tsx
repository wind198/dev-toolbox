"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import { ensureMermaidInitialized } from "@/src/lib/mermaid-init";
import { stripMermaidSvgBackground, svgToPngDataUrl } from "@/src/lib/mermaid-svg";

export interface MermaidDiagramProps {
  source: string;
  className?: string;
}

function MermaidDiagramComponent({ source, className }: MermaidDiagramProps) {
  const baseId = useId().replace(/:/g, "");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [minHeight, setMinHeight] = useState<number>();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setLoading(true);
      setError(null);
      setPngUrl(null);
      setFullscreen(false);

      if (!source.trim()) {
        setLoading(false);
        return;
      }

      try {
        const mermaid = await ensureMermaidInitialized();
        const id = `mermaid-${baseId}-${Date.now()}`;
        const result = await mermaid.render(id, source.trim());
        const png = await svgToPngDataUrl(stripMermaidSvgBackground(result.svg));

        if (cancelled) return;

        setPngUrl(png);
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

  const closeFullscreen = useCallback(() => setFullscreen(false), []);

  const openFullscreen = () => {
    setMinHeight(wrapperRef.current?.offsetHeight);
    setFullscreen(true);
  };

  useEffect(() => {
    if (!fullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeFullscreen();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [fullscreen, closeFullscreen]);

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

  if (!pngUrl) return null;

  return (
    <div
      ref={wrapperRef}
      className={`mermaid-diagram relative group ${fullscreen ? "mermaid-diagram--open" : ""} ${className ?? ""}`}
      style={fullscreen ? { minHeight } : undefined}
    >
      {!fullscreen && (
        <button
          type="button"
          onClick={openFullscreen}
          className="absolute top-2 right-2 z-10 rounded-md bg-slate-900 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-slate-800 transition-opacity"
          aria-label="View fullscreen"
          title="View fullscreen"
        >
          <Maximize2 className="size-4" />
        </button>
      )}
      <div
        className={
          fullscreen
            ? "mermaid-diagram--fullscreen fixed inset-0 z-50 flex items-center justify-center bg-white"
            : undefined
        }
        onClick={fullscreen ? closeFullscreen : undefined}
        role={fullscreen ? "dialog" : undefined}
        aria-modal={fullscreen || undefined}
        aria-label={fullscreen ? "Fullscreen diagram" : undefined}
      >
        {fullscreen && (
          <button
            type="button"
            onClick={closeFullscreen}
            className="absolute top-4 right-4 rounded-md p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close fullscreen diagram"
          >
            <X className="size-6" />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pngUrl}
          alt="Mermaid diagram"
          draggable={false}
          onClick={fullscreen ? (e) => e.stopPropagation() : undefined}
        />
      </div>
    </div>
  );
}

export const MermaidDiagram = React.memo(MermaidDiagramComponent);
