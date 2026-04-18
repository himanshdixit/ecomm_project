"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Clock3, Heart, Minus, Plus, Star } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { cn, formatCurrency } from "@/lib/utils";
import { addCartItem, removeCartItem, updateCartItemQuantity } from "@/store/slices/cartSlice";
import { toggleWishlistProduct } from "@/store/slices/wishlistSlice";

const resolveSavings = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export default function ProductCard({ product, compact = false }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const wishlistItems = useAppSelector((state) => state.wishlist.items);
  const cartItems = useAppSelector((state) => state.cart.items);
  const [isCartPending, setIsCartPending] = useState(false);
  const [isWishlistPending, setIsWishlistPending] = useState(false);
  const isWishlisted = useMemo(() => wishlistItems.some((item) => item.id === product.id), [product.id, wishlistItems]);
  const defaultVariant = product.defaultVariant || product.selectedVariant || product.variants?.find((variant) => variant.isDefault) || null;
  const defaultVariantId = defaultVariant?.id || "";
  const variantCount = Number(product.variantCount || product.variants?.length || 0);
  const displayUnit = variantCount > 1 ? `${product.unit} | ${variantCount} sizes` : product.unit;
  const cartEntry = useMemo(
    () => cartItems.find((item) => item.productId === product.id && String(item.variantId || "") === String(defaultVariantId)),
    [cartItems, defaultVariantId, product.id]
  );
  const cartQuantity = cartEntry?.quantity || 0;
  const savingsPercent = resolveSavings(product.price, product.originalPrice);
  const productImage = resolveMediaUrl(product.image || product.images?.[0] || "/images/products/produce-crate.svg");
  const bypassImageOptimization = shouldBypassNextImageOptimization(productImage);

  const redirectToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(pathname || `/products/${product.slug}`)}`);
  };

  const handleCartMutation = async (nextQuantity) => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    setIsCartPending(true);

    try {
      if (!cartEntry && nextQuantity > 0) {
        await dispatch(addCartItem({ productId: product.id, variantId: defaultVariantId, quantity: 1 })).unwrap();
        return;
      }

      if (!cartEntry) {
        return;
      }

      if (nextQuantity <= 0) {
        await dispatch(removeCartItem(cartEntry.id)).unwrap();
        return;
      }

      await dispatch(updateCartItemQuantity({ itemId: cartEntry.id, quantity: nextQuantity })).unwrap();
    } finally {
      setIsCartPending(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      redirectToLogin();
      return;
    }

    setIsWishlistPending(true);

    try {
      await dispatch(toggleWishlistProduct(product.id)).unwrap();
    } finally {
      setIsWishlistPending(false);
    }
  };

  const cardClassName = compact
    ? "rounded-[0.95rem] p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] md:rounded-[1.1rem] md:p-2.5"
    : "rounded-[0.95rem] p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.05)] md:rounded-[1.15rem] md:p-2.5 lg:p-3";

  const mediaClassName = compact
    ? "rounded-[0.9rem] px-1.5 pb-1.5 pt-7 md:rounded-[1rem] md:px-2.5 md:pb-2.5 md:pt-9"
    : "rounded-[0.9rem] px-1.5 pb-1.5 pt-7 md:rounded-[1rem] md:px-2.5 md:pb-2.5 md:pt-8 lg:pt-9";

  const imageWrapClassName = compact ? "min-h-[92px] md:min-h-[128px]" : "min-h-[92px] md:min-h-[120px] lg:min-h-[132px]";
  const imageClassName = compact ? "h-[74px] md:h-[98px]" : "h-[74px] md:h-[92px] lg:h-[102px]";
  const nameClassName = compact
    ? "mt-1.5 min-h-[2rem] text-[10px] leading-[0.95rem] md:mt-2 md:min-h-[2.6rem] md:text-[13px] md:leading-[1.2rem]"
    : "mt-1.5 min-h-[2rem] text-[10px] leading-[0.95rem] md:mt-2 md:min-h-[2.6rem] md:text-[13px] md:leading-[1.2rem] lg:text-[14px] lg:leading-[1.25rem]";
  const unitClassName = "mt-0.5 text-[9px] md:mt-1 md:text-[11px]";
  const priceClassName = compact ? "text-[13px] md:text-[17px]" : "text-[13px] md:text-[16px] lg:text-[17px]";
  const comparePriceClassName = "text-[9px] md:text-[11px]";

  return (
    <article className="h-full">
      <div
        className={cn(
          "group flex h-full flex-col border border-slate-200/90 bg-white transition hover:border-[#dce9cf] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]",
          cardClassName
        )}
      >
        <div
          className={cn("relative overflow-hidden border border-slate-100", mediaClassName)}
          style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.97), ${product.tint || "#eff6e8"})` }}
        >
          <div className="absolute left-1.5 top-1.5 z-10 inline-flex max-w-[58%] truncate rounded-[0.5rem] bg-[#1d4ed8] px-1.5 py-0.5 text-[7px] font-bold uppercase leading-none tracking-[0.06em] text-white md:left-2 md:top-2 md:rounded-[0.55rem] md:px-1.5 md:py-1 md:text-[9px] md:tracking-[0.08em]">
            {savingsPercent > 0 ? `${savingsPercent}% off` : product.badge || "Fresh"}
          </div>

          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isWishlistPending}
            className={cn(
              "absolute right-1.5 top-1.5 z-10 rounded-full bg-white/95 p-1 text-slate-500 shadow-soft transition hover:text-rose-500 md:right-2 md:top-2 md:p-1.5",
              isWishlisted && "text-rose-500"
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("h-3 w-3 md:h-3.5 md:w-3.5", isWishlisted && "fill-current")} />
          </button>

          <Link href={`/products/${product.slug}`} className={cn("flex items-center justify-center", imageWrapClassName)}>
            <Image
              src={productImage}
              alt={product.name}
              width={180}
              height={180}
              sizes="(min-width: 1536px) 14vw, (min-width: 1280px) 16vw, (min-width: 768px) 22vw, 36vw"
              className={cn("w-auto object-contain transition duration-300 group-hover:scale-105", imageClassName)}
              unoptimized={bypassImageOptimization}
            />
          </Link>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[8px] font-semibold uppercase tracking-[0.04em] text-slate-500 md:mt-2 md:gap-2 md:text-[10px] md:tracking-[0.06em]">
          <div className="inline-flex min-w-0 items-center gap-1 rounded-pill bg-slate-50 px-1.5 py-0.5 md:px-2 md:py-1">
            <Clock3 className="h-2.5 w-2.5 text-[#2f8f2f] md:h-3 md:w-3" />
            <span className="truncate">{product.deliveryTime || "9 mins"}</span>
          </div>
          <div className="inline-flex shrink-0 items-center gap-1 text-amber-500">
            <Star className="h-2.5 w-2.5 fill-current md:h-3 md:w-3" />
            {(product.rating || 0).toFixed(1)}
          </div>
        </div>

        <Link href={`/products/${product.slug}`} className={cn("line-clamp-2 font-semibold text-slate-950", nameClassName)}>
          {product.name}
        </Link>
        <p className={cn("truncate text-slate-500", unitClassName)}>{displayUnit}</p>

        <div className="mt-auto pt-2 md:pt-2.5">
          <div className="flex items-end justify-between gap-1.5 md:gap-2">
            <div className="min-w-0 flex-1">
              <div className={cn("truncate font-bold leading-none text-slate-950", priceClassName)}>{formatCurrency(product.price)}</div>
              {product.originalPrice > product.price ? (
                <div className={cn("mt-1 truncate leading-none text-slate-400 line-through", comparePriceClassName)}>{formatCurrency(product.originalPrice)}</div>
              ) : (
                <div className={cn("mt-1 truncate leading-none text-slate-400", comparePriceClassName)}>
                  {variantCount > 1 ? "More sizes inside" : "Best value"}
                </div>
              )}
            </div>

            {cartQuantity > 0 ? (
              <div className="inline-flex h-[1.9rem] shrink-0 items-center gap-0.5 rounded-[0.72rem] bg-[#2f8f2f] px-1 py-1 text-[9px] font-semibold text-white md:h-auto md:gap-1 md:rounded-[0.9rem] md:px-2 md:py-2 md:text-[12px]">
                <button
                  type="button"
                  onClick={() => handleCartMutation(cartQuantity - 1)}
                  disabled={isCartPending}
                  className="rounded-[0.45rem] bg-white/15 p-0.5 disabled:cursor-not-allowed md:p-1"
                >
                  <Minus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                </button>
                <span className="min-w-[12px] text-center md:min-w-[14px]">{cartQuantity}</span>
                <button
                  type="button"
                  onClick={() => handleCartMutation(cartQuantity + 1)}
                  disabled={isCartPending || cartQuantity >= (defaultVariant?.stock ?? product.stock)}
                  className="rounded-[0.45rem] bg-white/15 p-0.5 disabled:cursor-not-allowed disabled:opacity-60 md:p-1"
                >
                  <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleCartMutation(1)}
                disabled={isCartPending || (defaultVariant?.stock ?? product.stock) <= 0}
                className="inline-flex h-[1.9rem] min-w-[4.15rem] shrink-0 items-center justify-center rounded-[0.72rem] border border-[#61a83f] bg-[#f5ffef] px-1.5 py-1 text-[9px] font-bold uppercase tracking-[0.03em] text-[#2f8f2f] transition hover:bg-[#eefae5] disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 md:h-auto md:min-w-[5.5rem] md:rounded-[0.9rem] md:px-3.5 md:py-2 md:text-[11px] md:tracking-[0.04em]"
              >
                {(defaultVariant?.stock ?? product.stock) <= 0 ? "Sold out" : isCartPending ? "Adding" : "Add"}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
