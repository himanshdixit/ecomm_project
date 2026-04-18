"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBoxOpen, FaChartLine, FaClipboardList, FaLayerGroup, FaUsers } from "react-icons/fa";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FaChartLine },
  { href: "/admin/products", label: "Products", icon: FaBoxOpen },
  { href: "/admin/categories", label: "Categories", icon: FaLayerGroup },
  { href: "/admin/orders", label: "Orders", icon: FaClipboardList },
  { href: "/admin/users", label: "Users", icon: FaUsers },
];

export default function AdminSidebar({ admin, isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={clsx(
          "fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm transition xl:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-[84vw] max-w-[18.5rem] flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] text-slate-200 shadow-[0_30px_80px_rgba(15,23,42,0.45)] transition-transform duration-300 xl:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="relative overflow-hidden border-b border-white/10 px-5 py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_36%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%)]" />
          <div className="relative flex items-start justify-between gap-3 xl:block">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
                <span>FreshCart</span>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] text-emerald-200">Admin</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Operations suite</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">FreshCart HQ</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Inventory, order flow, category curation, and shopper access in one place.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 xl:hidden"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-6">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Signed in</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-500 text-sm font-black text-slate-950 shadow-[0_14px_28px_rgba(16,185,129,0.22)]">
                {admin?.name?.slice(0, 2)?.toUpperCase() || "AD"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{admin?.name || "Admin"}</p>
                <p className="truncate text-sm text-slate-400">{admin?.email || "admin@freshcart.local"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Workspace</p>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      "group flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-emerald-400 text-slate-950 shadow-[0_18px_35px_rgba(74,222,128,0.25)]"
                        : "text-slate-300 hover:bg-white/6 hover:text-white"
                    )}
                  >
                    <span
                      className={clsx(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-2xl transition",
                        isActive ? "bg-slate-950/10" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 py-5">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open storefront
          </Link>
          <p className="mt-3 text-sm leading-6 text-slate-400">Admin access is protected at the route and API layer for safer operations.</p>
        </div>
      </aside>
    </>
  );
}
