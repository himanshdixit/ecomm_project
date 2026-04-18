import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Clock3, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import ProductImageGallery from "@/components/product/ProductImageGallery";
import ProductPurchasePanel from "@/components/product/ProductPurchasePanel";
import SectionHeading from "@/components/shared/SectionHeading";
import { resolveMediaUrl } from "@/lib/api-config";
import { createRichTextMarkup, stripHtml } from "@/lib/rich-text";
import { absoluteUrl, buildMetadata, siteConfig, truncateText } from "@/lib/seo";
import { getAllProductSlugs, getProductDetail } from "@/lib/storefront";
import { formatCurrency } from "@/lib/utils";

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;

const toAbsoluteProductImageUrl = (value) => {
  const resolved = resolveMediaUrl(value);

  if (!resolved) {
    return absoluteUrl("/opengraph-image");
  }

  return ABSOLUTE_URL_PATTERN.test(resolved) ? resolved : absoluteUrl(resolved);
};

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await getProductDetail(slug);

  if (!product) {
    return buildMetadata({
      title: "Product",
      description: "Browse premium grocery products and daily essentials.",
      path: `/products/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return buildMetadata({
    title: product.name,
    description: truncateText(product.description || `${product.name} available for fast grocery delivery.`),
    path: `/products/${product.slug}`,
    image: `/products/${product.slug}/opengraph-image`,
    keywords: [product.name, product.category?.name, `${product.name} online`].filter(Boolean),
  });
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const { product, relatedProducts } = await getProductDetail(slug);

  if (!product) {
    notFound();
  }

  const categoryPath = product.category?.path || (product.category ? [{ name: product.category.name, slug: product.category.slug }] : []);
  const descriptionText = stripHtml(product.description);
  const productGalleryImages = Array.isArray(product.images) && product.images.length ? product.images : [product.image].filter(Boolean);
  const unitDescription = product.variantCount > 1 ? `${product.unit} | ${product.variantCount} pack options available` : product.unit;
  const savingsAmount = Math.max(Number(product.originalPrice || 0) - Number(product.price || 0), 0);
  const variantHighlights = Array.isArray(product.variants) ? product.variants.slice(0, 4) : [];
  const structuredImages = (productGalleryImages.length ? productGalleryImages : ["/opengraph-image"]).map(toAbsoluteProductImageUrl);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Products",
            item: absoluteUrl("/products"),
          },
          ...categoryPath.map((entry, index) => ({
            "@type": "ListItem",
            position: index + 2,
            name: entry.name,
            item: absoluteUrl(`/categories/${entry.slug}`),
          })),
          {
            "@type": "ListItem",
            position: categoryPath.length + 2,
            name: product.name,
            item: absoluteUrl(`/products/${product.slug}`),
          },
        ],
      },
      {
        "@type": "Product",
        name: product.name,
        description: truncateText(product.description, 500),
        image: structuredImages,
        category: product.category?.pathLabel || product.category?.name,
        sku: product.defaultVariant?.sku || product.id,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: String(product.price),
          availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: absoluteUrl(`/products/${product.slug}`),
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(product.reviewsCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: String(product.rating),
                reviewCount: String(product.reviewsCount),
              },
            }
          : {}),
      },
    ],
  };

  return (
    <main className="page-shell section-gap space-y-8 sm:space-y-10 lg:space-y-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-pill bg-slate-50 px-3 py-1.5 font-medium text-slate-600 hover:text-brand-dark">
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
              <Link href="/products" className="hover:text-brand-dark">Products</Link>
              {categoryPath.map((entry) => (
                <span key={entry.slug} className="inline-flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  <Link href={`/categories/${entry.slug}`} className="hover:text-brand-dark">
                    {entry.name}
                  </Link>
                </span>
              ))}
              <span className="inline-flex items-center gap-1 text-brand-dark">
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                {product.name}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {product.category?.slug ? (
              <Link href={`/categories/${product.category.slug}`} className="button-secondary px-4 py-2 text-sm">
                View full aisle
              </Link>
            ) : null}
            <Link href="/products" className="button-secondary px-4 py-2 text-sm">
              Continue browsing
            </Link>
          </div>
        </div>

        <div className="grid gap-6 pt-5 lg:grid-cols-[1.05fr,0.95fr] lg:gap-8">
          <div className="space-y-5">
            <div className="retail-panel overflow-hidden p-4 sm:p-6">
              <div className="relative flex flex-wrap items-start justify-between gap-3 pb-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-pill bg-[#162033] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90">{product.badge}</span>
                  {product.variantCount > 1 ? <span className="rounded-pill bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">{product.variantCount} pack sizes</span> : null}
                </div>
                <div className="inline-flex items-center gap-1 rounded-pill bg-white/90 px-3 py-1.5 text-sm font-semibold text-amber-500 shadow-soft">
                  <Star className="h-4 w-4 fill-current" />
                  {product.rating.toFixed(1)}
                  <span className="text-xs text-slate-400">({product.reviewsCount})</span>
                </div>
              </div>

              <ProductImageGallery productName={product.name} images={productGalleryImages} tint={product.tint || "#eef6e8"} />

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.2rem] bg-white/80 px-4 py-3 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Delivery</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{product.deliveryTime}</div>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 px-4 py-3 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Default pack</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{product.defaultVariant?.label || product.unit}</div>
                </div>
                <div className="rounded-[1.2rem] bg-white/80 px-4 py-3 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Stock</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{product.stock > 0 ? `${product.stock}+ ready` : "Sold out"}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Express delivery",
                  text: "Premium packaging and rider batching for quick, cleaner drop-offs.",
                  icon: Truck,
                },
                {
                  title: "Quality checked",
                  text: "Freshness spot-checks and curated picks for a more reliable order.",
                  icon: ShieldCheck,
                },
                {
                  title: "Pack protection",
                  text: "Careful handling across fragile, chilled, and pantry inventory.",
                  icon: PackageCheck,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="surface-card p-5">
                    <Icon className="mb-3 h-6 w-6 text-[#1195e8]" />
                    <h3 className="mb-2 text-lg">{item.title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="surface-card p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-pill bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand-dark">
                  <Clock3 className="h-4 w-4" />
                  Delivery in {product.deliveryTime}
                </span>
                {product.category?.name ? <span className="rounded-pill bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-500">{product.category.name}</span> : null}
              </div>

              <h1 className="mt-4 text-[2.3rem] leading-[1.02] sm:text-[3rem]">{product.name}</h1>
              <p className="mt-3 text-base text-slate-500">{unitDescription}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">{truncateText(descriptionText, 220)}</p>

              <div className="mt-6 flex flex-wrap items-end gap-4 rounded-[1.5rem] bg-[#f7fbf2] p-4 sm:p-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{product.variantCount > 1 ? "Starting at" : "Price"}</div>
                  <div className="mt-1 text-4xl font-bold text-brand-dark">{formatCurrency(product.price)}</div>
                  {product.originalPrice > product.price ? <div className="mt-1 text-base text-slate-400 line-through">{formatCurrency(product.originalPrice)}</div> : null}
                </div>
                {savingsAmount > 0 ? (
                  <div className="rounded-[1.1rem] bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-soft">
                    Save {formatCurrency(savingsAmount)}
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <ProductPurchasePanel product={product} />
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">What shoppers notice</div>
              <div className="mt-4 grid gap-3">
                {product.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3 rounded-[1.15rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[#1195e8]" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="surface-card p-6 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Product story</div>
              <h2 className="mt-2 text-3xl">Why this product fits a premium storefront</h2>
            </div>
            <span className="rounded-pill bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Rich description enabled
            </span>
          </div>
          <div className="richtext-content" dangerouslySetInnerHTML={createRichTextMarkup(product.description)} />
        </div>

        <div className="space-y-6">
          <div className="surface-card p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Pack overview</div>
            <h2 className="mt-2 text-2xl">Available units</h2>
            <div className="mt-5 grid gap-3">
              {variantHighlights.map((variant) => (
                <div key={variant.id} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-950">{variant.label}</div>
                      <div className="mt-1 text-xs text-slate-500">{variant.packLabel || variant.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-950">{formatCurrency(variant.price)}</div>
                      <div className="text-xs text-slate-400">{variant.stock} in stock</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Quick navigation</div>
            <h2 className="mt-2 text-2xl">Keep browsing smoothly</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/products" className="button-secondary justify-between px-4 py-3 text-sm">
                Browse all products
                <ChevronRight className="h-4 w-4" />
              </Link>
              {product.category?.slug ? (
                <Link href={`/categories/${product.category.slug}`} className="button-secondary justify-between px-4 py-3 text-sm">
                  Return to {product.category.name}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
              <Link href="/cart" className="button-secondary justify-between px-4 py-3 text-sm">
                Review your cart
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {product.tags?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-pill bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Related picks"
          title="More from this aisle"
          description="Navigation stays tight here too, so shoppers can continue deeper into the same category without losing context."
        />
        {relatedProducts.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        ) : (
          <div className="surface-card p-6 text-sm text-slate-600">Related products will show up here when more items exist in this category.</div>
        )}
      </section>
    </main>
  );
}
