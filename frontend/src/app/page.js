import Image from "next/image";
import Link from "next/link";

import BannerCarousel from "@/components/home/BannerCarousel";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeatureStrip from "@/components/home/FeatureStrip";
import HomeDealGrid from "@/components/home/HomeDealGrid";
import StorefrontShell from "@/components/layout/StorefrontShell";
import ProductRail from "@/components/product/ProductRail";
import SectionHeading from "@/components/shared/SectionHeading";
import { getRootCategories } from "@/lib/category-tree";
import { featureHighlights, heroSlides } from "@/lib/mock-data";
import { buildMetadata } from "@/lib/seo";
import { homeDealCards } from "@/lib/storefront-theme";
import { getCategories, getProducts } from "@/lib/storefront";

export const metadata = buildMetadata({
  title: "Premium Grocery Delivery and Daily Essentials",
  description:
    "Shop fresh produce, pantry staples, dairy, snacks, and daily essentials with category-first browsing and premium grocery delivery UX.",
  path: "/",
  keywords: ["grocery delivery home page", "premium grocery app", "daily essentials online"],
});

export default async function HomePage() {
  const [categories, trendingResponse] = await Promise.all([
    getCategories(),
    getProducts({ featured: "true", limit: "8", sort: "popular" }),
  ]);

  const trendingProducts = trendingResponse.products || [];
  const rootCategories = getRootCategories(categories);
  const highlightedCategories = rootCategories.slice(0, 10);

  return (
    <StorefrontShell initialCategories={categories}>
      <main className="section-gap space-y-12 lg:space-y-16">
        <section className="page-shell pt-1">
          <BannerCarousel slides={heroSlides} categories={rootCategories} />
        </section>

        <section className="page-shell">
          <FeatureStrip items={featureHighlights} />
        </section>

        <section className="page-shell space-y-6">
          <SectionHeading
            eyebrow="Shop by category"
            title="Fresh picks from every aisle."
            description="Category browsing now works like a true retail rail, with swipeable cards on mobile and a calmer desktop browse rhythm instead of a rigid blocky grid."
            actionLabel="Browse catalog"
            actionHref="/products"
          />
          {highlightedCategories.length ? (
            <CategoryShowcase items={highlightedCategories} />
          ) : (
            <div className="surface-card p-6 text-sm text-slate-600">Categories will appear here once your backend is seeded with storefront data.</div>
          )}
        </section>

        <section className="page-shell space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Deals of the day</div>
              <h2 className="text-[2rem] leading-tight text-brand-dark sm:text-[2.35rem]">High-visibility offers without the clutter.</h2>
            </div>
            <Link href="/products?featured=true" className="hidden text-sm font-semibold text-sky-700 transition hover:translate-x-1 sm:inline-flex">
              View all
            </Link>
          </div>
          <HomeDealGrid items={homeDealCards} />
        </section>

        <section className="page-shell space-y-6">
          <SectionHeading
            eyebrow="Trending products"
            title="Handpicked daily essentials just for you."
            description="The product cards now sit inside a real scroll rail, so mobile always shows at least two cards in view and desktop browsing feels more like a premium storefront shelf."
            actionLabel="Shop best sellers"
            actionHref="/products?featured=true"
          />

          {rootCategories.length ? (
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-1">
              <Link href="/products" className="rounded-pill bg-[#1195e8] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(17,149,232,0.24)]">
                All
              </Link>
              {rootCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="rounded-pill border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-dark shadow-soft transition hover:border-sky-200 hover:text-sky-700"
                >
                  {category.shortName || category.name}
                </Link>
              ))}
            </div>
          ) : null}

          {trendingProducts.length ? (
            <ProductRail items={trendingProducts} />
          ) : (
            <div className="surface-card p-6 text-sm text-slate-600">Featured products will appear here once you add inventory to the catalog.</div>
          )}
        </section>

        <section className="page-shell">
          <div className="grid gap-5 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#162033] p-6 text-white shadow-[0_30px_70px_rgba(22,32,51,0.28)] sm:p-8">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-accent/25 blur-3xl" />
              <div className="relative z-10 max-w-xl space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Weekend essentials</div>
                <h2 className="max-w-lg text-3xl text-white sm:text-[2.6rem]">Dairy, fruit crates, snacks, and bakery bundles designed for faster decision making.</h2>
                <p className="text-sm leading-7 text-white/72 sm:text-base">
                  This layout pulls the user toward strong categories, clean offers, and product actions that stay visible without feeling noisy.
                </p>
                <Link href="/products" className="button-primary px-5 py-3 text-sm">
                  Shop now
                </Link>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="surface-card grid gap-4 p-5 sm:grid-cols-[0.9fr,1.1fr] sm:items-center sm:p-6">
                <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,rgba(255,243,214,0.95),rgba(255,248,235,0.92))] p-4">
                  <Image
                    src="/images/hero/market-fresh.svg"
                    alt="Fresh produce display"
                    width={320}
                    height={220}
                    sizes="(min-width: 640px) 22vw, 88vw"
                    className="mx-auto h-auto w-full max-w-[220px] object-contain"
                  />
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Freshness note</div>
                  <h3 className="text-2xl">Cleaner visuals, calmer browsing, better merchandising.</h3>
                  <p className="text-sm leading-7 text-slate-600">Product-first compositions help the store feel premium without losing the speed and familiarity of Blinkit-style shopping.</p>
                </div>
              </div>

              <div className="surface-card bg-[linear-gradient(135deg,rgba(223,244,234,0.92),rgba(255,255,255,0.96))] p-6">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/80">Store promise</div>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-3xl font-bold text-brand-dark">10m</div>
                    <p className="mt-1 text-sm text-slate-600">Average delivery window</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-dark">250+</div>
                    <p className="mt-1 text-sm text-slate-600">Fresh essentials updated daily</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-brand-dark">24/7</div>
                    <p className="mt-1 text-sm text-slate-600">Ordering across every screen size</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </StorefrontShell>
  );
}
