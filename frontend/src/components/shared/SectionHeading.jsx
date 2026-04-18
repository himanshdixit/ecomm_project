import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({ eyebrow, title, description, actionLabel, actionHref = "/products" }) {
  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-600 sm:text-xs sm:tracking-[0.26em]">{eyebrow}</div> : null}
        <h2 className="max-w-[18ch] text-[1.7rem] leading-[1.05] sm:text-[2.35rem]">{title}</h2>
        {description ? <p className="max-w-[62ch] text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{description}</p> : null}
      </div>
      {actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex w-fit items-center gap-2 rounded-pill border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-dark shadow-soft transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
