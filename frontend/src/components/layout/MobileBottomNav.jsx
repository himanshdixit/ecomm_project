"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Heart, Home, LayoutGrid, ShoppingCart, User2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import useHydrated from "@/hooks/useHydrated";
import { useAppSelector } from "@/hooks/useAppSelector";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);
  const { isAuthenticated } = useAuth();
  const isHydrated = useHydrated();

  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", icon: Home },
      { href: "/products", label: "Browse", icon: LayoutGrid },
      { href: "/wishlist", label: "Wishlist", icon: Heart },
      { href: "/cart", label: "Cart", icon: ShoppingCart },
      { href: isAuthenticated ? "/account" : "/login?redirect=/account", label: "Account", icon: User2 },
    ],
    [isAuthenticated]
  );

  if (!isHydrated) {
    return null;
  }

  return createPortal(
    <nav className="pointer-events-auto fixed inset-x-2 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-[120] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-[1.55rem] border border-slate-200/90 bg-white/96 p-1.5 shadow-[0_24px_50px_rgba(15,23,42,0.18)] ring-1 ring-white/70 backdrop-blur-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/"
            ? pathname === "/"
            : item.href.startsWith("/login")
              ? pathname.startsWith("/account")
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isCart = item.href === "/cart";

          return (
            <motion.div key={item.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-h-[3.9rem] flex-col items-center justify-center gap-1 rounded-[1rem] px-1 py-2 text-[10px] font-semibold transition",
                  active ? "bg-[#1195e8] text-white shadow-[0_12px_24px_rgba(17,149,232,0.24)]" : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950"
                )}
              >
                <span className={cn("flex h-7 w-7 items-center justify-center rounded-full transition", active ? "bg-white/15" : "bg-slate-100 text-slate-700")}>
                  <Icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-700")} />
                </span>
                <span className="leading-none">{item.label}</span>
                {isCart && totalQuantity > 0 ? (
                  <span className="absolute right-2 top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white shadow-[0_8px_18px_rgba(244,63,94,0.24)]">
                    {totalQuantity}
                  </span>
                ) : null}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>,
    document.body
  );
}
