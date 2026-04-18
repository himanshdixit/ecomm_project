"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Trash2 } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import { CartSkeleton } from "@/components/shared/Skeletons";
import StatusBanner from "@/components/shared/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { formatCurrency } from "@/lib/utils";
import { fetchCart, removeCartItem, updateCartItemQuantity } from "@/store/slices/cartSlice";

export default function CartClient() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAuth();
  const { items, subtotal, shippingPrice, taxPrice, totalPrice, totalSavings, status, error } = useAppSelector((state) => state.cart);

  if (isLoading || (isAuthenticated && (status === "idle" || (status === "loading" && items.length === 0)))) {
    return <CartSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <main className="page-shell section-gap">
        <EmptyState
          title="Sign in to view your cart"
          description="Your cart is tied to your secure account so quantities, wishlist saves, and checkout stay in sync across sessions."
          action={
            <Link href="/login?redirect=/cart" className="button-primary">
              Login to continue
            </Link>
          }
        />
      </main>
    );
  }

  if (status === "failed" && !items.length) {
    return (
      <main className="page-shell section-gap">
        <StatusBanner
          tone="error"
          title="Your cart could not be loaded"
          message={error || "We were not able to fetch your latest cart right now."}
          action={
            <button type="button" onClick={() => dispatch(fetchCart())} className="button-primary text-sm">
              Retry cart sync
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
          title="Your cart is feeling light"
          description="Add a few fresh picks, pantry refills, or dessert drops and they will appear here with live totals from your account cart."
          action={
            <Link href="/products" className="button-primary">
              Browse products
            </Link>
          }
        />
      </main>
    );
  }

  const getCartImage = (item) => resolveMediaUrl(item.image || "/images/products/produce-crate.svg");
  const shouldBypassCartImageOptimization = (item) => shouldBypassNextImageOptimization(getCartImage(item));

  return (
    <main className="page-shell section-gap space-y-6">
      <div className="max-w-2xl space-y-3">
        <div className="pill-chip w-fit">Your live cart</div>
        <h1 className="text-4xl sm:text-5xl">A polished summary before checkout.</h1>
        <p className="text-sm leading-7 text-slate-600 sm:text-base">Quantities, savings, and totals are synced to your account cart in real time.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <section className="space-y-4">
          <StatusBanner
            tone="success"
            title="Savings applied"
            message={`You are saving ${formatCurrency(totalSavings)} on this order.`}
            className="shadow-soft"
          />

          {error ? (
            <StatusBanner
              tone="error"
              title="Cart sync needs attention"
              message={error}
              action={
                <button type="button" onClick={() => dispatch(fetchCart())} className="button-primary text-sm">
                  Refresh cart
                </button>
              }
            />
          ) : null}

          {items.map((item) => (
            <article key={item.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
              <div className="rounded-[1.35rem] p-4" style={{ backgroundColor: item.tint }}>
                <Image src={getCartImage(item)} alt={item.name} width={120} height={120} className="h-24 w-24 object-contain" unoptimized={shouldBypassCartImageOptimization(item)} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <Link href={`/products/${item.slug}`} className="text-2xl text-brand-dark hover:text-brand">
                      {item.name}
                    </Link>
                    <p className="text-sm text-slate-500">{item.unit}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-brand-dark">{formatCurrency(item.lineTotal)}</div>
                    <div className="text-sm text-slate-400 line-through">{formatCurrency(item.originalPrice * item.quantity)}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="pill-chip bg-brand-soft/70">
                    <Clock3 className="h-4 w-4 text-brand" />
                    {item.deliveryTime}
                  </span>
                  <div className="flex items-center gap-2 rounded-pill bg-brand-soft/70 px-3 py-2 text-brand-dark">
                    <button
                      type="button"
                      onClick={() => dispatch(updateCartItemQuantity({ itemId: item.id, quantity: item.quantity - 1 }))}
                      className="h-7 w-7 rounded-full bg-white shadow-soft"
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(updateCartItemQuantity({ itemId: item.id, quantity: item.quantity + 1 }))}
                      className="h-7 w-7 rounded-full bg-white shadow-soft disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeCartItem(item.id))}
                    className="button-secondary px-3 py-2 text-sm text-slate-500 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="lg:sticky lg:top-36 lg:h-fit">
          <div className="surface-card p-6">
            <h2 className="mb-5 text-2xl">Order summary</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery</span>
                <span>{shippingPrice === 0 ? "Free" : formatCurrency(shippingPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatCurrency(taxPrice)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-brand/10 pt-3 text-base font-semibold text-brand-dark">
                <span>Total</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
            </div>
            <Link href="/checkout" className="button-primary mt-6 w-full">
              Continue to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
