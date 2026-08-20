"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { isAllowedUrl } from "@/src/lib/url-utils";
import { MermaidDiagram } from "./MermaidDiagram";
import { MarkdownImage } from "./MarkdownImage";
import "./markdown.css";

export interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function extractTextContent(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextContent).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return extractTextContent(children.props.children);
  }
  return "";
}

const components: Components = {
  img: ({ src, alt, title }) => (
    <MarkdownImage
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      title={title}
    />
  ),
  a: ({ href, children }) => {
    if (!href || !isAllowedUrl(href)) {
      return <span>{children}</span>;
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  code: ({ className, children, node, ...props }) => {
    const match = /language-mermaid/.exec(className ?? "");
    if (match) {
      return (
        <MermaidDiagram source={extractTextContent(children).replace(/\n$/, "")} />
      );
    }

    const inline = node?.position?.start.line === node?.position?.end.line;
    if (inline) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const childList = React.Children.toArray(children);
    const isMermaid = childList.some((child) => {
      if (!React.isValidElement(child)) return false;
      if (child.type === MermaidDiagram) return true;
      const childProps = child.props as { className?: string };
      return childProps.className?.includes("language-mermaid") ?? false;
    });

    if (isMermaid) {
      return <>{children}</>;
    }

    return <pre>{children}</pre>;
  },
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  return (
    <div className={`markdown-body ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
