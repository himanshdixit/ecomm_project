"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AppErrorState({
  title = "Something went wrong",
  description = "We hit an unexpected issue while loading this experience. Please try again.",
  reset,
  homeHref = "/",
}) {
  return (
    <div className="surface-card rounded-[2rem] p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mb-3 text-2xl text-brand-dark">{title}</h2>
      <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {typeof reset === "function" ? (
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-dark px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
        ) : null}
        <Link
          href={homeHref}
          className="inline-flex items-center justify-center rounded-pill border border-brand/10 bg-white px-5 py-3 font-semibold text-brand-dark shadow-soft transition hover:-translate-y-0.5"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
