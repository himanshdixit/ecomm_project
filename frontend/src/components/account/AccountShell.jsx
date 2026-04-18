"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Heart, MapPin, ShoppingCart, User2 } from "lucide-react";

import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "Overview", icon: User2, match: (pathname) => pathname === "/account" },
  { href: "/account/orders", label: "Orders", icon: Clock3, match: (pathname) => pathname.startsWith("/account/orders") },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: (pathname) => pathname.startsWith("/wishlist") },
  { href: "/cart", label: "Cart", icon: ShoppingCart, match: (pathname) => pathname.startsWith("/cart") },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";

export default function AccountShell({ user, children }) {
  const pathname = usePathname();
  const avatarUrl = resolveMediaUrl(user?.avatar || "");
  const initials = getInitials(user?.name || "User");
  const defaultAddress = user?.defaultDeliveryAddress;

  return (
    <main className="page-shell section-gap space-y-5 sm:space-y-6">
      <section className="retail-panel overflow-hidden border border-white/80 bg-[linear-gradient(135deg,#162033_0%,#1c3358_50%,#1195e8_100%)] text-white">
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr),260px] lg:items-end lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-pill bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              Customer account
            </div>
            <div className="flex items-start gap-4">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/20 bg-white/10 text-lg font-semibold text-white shadow-[0_16px_35px_rgba(0,0,0,0.16)] sm:h-20 sm:w-20 sm:text-2xl">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={user?.name || "Profile"}
                    fill
                    className="object-cover"
                    unoptimized={shouldBypassNextImageOptimization(avatarUrl)}
                  />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 space-y-1.5">
                <div className="text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[0.96] text-white">{user?.name || "Your account"}</div>
                <p className="max-w-2xl text-sm leading-6 text-white/72 sm:text-base sm:leading-7">
                  Manage orders, delivery details, wishlist picks, and rewards from one polished account space.
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/72">
                  <span className="rounded-pill bg-white/10 px-3 py-1.5 backdrop-blur">{user?.email}</span>
                  {defaultAddress?.city ? (
                    <span className="inline-flex items-center gap-2 rounded-pill bg-white/10 px-3 py-1.5 backdrop-blur">
                      <MapPin className="h-4 w-4" />
                      {defaultAddress.city}, {defaultAddress.state}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.45rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Reward coins</div>
              <div className="mt-2 text-3xl font-semibold text-white">{Number(user?.rewardCoins || 0)}</div>
              <div className="mt-1 text-sm text-white/65">Available for future offers and faster checkout perks.</div>
            </div>
            <div className="rounded-[1.45rem] border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Default address</div>
              <div className="mt-2 line-clamp-2 text-sm font-medium text-white/90">
                {defaultAddress?.addressLine1 || "Add a delivery address to speed up checkout."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[280px,minmax(0,1fr)] xl:grid-cols-[300px,minmax(0,1fr)]">
        <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
          <div className="surface-card p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.match(pathname || "");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex min-h-[3.25rem] shrink-0 items-center gap-3 rounded-[1.15rem] px-3.5 py-3 text-sm font-semibold transition lg:w-full",
                      active
                        ? "bg-[linear-gradient(135deg,#eff7e9,#f8fdff)] text-brand-dark shadow-soft ring-1 ring-[#dbe8d1]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    )}
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", active ? "bg-white text-[#1195e8] shadow-soft" : "bg-slate-100 text-slate-500")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </main>
  );
}
