"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock3, PackageCheck, Sparkles } from "lucide-react";

export default function BannerCarousel({ slides, categories = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides?.length) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  if (!slides?.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const previewCategories = categories.slice(0, 3);
  const heroPoints = [
    { icon: Clock3, label: "10 minute slots" },
    { icon: Sparkles, label: "Premium quality" },
    { icon: PackageCheck, label: "Fresh packed daily" },
  ];

  return (
    <div className="retail-panel relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative grid gap-5 px-4 py-4 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr,0.95fr] lg:gap-12 lg:px-10 lg:py-10"
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at top left, rgba(255,255,255,0.97), ${activeSlide.accent} 48%, rgba(255,255,255,0.9) 100%)`,
            }}
          />
          <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-white/55 blur-3xl" />
          <div className="absolute right-4 top-6 h-40 w-40 rounded-full bg-white/35 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-center gap-4 sm:gap-5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="rounded-pill bg-brand-dark px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-xs sm:tracking-[0.2em]">Limited time</span>
              <span className="pill-chip border-white/60 bg-white/80">{activeSlide.badge}</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 sm:text-sm sm:tracking-[0.22em]">{activeSlide.eyebrow}</div>
              <h1 className="max-w-[12ch] text-[2.1rem] leading-[0.98] sm:max-w-xl sm:text-[3.4rem] lg:text-[4rem]">{activeSlide.title}</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{activeSlide.description}</p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link href="/products" className="button-primary w-full justify-center sm:w-auto sm:px-5 sm:py-3 text-sm">
                {activeSlide.cta}
              </Link>
              <Link href="/products?featured=true" className="button-secondary w-full justify-center sm:w-auto sm:px-5 sm:py-3 text-sm">
                {activeSlide.secondaryCta}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {heroPoints.map((point, index) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.label}
                    className={`rounded-[1.1rem] border border-white/75 bg-white/78 px-3 py-2.5 shadow-soft backdrop-blur sm:rounded-[1.3rem] sm:px-4 sm:py-3 ${index === 2 ? "hidden sm:block" : "block"}`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark">
                      <Icon className="h-4 w-4 text-[#1195e8]" />
                      {point.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {previewCategories.length ? (
              <div className="flex flex-wrap gap-2">
                {previewCategories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="rounded-pill border border-white/80 bg-white/75 px-3 py-2 text-xs font-medium text-slate-600 shadow-soft transition hover:bg-white hover:text-brand-dark sm:text-sm"
                  >
                    {category.shortName || category.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative z-10 flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[430px] rounded-[1.5rem] border border-white/70 bg-white/72 p-3 shadow-[0_22px_60px_rgba(17,24,39,0.12)] backdrop-blur-xl sm:rounded-[2rem] sm:p-4">
              <div className="absolute left-3 top-3 rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-soft sm:left-4 sm:top-4 sm:px-3 sm:text-xs sm:tracking-[0.18em]">
                Fresh edit
              </div>
              <div className="absolute right-3 top-3 rounded-pill bg-brand-dark px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 sm:right-4 sm:top-4 sm:px-3 sm:text-xs sm:tracking-[0.18em]">
                From \u20B919
              </div>
              <div
                className="rounded-[1.35rem] border border-white/80 p-4 sm:rounded-[1.7rem] sm:p-5"
                style={{
                  background: `linear-gradient(135deg, rgba(255,255,255,0.9), ${activeSlide.accent})`,
                }}
              >
                <Image
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  width={560}
                  height={420}
                  sizes="(min-width: 1024px) 36vw, 92vw"
                  className="mx-auto h-auto w-full max-w-[250px] animate-float drop-shadow-[0_24px_28px_rgba(16,34,23,0.12)] sm:max-w-[320px] sm:drop-shadow-[0_30px_35px_rgba(16,34,23,0.12)]"
                  priority
                />
              </div>
              <div className="mt-3 grid gap-2.5 sm:mt-4 sm:grid-cols-[1fr,auto] sm:items-center sm:gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:text-xs sm:tracking-[0.18em]">Curated for</div>
                  <div className="font-display text-xl text-brand-dark sm:text-2xl">Daily essentials</div>
                </div>
                <div className="rounded-[1rem] bg-brand-dark px-3.5 py-2.5 text-center text-sm font-medium text-white shadow-glow sm:rounded-[1.35rem] sm:px-4 sm:py-3">
                  Express delivery live
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between border-t border-white/70 bg-white/72 px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`h-2 rounded-full transition sm:h-2.5 ${index === activeIndex ? "w-8 bg-brand-dark sm:w-9" : "w-2 bg-brand-dark/20 sm:w-2.5"}`}
            />
          ))}
          <span className="ml-2 text-xs font-medium text-slate-400 sm:ml-3 sm:text-sm">
            {activeIndex + 1}/{slides.length}
          </span>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
            className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-soft transition hover:-translate-y-0.5 hover:text-brand-dark"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
            className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 shadow-soft transition hover:-translate-y-0.5 hover:text-brand-dark"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}


