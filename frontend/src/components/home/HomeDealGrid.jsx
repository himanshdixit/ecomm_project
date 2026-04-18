import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeDealGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="group relative overflow-hidden rounded-[1.35rem] border border-sky-100/80 p-4 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card sm:rounded-[1.75rem] sm:p-5"
          style={{ background: item.tint }}
        >
          <div className="space-y-2 sm:space-y-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700/80 sm:text-xs sm:tracking-[0.22em]">{item.eyebrow}</div>
            <div>
              <h3 className="text-[1.15rem] leading-5 text-brand-dark sm:text-2xl">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{item.description}</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 transition group-hover:translate-x-1 sm:text-sm">
              Shop now
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
