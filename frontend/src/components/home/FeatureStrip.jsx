"use client";

import { motion } from "framer-motion";
import { Clock3, PackageCheck, ShoppingCart, Sparkles } from "lucide-react";

const iconMap = [Clock3, Sparkles, PackageCheck, ShoppingCart];
const accentMap = [
  "from-sky-50 to-white text-sky-700",
  "from-emerald-50 to-white text-emerald-700",
  "from-amber-50 to-white text-amber-700",
  "from-slate-100 to-white text-slate-700",
];

export default function FeatureStrip({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = iconMap[index] || Sparkles;
        const accent = accentMap[index] || accentMap[0];

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="relative overflow-hidden rounded-[1.3rem] border border-white/80 bg-white p-4 shadow-soft sm:rounded-[1.75rem] sm:p-5"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#1195e8] via-brand to-brand-accent" />
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className={`rounded-[1rem] bg-gradient-to-br p-2.5 sm:rounded-[1.15rem] sm:p-3 ${accent}`}>
                <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-xs sm:tracking-[0.24em]">0{index + 1}</div>
            </div>
            <h3 className="mt-3 text-[1rem] leading-5 sm:mt-4 sm:text-xl">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-7">{item.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
