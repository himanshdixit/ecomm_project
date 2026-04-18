"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBars, FaBell, FaHome, FaLock, FaSignOutAlt } from "react-icons/fa";

import { useAuth } from "@/context/AuthContext";

export default function AdminTopbar({ admin, onToggleSidebar }) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-[#f3f6fb]/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1520px] px-3 py-3 sm:px-5 lg:px-8 xl:px-10">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-emerald-300 hover:text-emerald-700 xl:hidden"
            aria-label="Open navigation"
          >
            <FaBars className="h-4 w-4" />
          </button>

          <div className="min-w-0 flex-1 rounded-[26px] border border-white/80 bg-white/95 px-4 py-3 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-600">FreshCart control room</p>
                <p className="truncate text-base font-black tracking-tight text-slate-950 sm:text-lg">Inventory, orders, shoppers, and revenue in one responsive workspace</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <FaHome className="h-3 w-3" />
                  Live storefront
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                  <FaLock className="h-3 w-3" />
                  Admin secured
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
            aria-label="Notifications"
          >
            <FaBell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 rounded-[22px] border border-white/80 bg-white/95 px-2.5 py-2 shadow-[0_14px_34px_rgba(15,23,42,0.07)]">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-slate-950 to-slate-700 text-xs font-black text-white">
              {admin?.name?.slice(0, 2)?.toUpperCase() || "AD"}
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-slate-950">{admin?.name || "Admin"}</p>
              <p className="truncate text-xs text-slate-500">{admin?.email || "admin@freshcart.local"}</p>
            </div>
          </div>

          <Link
            href="/"
            className="hidden items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-emerald-300 hover:text-emerald-700 lg:inline-flex"
          >
            View Storefront
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
