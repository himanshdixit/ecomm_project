"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import PageTransition from "@/components/motion/PageTransition";

export default function StorefrontShell({ children, initialCategories }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(244,247,255,0.88)_42%,_rgba(255,245,232,0.5)_78%,_transparent_100%)]" />
      <Header initialCategories={initialCategories} />
      <PageTransition className="pb-28 md:pb-0">{children}</PageTransition>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
