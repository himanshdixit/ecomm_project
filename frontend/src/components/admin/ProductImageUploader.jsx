"use client";

import Image from "next/image";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";

import {
  adminGhostButtonClass,
  adminSecondaryButtonClass,
} from "@/components/admin/adminStyles";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { cn } from "@/lib/utils";

const getPreviewSource = (item) => (item?.kind === "existing" ? resolveMediaUrl(item.src) : item?.src || "");

export default function ProductImageUploader({
  items = [],
  maxImages = 6,
  error,
  helperText,
  onFilesSelected,
  onMakePrimary,
  onRemove,
}) {
  const remainingSlots = Math.max(maxImages - items.length, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 shadow-soft">
              <Upload className="h-3.5 w-3.5 text-emerald-600" />
              Product gallery
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-950">Upload up to {maxImages} product photos</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                JPG, PNG, WEBP, or AVIF. The first image is used as the main storefront cover and product detail hero.
              </p>
            </div>
          </div>

          <label className={cn(adminSecondaryButtonClass, "cursor-pointer")}>
            <ImagePlus className="h-4 w-4" />
            Add photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files || []);

                if (files.length) {
                  onFilesSelected(files);
                }

                event.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 font-semibold text-slate-600 shadow-soft">{items.length}/{maxImages} selected</span>
          <span>{remainingSlots > 0 ? `${remainingSlots} more can be added.` : "Image limit reached."}</span>
        </div>

        {helperText ? <p className="mt-3 text-sm text-slate-500">{helperText}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-rose-600">{error}</p> : null}
      </div>

      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const previewSource = getPreviewSource(item);
            const isPrimary = index === 0;

            return (
              <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white shadow-[0_10px_20px_rgba(15,23,42,0.05)]">
                <div className="relative aspect-[1.05/1] bg-slate-100">
                  {previewSource ? (
                    <Image
                      src={previewSource}
                      alt={item.name || `Product image ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={shouldBypassNextImageOptimization(previewSource)}
                    />
                  ) : null}
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                      {isPrimary ? "Primary" : `Image ${index + 1}`}
                    </span>
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {item.kind === "new" ? "New upload" : "Saved"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-3.5">
                  <div>
                    <div className="line-clamp-1 text-sm font-semibold text-slate-900">{item.name || `Product image ${index + 1}`}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.kind === "new" ? "Will upload on save" : "Already linked to this product"}</div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => onMakePrimary(item.id)}
                      disabled={isPrimary}
                      className={cn(adminGhostButtonClass, "px-3 py-2 text-xs", isPrimary ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700" : "")}
                    >
                      <Star className={cn("h-3.5 w-3.5", isPrimary ? "fill-current" : "")} />
                      {isPrimary ? "Cover image" : "Make cover"}
                    </button>
                    <button type="button" onClick={() => onRemove(item.id)} className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
