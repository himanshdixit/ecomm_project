"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageTransition from "@/components/motion/PageTransition";

export default function StorefrontShell({ children, initialCategories }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_rgba(245,248,234,0.72)_45%,_transparent_100%)]" />
      <Header initialCategories={initialCategories} />
      <PageTransition className="pb-28 md:pb-0">{children}</PageTransition>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
