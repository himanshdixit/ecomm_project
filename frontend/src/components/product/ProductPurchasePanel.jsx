"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { formatCurrency } from "@/lib/utils";
import { addCartItem } from "@/store/slices/cartSlice";
import { toggleWishlistProduct } from "@/store/slices/wishlistSlice";

const getSavings = (price, originalPrice) => Math.max(Number(originalPrice || 0) - Number(price || 0), 0);

export default function ProductPurchasePanel({ product }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(product.defaultVariant?.id || product.selectedVariant?.id || product.variants?.[0]?.id || "");
  const [isCartPending, setIsCartPending] = useState(false);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const isWishlisted = useMemo(() => wishlistItems.some((item) => item.id === product.id), [product.id, wishlistItems]);
  const selectedVariant = useMemo(
    () => product.variants?.find((variant) => variant.id === selectedVariantId) || product.defaultVariant || product.selectedVariant,
    [product.defaultVariant, product.selectedVariant, product.variants, selectedVariantId]
  );
  const selectedSavings = getSavings(selectedVariant?.price || product.price, selectedVariant?.originalPrice || product.originalPrice);
  const maxSelectableQuantity = Math.max(Number(selectedVariant?.stock || 0), 1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariantId]);

  const goToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname || `/products/${product.slug}`)}`);
  };

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }

    setIsCartPending(true);

    try {
      await dispatch(addCartItem({ productId: product.id, variantId: selectedVariant?.id || "", quantity })).unwrap();

      if (redirectToCheckout) {
        router.push("/checkout");
      }
    } finally {
      setIsCartPending(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      goToLogin();
      return;
    }

    setIsWishlistPending(true);

    try {
      await dispatch(toggleWishlistProduct(product.id)).unwrap();
    } finally {
      setIsWishlistPending(false);
    }
  };

  return (
    <div className="space-y-5">
      {product.variants?.length ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Choose your pack</div>
              <div className="mt-1 text-sm font-medium text-slate-600">Switch sizes without leaving the page.</div>
            </div>
            <div className="rounded-pill bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {product.variantCount} options
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.variants.map((variant) => {
              const active = variant.id === selectedVariant?.id;
              const variantSavings = getSavings(variant.price, variant.originalPrice);

              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-[1.35rem] border px-4 py-3 text-left transition ${
                    active ? "border-[#bfe0ff] bg-[#f5fbff] shadow-soft" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-slate-950">{variant.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{variant.packLabel || variant.label}</div>
                    </div>
                    {variant.isDefault ? <span className="rounded-pill bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1195e8] ring-1 ring-[#bfdbfe]">Default</span> : null}
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold text-slate-950">{formatCurrency(variant.price)}</div>
                      <div className="text-xs text-slate-400 line-through">{formatCurrency(variant.originalPrice)}</div>
                    </div>
                    <div className="text-right text-xs font-medium text-slate-500">
                      <div>{variant.stock} in stock</div>
                      {variantSavings > 0 ? <div className="mt-1 text-emerald-600">Save {formatCurrency(variantSavings)}</div> : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(135deg,rgba(244,250,238,0.95),rgba(255,255,255,1))] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Selected pack</div>
            <div className="mt-1 text-lg font-semibold text-brand-dark">{selectedVariant?.label || product.unit}</div>
            <div className="mt-1 text-sm text-slate-500">{selectedVariant?.packLabel || product.unit}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-dark">{formatCurrency(selectedVariant?.price || product.price)}</div>
            <div className="text-sm text-slate-400 line-through">{formatCurrency(selectedVariant?.originalPrice || product.originalPrice)}</div>
            {selectedSavings > 0 ? <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">You save {formatCurrency(selectedSavings)}</div> : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Quantity</div>
          <div className="mt-1 text-sm text-slate-500">Adjust pack count for this order.</div>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 p-2">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="h-10 w-10 rounded-full bg-white text-xl text-brand-dark shadow-soft"
          >
            -
          </button>
          <span className="min-w-[2rem] text-center text-lg font-semibold text-brand-dark">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(maxSelectableQuantity, value + 1))}
            className="h-10 w-10 rounded-full bg-white text-xl text-brand-dark shadow-soft"
          >
            +
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => handleAddToCart(false)}
          disabled={isCartPending || (selectedVariant?.stock || 0) <= 0}
          className="button-primary w-full px-5 py-3.5 text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          {(selectedVariant?.stock || 0) <= 0 ? "Sold out" : isCartPending ? "Adding..." : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => handleAddToCart(true)}
          disabled={isCartPending || (selectedVariant?.stock || 0) <= 0}
          className="button-secondary w-full px-5 py-3.5 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Buy now
        </button>
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistPending}
          className={`button-secondary w-full px-5 py-3.5 text-sm ${isWishlisted ? "border-rose-200 bg-rose-50 text-rose-600" : ""}`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          {isWishlisted ? "Saved" : "Wishlist"}
        </button>
      </div>
    </div>
  );
}
