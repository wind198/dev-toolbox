import React from "react";
import { CopyButton } from "./CopyButton";

interface ResultCardProps {
  title: string;
  value: string;
  className?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  className = "p-4 bg-slate-100 rounded-lg",
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-600">{title}</div>
        {typeof window !== "undefined" && <CopyButton value={value} />}
      </div>
      <div className="text-sm font-mono text-slate-900 break-all">{value}</div>
    </div>
  );
};
