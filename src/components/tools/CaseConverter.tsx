"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  camelCase,
  upperFirst,
  kebabCase,
  snakeCase,
  isEmpty,
  trim,
} from "lodash-es";
import { ResultCard } from "./shared/ResultCard";
import { schemas, type CaseConverterForm } from "./shared/validations";

export const CaseConverter: React.FC = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<CaseConverterForm>({
    resolver: zodResolver(schemas.caseConverter),
    defaultValues: { input: "" },
  });

  const input = watch("input");

  const conversions = React.useMemo(() => {
    if (isEmpty(trim(input))) return {};

    return {
      camelCase: camelCase(input),
      PascalCase: upperFirst(camelCase(input)),
      snake_case: snakeCase(input),
      "kebab-case": kebabCase(input),
    };
  }, [input]);

  const conversionEntries = Object.entries(conversions);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Input Text
        </label>
        <textarea
          {...register("input")}
          placeholder="Enter text to convert..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        {errors.input && (
          <div className="text-red-600 text-sm mt-2">
            {errors.input.message}
          </div>
        )}
        <div className="text-xs text-slate-500 mt-1">
          {input.length}/1000 characters
        </div>
      </div>

      {conversionEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {conversionEntries.map(([format, result]) => (
            <ResultCard key={format} title={format} value={result} />
          ))}
        </div>
      )}
    </div>
  );
};
