"use client";

import { Children, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export default function ScrollRail({
  children,
  ariaLabel = "scroll rail",
  className,
  viewportClassName,
  itemClassName,
  controlsClassName,
}) {
  const railRef = useRef(null);

  const handleScroll = (direction) => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: rail.clientWidth * 0.86 * direction,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("space-y-3 sm:space-y-4", className)}>
      <div className={cn("hidden items-center justify-end gap-2 sm:flex", controlsClassName)}>
        <button
          type="button"
          onClick={() => handleScroll(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:-translate-y-0.5 hover:text-brand-dark"
          aria-label={`Scroll ${ariaLabel} left`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => handleScroll(1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-soft transition hover:-translate-y-0.5 hover:text-brand-dark"
          aria-label={`Scroll ${ariaLabel} right`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={railRef}
        aria-label={ariaLabel}
        className={cn(
          "grid snap-x snap-mandatory grid-flow-col gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-4",
          viewportClassName
        )}
      >
        {Children.map(children, (child, index) =>
          child ? (
            <div key={index} className={cn("snap-start", itemClassName)}>
              {child}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
