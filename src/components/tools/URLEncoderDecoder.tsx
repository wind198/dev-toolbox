"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty, trim } from "lodash-es";
import { ResultCard } from "./shared/ResultCard";
import { schemas, type UrlEncoderForm } from "./shared/validations";

export const URLEncoderDecoder: React.FC = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<UrlEncoderForm>({
    resolver: zodResolver(schemas.urlEncoder),
    defaultValues: { input: "" },
  });

  const input = watch("input");

  const { encoded, decoded } = React.useMemo(() => {
    if (isEmpty(trim(input))) return { encoded: "", decoded: "" };

    try {
      return {
        encoded: encodeURIComponent(input),
        decoded: decodeURIComponent(input),
      };
    } catch {
      return { encoded: "Error encoding", decoded: "Error decoding" };
    }
  }, [input]);

  const hasResults = !isEmpty(trim(input));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Input
        </label>
        <textarea
          {...register("input")}
          placeholder="Enter text to encode/decode..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        {errors.input && (
          <div className="text-red-600 text-sm mt-2">
            {errors.input.message}
          </div>
        )}
        <div className="text-xs text-slate-500 mt-1">
          {input.length}/2000 characters
        </div>
      </div>

      {hasResults && (
        <div className="grid grid-cols-2 gap-4">
          <ResultCard title="Encoded" value={encoded} />
          <ResultCard title="Decoded" value={decoded} />
        </div>
      )}
    </div>
  );
};
