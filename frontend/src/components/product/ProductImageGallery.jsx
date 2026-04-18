"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { cn } from "@/lib/utils";

const fallbackImage = "/images/products/produce-crate.svg";

export default function ProductImageGallery({ productName, images = [], tint = "#eef6e8" }) {
  const galleryImages = useMemo(() => {
    const resolved = (Array.isArray(images) ? images : [])
      .map((image) => resolveMediaUrl(image))
      .filter(Boolean);

    return resolved.length ? resolved : [fallbackImage];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = galleryImages[activeIndex] ? activeIndex : 0;
  const activeImage = galleryImages[safeActiveIndex] || fallbackImage;
  const bypassActiveImageOptimization = shouldBypassNextImageOptimization(activeImage);

  return (
    <div className="space-y-4">
      <div
        className="relative overflow-hidden rounded-[1.6rem] border border-white/80 p-5 sm:p-7"
        style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.98), ${tint})` }}
      >
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_70%)]" />
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-soft">
          {galleryImages.length} {galleryImages.length === 1 ? "photo" : "photos"}
        </div>
        <div className="relative py-6 sm:py-8">
          <Image
            src={activeImage}
            alt={productName}
            width={560}
            height={560}
            sizes="(min-width: 1024px) 42vw, 92vw"
            className="mx-auto h-auto w-full max-w-[440px] object-contain drop-shadow-[0_28px_36px_rgba(15,23,42,0.14)]"
            priority
            unoptimized={bypassActiveImageOptimization}
          />
        </div>
      </div>

      {galleryImages.length > 1 ? (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5">
          {galleryImages.map((image, index) => {
            const active = index === safeActiveIndex;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative overflow-hidden rounded-[1.1rem] border bg-white p-1.5 transition",
                  active ? "border-[#1195e8] shadow-[0_14px_28px_rgba(17,149,232,0.18)]" : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="relative aspect-square overflow-hidden rounded-[0.9rem] bg-slate-50">
                  <Image
                    src={image}
                    alt={`${productName} view ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 7rem, 22vw"
                    className="object-cover"
                    unoptimized={shouldBypassNextImageOptimization(image)}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
