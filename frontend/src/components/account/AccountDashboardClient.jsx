"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, Heart, MapPin, ShoppingBag, Sparkles, Star, Truck, User2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import AccountProfileForm from "@/components/account/AccountProfileForm";
import { AccountCollectionSkeleton } from "@/components/shared/Skeletons";
import StatusBanner from "@/components/shared/StatusBanner";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
import { formatDate } from "@/lib/format";
import { formatCurrency } from "@/lib/utils";
import { userService } from "@/services/api";

const ORDER_PROGRESS = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
};

const ORDER_STEPS = ["Placed", "Confirmed", "Packed", "On the way", "Delivered"];
const offerToneClasses = {
  emerald: "from-emerald-50 to-white text-emerald-900 ring-emerald-100",
  amber: "from-amber-50 to-white text-amber-900 ring-amber-100",
  sky: "from-sky-50 to-white text-sky-900 ring-sky-100",
  violet: "from-violet-50 to-white text-violet-900 ring-violet-100",
};
const quickSectionLinks = [
  { href: "#activity", label: "Orders" },
  { href: "#wishlist", label: "Wishlist" },
  { href: "#rewards", label: "Rewards" },
  { href: "#offers", label: "Offers" },
  { href: "#profile", label: "Profile" },
  { href: "#addresses", label: "Addresses" },
];

const getProgressWidth = (orderStatus) => {
  if (orderStatus === "cancelled") {
    return "0%";
  }

  const rank = ORDER_PROGRESS[orderStatus] ?? 0;
  return `${(rank / (ORDER_STEPS.length - 1)) * 100}%`;
};

const getStatusLabel = (order) => {
  if (order.orderStatus === "cancelled") {
    return "Cancelled";
  }

  if (order.orderStatus === "delivered") {
    return "Delivered";
  }

  return order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);
};

const isOrderActive = (order) => !["delivered", "cancelled"].includes(order.orderStatus);

