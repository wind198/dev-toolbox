"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  value: string;
  className?: string;
  size?: "sm" | "md";
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  className = "",
  size = "sm",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center space-x-1 ${sizeClasses} text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors ${className}`}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className={iconSize} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className={iconSize} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};
