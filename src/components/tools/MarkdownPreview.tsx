"use client";

import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Download, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/src/components/markdown/MarkdownRenderer";
import { writeSelectionHtmlToClipboard } from "@/src/lib/clipboard-html";
import {
  buildStandaloneMarkdownHtml,
  downloadTextFile,
  waitForPendingDiagrams,
} from "@/src/lib/export-markdown-html";
import type { ImperativePanelHandle } from "react-resizable-panels";

interface MarkdownPreviewProps {
  initialContent: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  initialContent,
}) => {
  const [content, setContent] = useState(initialContent);
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [parsing, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [inputVisible, setInputVisible] = useState(true);
  const inputPanelRef = useRef<ImperativePanelHandle>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onCopy = (event: ClipboardEvent) => {
      writeSelectionHtmlToClipboard(event, previewRef.current);
    };
    document.addEventListener("copy", onCopy);
    return () => document.removeEventListener("copy", onCopy);
  }, []);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value;
      setContent(next);
      startTransition(() => {
        setPreviewContent(next);
      });
    },
    [],
  );

  const saveRenderedHtml = useCallback(async () => {
    const root = previewRef.current;
    if (!root || saving) return;

    setSaving(true);
    try {
      await waitForPendingDiagrams(root);
      const html = await buildStandaloneMarkdownHtml(root);
      const heading = root.querySelector("h1")?.textContent?.trim();
      const slug = (heading || "markdown-preview")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
      downloadTextFile(`${slug || "markdown-preview"}.html`, html);
    } finally {
      setSaving(false);
    }
  }, [saving]);

  const toggleInput = useCallback(() => {
    const panel = inputPanelRef.current;
    if (!panel) return;

    if (inputVisible) {
      panel.collapse();
    } else {
      panel.expand();
    }
    setInputVisible((prev) => !prev);
  }, [inputVisible]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="shrink-0 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
            >
              <ArrowLeft className="size-4" />
              Back to Tools
            </Link>
            <div className="w-px h-5 bg-slate-300" />
            <h1 className="text-lg font-semibold text-slate-900">
              Markdown Preview
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleInput}
            aria-label={inputVisible ? "Hide input panel" : "Show input panel"}
          >
            {inputVisible ? (
              <>
                <PanelLeftClose className="size-4" />
                Hide Input
              </>
            ) : (
              <>
                <PanelLeftOpen className="size-4" />
                Show Input
              </>
            )}
          </Button>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        <ResizablePanel
          ref={inputPanelRef}
          defaultSize={40}
          minSize={20}
          collapsible
          collapsedSize={0}
          className="min-w-0"
        >
          <div className="h-full flex flex-col border-r border-slate-200 bg-white">
            <div className="shrink-0 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wide">
              Markdown Input
            </div>
            <textarea
              value={content}
              onChange={handleContentChange}
              className="flex-1 w-full resize-none p-4 font-mono text-sm text-slate-900 bg-white focus:outline-none"
              placeholder="Enter Markdown here..."
              spellCheck={false}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={30} className="min-w-0">
          <div className="h-full flex flex-col bg-white">
            <div className="shrink-0 px-4 py-2 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center justify-between gap-2">
              <span>Preview</span>
              <div className="flex items-center gap-2">
                {parsing && (
                  <span className="normal-case tracking-normal font-normal text-slate-400">
                    Updating…
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="normal-case tracking-normal"
                  onClick={saveRenderedHtml}
                  disabled={saving}
                  aria-label="Save rendered preview as HTML"
                >
                  <Download className="size-4" />
                  {saving ? "Saving…" : "Save HTML"}
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 h-full">
              <div
                ref={previewRef}
                tabIndex={-1}
                className={`p-6 outline-none ${parsing ? "opacity-60" : ""}`}
              >
                <MarkdownRenderer content={previewContent} />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