function StatCard({ eyebrow, value, description, icon: Icon }) {
  return (
    <div className="surface-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{eyebrow}</div>
          <div className="mt-2 text-3xl font-semibold text-brand-dark">{value}</div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{description}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef7ff] text-[#1195e8] shadow-soft">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function OrderTrackerCard({ order }) {
  const progressRank = ORDER_PROGRESS[order.orderStatus] ?? 0;

  return (
    <article className="rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order #{order.id.slice(-8).toUpperCase()}</div>
          <div className="mt-2 text-lg font-semibold text-brand-dark">{formatDate(order.createdAt)}</div>
          <div className="mt-1 text-sm text-slate-500">{order.orderItems.length} items | {formatCurrency(order.totalPrice)}</div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em]">
          <span className="rounded-pill bg-[#eef8e8] px-3 py-1.5 text-[#2f8f2f]">{getStatusLabel(order)}</span>
          <span className="rounded-pill bg-slate-100 px-3 py-1.5 text-slate-600">{order.paymentStatus}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative h-2 rounded-full bg-slate-100">
          <div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#7ab640,#1195e8)]" style={{ width: getProgressWidth(order.orderStatus) }} />
        </div>
        <div className="grid grid-cols-5 gap-2 text-[11px] font-medium text-slate-500">
          {ORDER_STEPS.map((step, index) => {
            const active = progressRank >= index && order.orderStatus !== "cancelled";

            return (
              <div key={step} className={active ? "text-brand-dark" : "text-slate-400"}>
                <div className={active ? "font-semibold" : ""}>{step}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
        {order.shippingAddress?.city ? (
          <span className="inline-flex items-center gap-2 rounded-pill bg-slate-50 px-3 py-1.5">
            <MapPin className="h-4 w-4 text-[#1195e8]" />
            {order.shippingAddress.city}, {order.shippingAddress.state}
          </span>
        ) : null}
        {order.deliverySlot ? <span className="rounded-pill bg-slate-50 px-3 py-1.5">{order.deliverySlot}</span> : null}
        {order.rewardCoinsEarned > 0 ? <span className="rounded-pill bg-amber-50 px-3 py-1.5 text-amber-700">+{order.rewardCoinsEarned} coins</span> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/account/orders/${order.id}`} className="button-secondary px-4 py-2.5 text-sm">
          Track order
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default function AccountDashboardClient({ initialUser }) {
  const { refreshSession } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const fetchDashboardData = useCallback(() => userService.getDashboard(), []);

  useEffect(() => {
    let ignore = false;

    const hydrateDashboard = async () => {
      try {
        const nextDashboard = await fetchDashboardData();

        if (!ignore) {
          setDashboard(nextDashboard);
          setStatus("succeeded");
        }
      } catch (error) {
        if (!ignore) {
          setDashboard(null);
          setErrorMessage(getApiErrorMessage(error, "Unable to load your account right now."));
          setStatus("failed");
        }
      }
    };

    void hydrateDashboard();

    return () => {
      ignore = true;
    };
  }, [fetchDashboardData]);

  const loadDashboard = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const nextDashboard = await fetchDashboardData();
      setDashboard(nextDashboard);
      setStatus("succeeded");
    } catch (error) {
      setDashboard(null);
      setErrorMessage(getApiErrorMessage(error, "Unable to load your account right now."));
      setStatus("failed");
    }
  }, [fetchDashboardData]);

  const handleProfileSave = async (values, avatarFile) => {
    setSaveStatus("saving");
    setSaveMessage("");

    try {
      const payload = new FormData();
      payload.set("name", values.name);
      payload.set("phone", values.phone || "");
      payload.set("removeAvatar", values.removeAvatar ? "true" : "false");
      payload.set("deliveryAddresses", JSON.stringify(values.deliveryAddresses));

      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      await userService.updateProfile(payload);
      const [, nextDashboard] = await Promise.all([refreshSession(), fetchDashboardData()]);
      setDashboard(nextDashboard);
      setStatus("succeeded");
      setErrorMessage("");
      setSaveStatus("succeeded");
      setSaveMessage("Your account details were updated successfully.");
    } catch (error) {
      setSaveStatus("failed");
      setSaveMessage(getApiErrorMessage(error, "We were not able to save your profile right now."));
    }
  };

  const resolvedDashboard = dashboard || {
    user: initialUser,
    stats: {
      totalOrders: 0,
      activeOrders: 0,
      deliveredOrders: 0,
      wishlistCount: 0,
      rewardCoins: Number(initialUser?.rewardCoins || 0),
      addressCount: initialUser?.deliveryAddresses?.length || 0,
    },
    profileCompletion: {
      score: 0,
      completedItems: 0,
      totalItems: 5,
    },
    coins: {
      balance: Number(initialUser?.rewardCoins || 0),
      lifetime: Number(initialUser?.totalCoinsEarned || initialUser?.rewardCoins || 0),
      nextUnlockAt: 100,
      coinsToNextUnlock: 100,
      earningRateDescription: "Earn 1 coin for every INR 20 spent",
    },
    specialOffers: [],
    recentOrders: [],
    wishlistPreview: [],
  };

  const activeOrders = resolvedDashboard.recentOrders.filter(isOrderActive).slice(0, 3);

  if (status === "loading") {
    return <AccountCollectionSkeleton />;
  }

  if (status === "failed") {
    return (
      <StatusBanner
        tone="error"
        title="Your account dashboard could not be loaded"
        message={errorMessage}
        action={
          <button type="button" onClick={() => void loadDashboard()} className="button-primary text-sm">
            Retry account dashboard
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {saveMessage ? (
        <StatusBanner tone={saveStatus === "failed" ? "error" : "success"} title={saveStatus === "failed" ? "Profile update failed" : "Profile updated"} message={saveMessage} />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard eyebrow="Total orders" value={resolvedDashboard.stats.totalOrders} description="Your full order archive with repeat-buy history." icon={ShoppingBag} />
        <StatCard eyebrow="Active orders" value={resolvedDashboard.stats.activeOrders} description="Current deliveries you can track right now." icon={Truck} />
        <StatCard eyebrow="Wishlist picks" value={resolvedDashboard.stats.wishlistCount} description="Saved products ready for one-tap checkout." icon={Heart} />
        <StatCard eyebrow="Profile completion" value={`${resolvedDashboard.profileCompletion.score}%`} description="Complete details keep checkout and delivery smoother." icon={User2} />
      </section>

      <nav className="surface-card sticky top-24 z-10 overflow-x-auto px-3 py-3">
        <div className="flex min-w-max gap-2">
          {quickSectionLinks.map((link) => (
            <a key={link.href} href={link.href} className="rounded-pill border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-950">
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr),minmax(340px,0.95fr)]">
        <div className="space-y-5">
          <section id="activity" className="surface-card scroll-mt-28 p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live order tracking</div>
                <h2 className="mt-2 text-2xl">Recent order progress</h2>
              </div>
              <Link href="/account/orders" className="button-secondary px-4 py-2.5 text-sm">
                View full history
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {activeOrders.length ? (
                activeOrders.map((order) => <OrderTrackerCard key={order.id} order={order} />)
              ) : resolvedDashboard.recentOrders.length ? (
                <div className="rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-600">
                  Your recent orders have already been delivered. Visit your order history anytime for delivery details, payment status, and repeat-order context.
                </div>
              ) : (
                <div className="rounded-[1.45rem] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-600">
                  Once you place your first order, live delivery progress and order milestones will appear here.
                </div>
              )}
            </div>
          </section>

          <section id="wishlist" className="surface-card scroll-mt-28 p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Saved picks</div>
                <h2 className="mt-2 text-2xl">Wishlist preview</h2>
              </div>
              <Link href="/wishlist" className="button-secondary px-4 py-2.5 text-sm">
                Open wishlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {resolvedDashboard.wishlistPreview.length ? (
                resolvedDashboard.wishlistPreview.map((product) => {
                  const productImage = resolveMediaUrl(product.image || product.images?.[0] || "/images/products/produce-crate.svg");

                  return (
                    <Link key={product.id} href={`/products/${product.slug}`} className="flex items-center gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.15rem] bg-slate-50">
                        <Image src={productImage} alt={product.name} width={96} height={96} className="h-16 w-16 object-contain" unoptimized={shouldBypassNextImageOptimization(productImage)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-2 font-semibold text-brand-dark">{product.name}</div>
                        <div className="mt-1 text-sm text-slate-500">{product.unit}</div>
                        <div className="mt-2 text-sm font-semibold text-brand-dark">{formatCurrency(product.price)}</div>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm leading-7 text-slate-600 sm:col-span-2">
                  Heart products you like and they will show up here with quick links back to the storefront.
                </div>
              )}
            </div>
          </section>

          <AccountProfileForm user={resolvedDashboard.user} isSaving={saveStatus === "saving"} onSubmit={handleProfileSave} profileSectionId="profile" addressesSectionId="addresses" />
        </div>

        <div className="space-y-5">
          <section id="rewards" className="surface-card scroll-mt-28 overflow-hidden p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Reward wallet</div>
                <h2 className="mt-2 text-2xl">Coins and loyalty perks</h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff7da] text-amber-600 shadow-soft">
                <Star className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 rounded-[1.45rem] bg-[linear-gradient(135deg,#fff7da,#ffffff)] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700/70">Available balance</div>
              <div className="mt-2 text-4xl font-semibold text-slate-950">{resolvedDashboard.coins.balance}</div>
              <div className="mt-2 text-sm text-slate-600">{resolvedDashboard.coins.earningRateDescription}</div>
              <div className="mt-4 h-2 rounded-full bg-white/90">
                <div className="h-2 rounded-full bg-[linear-gradient(90deg,#f59e0b,#f97316)]" style={{ width: `${Math.min((resolvedDashboard.coins.balance / resolvedDashboard.coins.nextUnlockAt) * 100, 100)}%` }} />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                <span>{resolvedDashboard.coins.coinsToNextUnlock} coins to next unlock</span>
                <span>Target {resolvedDashboard.coins.nextUnlockAt}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Lifetime earned</div>
                <div className="mt-2 text-lg font-semibold text-brand-dark">{resolvedDashboard.coins.lifetime}</div>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Saved addresses</div>
                <div className="mt-2 text-lg font-semibold text-brand-dark">{resolvedDashboard.stats.addressCount}</div>
              </div>
            </div>
          </section>

          <section id="offers" className="surface-card scroll-mt-28 p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Special offers</div>
            <h2 className="mt-2 text-2xl">Offers built for this account</h2>
            <div className="mt-5 space-y-3">
              {resolvedDashboard.specialOffers.map((offer) => (
                <div key={offer.id} className={`rounded-[1.35rem] bg-gradient-to-br p-4 ring-1 ${offerToneClasses[offer.tone] || offerToneClasses.sky}`}>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">{offer.eyebrow}</div>
                  <div className="mt-2 text-lg font-semibold">{offer.title}</div>
                  <p className="mt-2 text-sm leading-6 opacity-80">{offer.description}</p>
                  <Link href={offer.ctaHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    {offer.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Account rhythm</div>
            <h2 className="mt-2 text-2xl">What this profile is ready for</h2>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3">
                <Sparkles className="mt-1 h-4 w-4 shrink-0 text-[#1195e8]" />
                Rewards and order context now live together for faster repeat shopping.
              </div>
              <div className="flex items-start gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3">
                <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#1195e8]" />
                Active orders stay visible with clear delivery milestones and payment state.
              </div>
              <div className="flex items-start gap-3 rounded-[1.25rem] bg-slate-50 px-4 py-3">
                <Heart className="mt-1 h-4 w-4 shrink-0 text-[#1195e8]" />
                Wishlist, cart, and saved addresses stay linked through the same account surface.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
