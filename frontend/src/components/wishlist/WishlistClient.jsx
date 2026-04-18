"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import { AccountCollectionSkeleton } from "@/components/shared/Skeletons";
import StatusBanner from "@/components/shared/StatusBanner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { stripHtml } from "@/lib/rich-text";
import { formatCurrency } from "@/lib/utils";
import { addCartItem } from "@/store/slices/cartSlice";
import { fetchWishlist, toggleWishlistProduct } from "@/store/slices/wishlistSlice";

export default function WishlistClient({ user }) {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.wishlist);
  const [pendingCartId, setPendingCartId] = useState(null);
  const [pendingWishlistId, setPendingWishlistId] = useState(null);

  if ((status === "idle" || status === "loading") && items.length === 0) {
    return <AccountCollectionSkeleton />;
  }

  if (status === "failed" && !items.length) {
    return (
      <main className="page-shell section-gap">
        <StatusBanner
          tone="error"
          title="Your wishlist could not be loaded"
          message={error || `We were not able to load ${user.name}'s saved products right now.`}
          action={
            <button type="button" onClick={() => dispatch(fetchWishlist())} className="button-primary text-sm">
              Retry wishlist
            </button>
          }
        />
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="page-shell section-gap">
        <EmptyState
          title="Your wishlist is empty"
          description={`Saved picks for ${user.name} will appear here once you tap the heart on a product card.`}
          action={
            <Link href="/products" className="button-primary">
              Explore products
            </Link>
          }
        />
      </main>
    );
  }

  const getWishlistImage = (item) => resolveMediaUrl(item.image || "/images/products/produce-crate.svg");
  const shouldBypassWishlistImageOptimization = (item) => shouldBypassNextImageOptimization(getWishlistImage(item));

  const handleToggleWishlist = async (productId) => {
    setPendingWishlistId(productId);

    try {
      await dispatch(toggleWishlistProduct(productId)).unwrap();
    } finally {
      setPendingWishlistId(null);
    }
  };

  const handleAddToCart = async (productId, variantId = "") => {
    setPendingCartId(productId);

    try {
      await dispatch(addCartItem({ productId, variantId, quantity: 1 })).unwrap();
    } finally {
      setPendingCartId(null);
    }
  };

  return (
    <main className="page-shell section-gap space-y-6">
      <div className="max-w-2xl space-y-3">
        <div className="pill-chip w-fit">Saved by {user.name}</div>
        <h1 className="text-4xl sm:text-5xl">Your wishlist, synced to your account.</h1>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">Review favorites, move them into the cart, or trim your saved list in one place.</p>
      </div>

      {error ? (
        <StatusBanner
          tone="warning"
          title="Wishlist sync needs attention"
          message={error}
          action={
            <button type="button" onClick={() => dispatch(fetchWishlist())} className="button-primary text-sm">
              Refresh wishlist
            </button>
          }
        />
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="surface-card flex h-full flex-col p-5">
            <div className="mb-4 flex items-start justify-between gap-4 rounded-[1.5rem] p-4" style={{ backgroundColor: item.tint }}>
              <Image src={getWishlistImage(item)} alt={item.name} width={160} height={160} className="h-28 w-28 object-contain" unoptimized={shouldBypassWishlistImageOptimization(item)} />
              <button
                type="button"
                onClick={() => handleToggleWishlist(item.id)}
                disabled={pendingWishlistId === item.id}
                className="rounded-full bg-white/85 p-2 text-rose-500 shadow-soft disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Heart className="h-4 w-4 fill-current" />
              </button>
            </div>
            <Link href={`/products/${item.slug}`} className="mb-2 text-2xl text-brand-dark hover:text-brand">
              {item.name}
            </Link>
            <p className="mb-2 text-sm text-slate-500">{item.unit}</p>
            <p className="mb-4 text-sm leading-7 text-slate-600">{stripHtml(item.description)}</p>
            <div className="mt-auto flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-bold text-brand-dark">{formatCurrency(item.price)}</div>
                <div className="text-sm text-slate-400 line-through">{formatCurrency(item.originalPrice)}</div>
              </div>
              <button
                type="button"
                onClick={() => handleAddToCart(item.id, item.defaultVariant?.id || "")}
                disabled={pendingCartId === item.id}
                className="button-primary px-4 py-3 text-sm"
              >
                {pendingCartId === item.id ? "Adding..." : "Add to cart"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
