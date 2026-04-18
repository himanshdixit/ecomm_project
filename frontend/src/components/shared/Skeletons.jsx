"use client";

import { motion, useReducedMotion } from "framer-motion";

const SkeletonBlock = ({ className = "" }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-slate-200/80 ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
        initial={shouldReduceMotion ? false : { x: "-100%" }}
        animate={shouldReduceMotion ? { opacity: [0.55, 0.85, 0.55] } : { x: ["-100%", "100%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

const SkeletonShell = ({ children, className }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }} className={className}>
    {children}
  </motion.div>
);

export function HomePageSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap space-y-6">
      <SkeletonBlock className="h-[360px] w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[320px]" />
        ))}
      </div>
    </SkeletonShell>
  );
}

export function CatalogSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap grid gap-6 lg:grid-cols-[280px,1fr]">
      <SkeletonBlock className="h-[420px]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-[300px]" />
        ))}
      </div>
    </SkeletonShell>
  );
}

export function ProductDetailSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <SkeletonBlock className="h-[460px]" />
      <div className="space-y-4">
        <SkeletonBlock className="h-8 w-32" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-24 w-full" />
        <SkeletonBlock className="h-14 w-full" />
        <SkeletonBlock className="h-[180px] w-full" />
      </div>
    </SkeletonShell>
  );
}

export function CartSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-36 w-full" />
        ))}
      </div>
      <SkeletonBlock className="h-[360px]" />
    </SkeletonShell>
  );
}

export function CheckoutSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap grid gap-6 lg:grid-cols-[1fr,360px]">
      <div className="space-y-4">
        <SkeletonBlock className="h-40 w-full" />
        <SkeletonBlock className="h-44 w-full" />
        <SkeletonBlock className="h-40 w-full" />
      </div>
      <SkeletonBlock className="h-[360px]" />
    </SkeletonShell>
  );
}

export function AccountCollectionSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap space-y-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-8 w-32" />
        <SkeletonBlock className="h-12 w-full max-w-2xl" />
        <SkeletonBlock className="h-6 w-full max-w-xl" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-52 w-full" />
        ))}
      </div>
    </SkeletonShell>
  );
}

export function HeaderCategorySkeleton() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <SkeletonBlock className="hidden h-10 w-24 lg:block" />
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonBlock key={index} className="h-10 w-24 shrink-0 rounded-pill" />
      ))}
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <SkeletonShell className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr,1fr]">
        <SkeletonBlock className="h-[320px] w-full" />
        <SkeletonBlock className="h-[320px] w-full" />
      </div>
      <SkeletonBlock className="h-[340px] w-full" />
    </SkeletonShell>
  );
}

export function ContentPageSkeleton() {
  return (
    <SkeletonShell className="page-shell section-gap space-y-5">
      <SkeletonBlock className="h-56 w-full" />
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-40 w-full" />
        ))}
      </div>
      <SkeletonBlock className="h-72 w-full" />
    </SkeletonShell>
  );
}
