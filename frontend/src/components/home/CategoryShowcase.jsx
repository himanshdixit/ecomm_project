"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import ScrollRail from "@/components/shared/ScrollRail";
import { getCategoryTheme } from "@/lib/storefront-theme";

export default function CategoryShowcase({ items }) {
  return (
    <ScrollRail
      ariaLabel="categories"
      viewportClassName="auto-cols-[calc(50%-0.375rem)] sm:auto-cols-[200px] lg:auto-cols-[214px] xl:auto-cols-[206px]"
    >
      {items.map((item, index) => {
        const theme = getCategoryTheme(item);

        return (
          <motion.div
            key={item.slug}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
            className="h-full"
          >
            <Link
              href={`/categories/${item.slug}`}
              className="group flex h-full flex-col rounded-[1.25rem] border border-white/80 bg-white p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card sm:rounded-[1.65rem] sm:p-4"
            >
              <div
                className="mb-3 flex h-[92px] items-center justify-center rounded-[1.1rem] border border-white/80 sm:mb-4 sm:h-[112px] sm:rounded-[1.5rem]"
                style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.92), ${theme.tint})` }}
              >
                <Image
                  src={theme.image}
                  alt={item.name}
                  width={112}
                  height={112}
                  sizes="(min-width: 1280px) 12vw, (min-width: 640px) 18vw, 42vw"
                  className="h-[60px] w-auto transition duration-300 group-hover:scale-105 sm:h-[74px]"
                />
              </div>
              <div className="flex flex-1 items-start justify-between gap-2.5 text-left sm:gap-3">
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">{theme.badge}</div>
                  <h3 className="text-[0.95rem] leading-5 sm:text-lg sm:leading-6">{item.shortName || item.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:text-xs"><span>{item.itemCount}+ items</span>{item.childrenCount ? <span className="rounded-pill bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{item.childrenCount} aisles</span> : null}</div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600" />
              </div>
            </Link>
          </motion.div>
        );
      })}
    </ScrollRail>
  );
}

