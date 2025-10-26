"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty, trim } from "lodash-es";
import { CopyButton } from "./shared/CopyButton";
import { schemas, type JsonFormatterForm } from "./shared/validations";

export const JSONFormatter: React.FC = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<JsonFormatterForm>({
    resolver: zodResolver(schemas.jsonFormatter),
    defaultValues: { input: "" },
  });

  const input = watch("input");

  const { formatted, error } = React.useMemo(() => {
    if (isEmpty(trim(input))) return { formatted: "", error: "" };

    try {
      return {
        formatted: JSON.stringify(JSON.parse(input), null, 2),
        error: "",
      };
    } catch {
      return { formatted: "", error: "Invalid JSON" };
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          JSON Input
        </label>
        <textarea
          {...register("input")}
          placeholder="Paste JSON here..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          rows={6}
        />
        {errors.input && (
          <div className="text-red-600 text-sm mt-2">
            {errors.input.message}
          </div>
        )}
        <div className="text-xs text-slate-500 mt-1">
          {input.length}/10000 characters
        </div>
      </div>

      {formatted && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Formatted Output
            </label>
            {typeof window !== "undefined" && <CopyButton value={formatted} />}
          </div>
          <div className="p-4 bg-slate-100 rounded-lg">
            <pre className="text-sm font-mono text-slate-900 overflow-x-auto">
              {formatted}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
