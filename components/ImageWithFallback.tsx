"use client";

import { useState } from "react";
import NextImage from "next/image";

/**
 * Sharp-by-default product/update image.
 *
 * Sharpness rules enforced here:
 *  1. Every usage passes a correct `sizes` attribute so the browser picks the
 *     right srcset entry (no over-fetching, no under-fetching).
 *  2. NEVER upscale a small source beyond its native resolution: containers
 *     that use this component cap their rendered display size sensibly, and
 *     we always use object-cover (crop) — never object-fill (stretch).
 *  3. Compression stays sane: Next.js default quality (75) — we never lower
 *     `quality` aggressively.
 *  4. On load error (or missing src) we render a clean inline SVG placeholder
 *     instead of a broken image icon.
 */
interface ImageWithFallbackProps {
  src?: string | null;
  alt: string;
  /** REQUIRED: correct sizes string for the rendered context. */
  sizes: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

const PLACEHOLDER_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <rect width="800" height="800" fill="#F5E9E2"/>
      <g fill="none" stroke="#C6A46A" stroke-width="10" opacity="0.85">
        <circle cx="400" cy="330" r="90"/>
        <path d="M270 560 L400 450 L530 560"/>
      </g>
      <text x="400" y="640" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#382724" opacity="0.65">Mun's Haven</text>
    </svg>`
  );

export default function ImageWithFallback({
  src,
  alt,
  sizes,
  fill = false,
  width,
  height,
  className,
  priority = false,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = failed || !src;

  if (showPlaceholder) {
    // Intentional plain <img>: the placeholder is an inline data-URI SVG —
    // next/image optimization provides no benefit for it.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={PLACEHOLDER_SVG}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={fill ? { width: "100%", height: "100%", objectFit: "cover" } : undefined}
        aria-label={alt}
      />
    );
  }

  if (fill) {
    return (
      <NextImage
        src={src as string}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
        priority={priority}
      />
    );
  }

  return (
    <NextImage
      src={src as string}
      alt={alt}
      width={width!}
      height={height!}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
      priority={priority}
    />
  );
}
