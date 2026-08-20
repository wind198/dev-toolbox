"use client";

import React, { useState } from "react";
import { Maximize2 } from "lucide-react";
import { isAllowedUrl } from "@/src/lib/url-utils";
import { ImageLightbox } from "./ImageLightbox";

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

export const MarkdownImage: React.FC<MarkdownImageProps> = ({
  src,
  alt = "",
  title,
}) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [errored, setErrored] = useState(false);

  if (!src || !isAllowedUrl(src)) {
    return (
      <span className="text-sm text-slate-500 italic">
        [Image blocked: invalid or unsafe URL]
      </span>
    );
  }

  if (errored) {
    return (
      <span className="text-sm text-slate-500 italic">
        [Image failed to load]
      </span>
    );
  }

  return (
    <>
      <span className="markdown-image-wrapper inline-block relative group max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          title={title}
          loading="lazy"
          className="max-w-full h-auto rounded-md"
          onError={() => setErrored(true)}
        />
        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute top-2 right-2 rounded-md bg-black/60 p-1.5 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity"
          aria-label="View fullscreen"
          title="View fullscreen"
        >
          <Maximize2 className="size-4" />
        </button>
      </span>
      {fullscreen && (
        <ImageLightbox
          src={src}
          alt={alt}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
};
