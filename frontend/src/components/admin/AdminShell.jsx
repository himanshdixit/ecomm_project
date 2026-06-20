"use client";

import { useState } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import PageTransition from "@/components/motion/PageTransition";

export default function AdminShell({ admin, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,102,215,0.18),transparent_25%),radial-gradient(circle_at_top_right,rgba(255,199,90,0.14),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.99),rgba(244,247,255,0.97))]" />
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative flex min-h-screen">
        <AdminSidebar admin={admin} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col xl:pl-[18.5rem]">
          <AdminTopbar admin={admin} onToggleSidebar={() => setIsSidebarOpen(true)} />
          <main className="flex-1 px-3 pb-8 pt-4 sm:px-5 lg:px-8 xl:px-10">
            <PageTransition className="mx-auto w-full max-w-[1520px]">{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
