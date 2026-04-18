"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock3, Heart, LayoutGrid, LogOut, MapPin, Search, ShieldCheck, ShoppingCart, Sparkles, User2 } from "lucide-react";

import { HeaderCategorySkeleton } from "@/components/shared/Skeletons";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/hooks/useAppSelector";
import { getHeaderActiveRootSlug, getRootCategories } from "@/lib/category-tree";
import {
  emitStorefrontCategorySelect,
  parseCategorySlugFromPath,
  subscribeToStorefrontCategoryActive,
} from "@/lib/storefront-events";
import { cn } from "@/lib/utils";
import { catalogService } from "@/services/api";

const quickLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const hoverLift = { y: -2 };
const tapScale = { scale: 0.98 };

export default function Header({ initialCategories }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, logout, user } = useAuth();
  const totalQuantity = useAppSelector((state) => state.cart.totalQuantity);
  const hasInitialCategories = Array.isArray(initialCategories);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState(() => initialCategories || []);
  const [categoryStatus, setCategoryStatus] = useState(() => (hasInitialCategories ? "succeeded" : "loading"));
  const [activeCategorySlug, setActiveCategorySlug] = useState(() => parseCategorySlugFromPath(pathname));

  useEffect(() => {
    if (!hasInitialCategories) {
      return;
    }

    setCategories(initialCategories || []);
    setCategoryStatus("succeeded");
  }, [hasInitialCategories, initialCategories]);

  useEffect(() => {
    if (hasInitialCategories) {
      return;
    }

    let ignore = false;

    const loadCategories = async () => {
      setCategoryStatus("loading");

      try {
        const nextCategories = await catalogService.getCategories();

        if (!ignore) {
          setCategories(nextCategories || []);
          setCategoryStatus("succeeded");
        }
      } catch {
        if (!ignore) {
          setCategories([]);
          setCategoryStatus("failed");
        }
      }
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, [hasInitialCategories]);

  useEffect(() => {
    setActiveCategorySlug(parseCategorySlugFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = subscribeToStorefrontCategoryActive(({ slug }) => {
      setActiveCategorySlug(slug || "");
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isCategoryPage = pathname?.startsWith("/categories/");
  const headerCategories = getRootCategories(categories).slice(0, 7);
  const activeHeaderCategorySlug = getHeaderActiveRootSlug(categories, activeCategorySlug);

  const handleCategoryTabClick = (event, slug) => {
    if (!isCategoryPage) {
      return;
    }

    event.preventDefault();
    setActiveCategorySlug(slug);
    emitStorefrontCategorySelect({ slug, source: "header" });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    router.push(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 shadow-[0_8px_24px_rgba(16,34,23,0.05)] backdrop-blur-2xl">
      <div className="bg-[#162033] text-white">
        <div className="page-shell flex items-center justify-between gap-3 py-1.5 text-[10px] font-medium sm:text-xs">
          <div className="flex items-center gap-1.5 text-white/90">
            <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
            Delivery in 10 minutes
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <Link href="/account/orders" className="text-white/75 transition hover:text-white">
              <Clock3 className="h-3.5 w-3.5" />
            </Link>
            <Link href="/wishlist" className="text-white/75 transition hover:text-white">
              <Heart className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/account/orders" className="topbar-link text-xs">
              <Clock3 className="h-3.5 w-3.5" />
              Track Order
            </Link>
            <Link href="/wishlist" className="topbar-link text-xs">
              <Heart className="h-3.5 w-3.5" />
              Wishlist
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200/80">
        <div className="page-shell py-2 lg:py-3">
          <div className="grid gap-2.5 lg:grid-cols-[auto,200px,minmax(0,1fr),auto] lg:items-center lg:gap-3">
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <motion.div whileHover={hoverLift} whileTap={tapScale}>
                <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[1rem] bg-[#1195e8] text-white shadow-[0_10px_24px_rgba(17,149,232,0.24)] sm:h-10 sm:w-10">
                    <Sparkles className="h-[18px] w-[18px]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-[1.16rem] leading-none text-[#1195e8] sm:text-[1.48rem]">FreshCart</div>
                    <div className="mt-0.5 hidden text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">Daily essentials</div>
                    <div className="mt-1 inline-flex max-w-full items-center gap-1 text-[10px] font-medium text-slate-400 lg:hidden">
                      <MapPin className="h-3 w-3 shrink-0 text-[#1195e8]" />
                      <span className="truncate">Quick grocery delivery</span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:hidden">
                <motion.div whileHover={hoverLift} whileTap={tapScale}>
                  <Link
                    href={isAuthenticated ? "/account" : "/login?redirect=/account"}
                    className="inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-[0.9rem] border border-slate-200 bg-white text-slate-600 shadow-soft sm:h-9 sm:w-9"
                    aria-label={isAuthenticated ? "Account" : "Login"}
                  >
                    <User2 className="h-4 w-4" />
                  </Link>
                </motion.div>
                <motion.div whileHover={hoverLift} whileTap={tapScale} className="relative">
                  <Link
                    href="/cart"
                    className="inline-flex h-[2.15rem] w-[2.15rem] items-center justify-center rounded-[0.9rem] bg-[#1195e8] text-white shadow-[0_10px_22px_rgba(17,149,232,0.22)] sm:h-9 sm:w-9"
                    aria-label="Cart"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Link>
                  {totalQuantity > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                      {totalQuantity}
                    </span>
                  ) : null}
                </motion.div>
              </div>
            </div>

            <button type="button" className="hidden items-center justify-between rounded-[1.1rem] border border-slate-200 bg-white px-3.5 py-2.5 text-left shadow-soft lg:flex">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#1195e8]" />
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Deliver to</div>
                  <div className="text-[13px] font-semibold text-brand-dark">Select Location</div>
                </div>
              </div>
            </button>

            <motion.form whileFocus={{ scale: 1.002 }} onSubmit={handleSearchSubmit} className="relative lg:order-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search fruits, vegetables, groceries..."
                className="field-control h-10 border-slate-200 bg-slate-50 pl-10 pr-4 text-sm sm:h-11 sm:pl-11"
              />
            </motion.form>

            <div className="hidden items-center gap-2 lg:flex">
              {isLoading ? (
                <motion.div
                  animate={{ opacity: [0.45, 0.85, 0.45] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-10 w-44 rounded-pill bg-brand-soft/80"
                />
              ) : isAuthenticated ? (
                <>
                  <motion.div whileHover={hoverLift} whileTap={tapScale}>
                    <Link href="/account" className="pill-chip bg-slate-50 text-brand-dark hover:bg-white">
                      <User2 className="h-4 w-4 text-[#1195e8]" />
                      {user?.name?.split(" ")[0] || "Account"}
                    </Link>
                  </motion.div>
                  {isAdmin ? (
                    <motion.div whileHover={hoverLift} whileTap={tapScale}>
                      <Link href="/admin" className="pill-chip bg-brand-soft text-brand-dark hover:bg-white">
                        <ShieldCheck className="h-4 w-4 text-[#1195e8]" />
                        Admin
                      </Link>
                    </motion.div>
                  ) : null}
                  <motion.div whileHover={hoverLift} whileTap={tapScale} className="relative">
                    <Link href="/cart" className="button-primary px-4 py-2.5 text-sm">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                    </Link>
                    {totalQuantity > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {totalQuantity}
                      </span>
                    ) : null}
                  </motion.div>
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    whileHover={hoverLift}
                    whileTap={tapScale}
                    className="button-secondary px-4 py-2.5 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out..." : "Logout"}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div whileHover={hoverLift} whileTap={tapScale}>
                    <Link href="/login" className="pill-chip bg-slate-50 hover:bg-white">
                      Login
                    </Link>
                  </motion.div>
                  <motion.div whileHover={hoverLift} whileTap={tapScale} className="relative">
                    <Link href="/cart" className="button-primary px-4 py-2.5 text-sm">
                      <ShoppingCart className="h-4 w-4" />
                      Cart
                    </Link>
                    {totalQuantity > 0 ? (
                      <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                        {totalQuantity}
                      </span>
                    ) : null}
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell flex flex-col gap-2 py-2 lg:flex-row lg:items-center lg:justify-between lg:py-2.5">
        {categoryStatus === "loading" ? (
          <HeaderCategorySkeleton />
        ) : (
          <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
            <motion.div whileHover={hoverLift} whileTap={tapScale}>
              <Link
                href="/products"
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-brand-dark shadow-soft transition hover:border-sky-200 hover:bg-white sm:px-3.5 sm:py-2 sm:text-xs",
                  pathname === "/products" && "border-sky-200 bg-white text-sky-700"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                All Products
              </Link>
            </motion.div>

            {headerCategories.map((category) => {
              const isActive = isCategoryPage ? activeHeaderCategorySlug === category.slug : pathname === `/categories/${category.slug}`;

              return (
                <motion.div key={category.slug} whileHover={hoverLift} whileTap={tapScale}>
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={(event) => handleCategoryTabClick(event, category.slug)}
                    className={cn(
                      "block shrink-0 whitespace-nowrap rounded-pill border border-transparent px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50 hover:text-brand-dark sm:px-3.5 sm:py-2 sm:text-xs",
                      isActive && "border-slate-200 bg-slate-50 text-brand-dark shadow-soft"
                    )}
                  >
                    {category.shortName || category.name}
                  </Link>
                </motion.div>
              );
            })}
            {categoryStatus === "failed" ? <span className="pill-chip shrink-0 bg-amber-50 text-amber-700">Categories unavailable</span> : null}
          </div>
        )}

        <div className="hidden items-center gap-1 lg:flex">
          {quickLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <motion.div key={link.href} whileHover={hoverLift} whileTap={tapScale}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-pill px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-brand-dark",
                    active && "bg-slate-50 text-brand-dark shadow-soft"
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
