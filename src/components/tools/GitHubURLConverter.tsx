"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty, replace } from "lodash-es";
import { ResultCard } from "./shared/ResultCard";
import { schemas, type GitHubUrlConverterForm } from "./shared/validations";

export const GitHubURLConverter: React.FC = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<GitHubUrlConverterForm>({
    resolver: zodResolver(schemas.githubUrlConverter),
    defaultValues: { input: "" },
  });

  const input = watch("input");

  const { rawUrl, webUrl, showRaw, showWeb, urlType, message } =
    React.useMemo(() => {
      if (isEmpty(input))
        return {
          rawUrl: "",
          webUrl: "",
          showRaw: false,
          showWeb: false,
          urlType: null,
          message: "",
        };

      const convertToRaw = (url: string) =>
        replace(
          replace(url, "github.com", "raw.githubusercontent.com"),
          /\/(blob|tree)\//g,
          "/"
        );

      const convertToWeb = (url: string) =>
        replace(
          replace(url, "raw.githubusercontent.com", "github.com"),
          /github\.com\/([^/]+\/[^/]+)\/([^/]+)\//,
          "github.com/$1/blob/$2/"
        );

      // Detect URL type
      const isWebUrl = input.includes("github.com") && input.includes("/blob/");
      const isRawUrl = input.includes("raw.githubusercontent.com");

      // Only show results that are different from input
      const showRaw = isWebUrl;
      const showWeb = isRawUrl;

      let urlType: "web" | "raw" | "other" | null = null;
      let message = "";

      if (isWebUrl) {
        urlType = "web";
        message = "Web URL detected - showing raw URL conversion";
      } else if (isRawUrl) {
        urlType = "raw";
        message = "Raw URL detected - showing web URL conversion";
      } else {
        urlType = "other";
        message = "Please enter a valid GitHub web URL or raw URL";
      }

      return {
        rawUrl: isWebUrl ? convertToRaw(input) : "",
        webUrl: isRawUrl ? convertToWeb(input) : "",
        showRaw,
        showWeb,
        urlType,
        message,
      };
    }, [input]);

  const hasResults = (showRaw || showWeb) && !isEmpty(input);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          GitHub URL
        </label>
        <input
          {...register("input")}
          placeholder="Paste GitHub URL..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.input && (
          <div className="text-red-600 text-sm mt-2">
            {errors.input.message}
          </div>
        )}
      </div>

      {hasResults && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                urlType === "web" ? "bg-green-500" : "bg-blue-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-slate-700">
              {urlType === "web" ? "Web URL detected" : "Raw URL detected"}
            </span>
          </div>
          {showRaw && <ResultCard title="Raw URL" value={rawUrl} />}
          {showWeb && <ResultCard title="Web URL" value={webUrl} />}
        </div>
      )}

      {!hasResults && !isEmpty(input) && (
        <div
          className={`p-4 rounded-lg ${
            urlType === "other"
              ? "bg-red-50 border border-red-200"
              : "bg-blue-50 border border-blue-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                urlType === "web"
                  ? "bg-green-500"
                  : urlType === "raw"
                  ? "bg-blue-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium text-slate-700">
              {urlType === "web"
                ? "Web URL"
                : urlType === "raw"
                ? "Raw URL"
                : "Invalid URL"}
            </span>
          </div>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      )}
    </div>
  );
};
