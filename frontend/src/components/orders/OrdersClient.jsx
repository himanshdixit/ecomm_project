"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Clock3, MapPin, RefreshCw, Truck, XCircle } from "lucide-react";

import EmptyState from "@/components/shared/EmptyState";
import { AccountCollectionSkeleton } from "@/components/shared/Skeletons";
import StatusBanner from "@/components/shared/StatusBanner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatDate } from "@/lib/format";
import { cn, formatCurrency } from "@/lib/utils";
import { orderService } from "@/services/api";
import { fetchCart } from "@/store/slices/cartSlice";

const ORDER_PROGRESS = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
};
const ORDER_STEPS = ["Placed", "Confirmed", "Packed", "On the way", "Delivered"];
const USER_CANCELLABLE_ORDER_STATUSES = ["pending", "confirmed", "processing"];

const getProgressWidth = (orderStatus) => {
  if (orderStatus === "cancelled") {
    return "0%";
  }

  return `${((ORDER_PROGRESS[orderStatus] || 0) / (ORDER_STEPS.length - 1)) * 100}%`;
};

const formatOrderStatus = (status = "") => {
  if (!status) {
    return "Pending";
  }

  const normalizedStatus = String(status).replace(/_/g, " ");
  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
};

const canCancelOrder = (order) => USER_CANCELLABLE_ORDER_STATUSES.includes(order.orderStatus);

export default function OrdersClient({ user, embedded = false }) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const focusedOrderId = searchParams.get("focus") || "";
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [busyAction, setBusyAction] = useState({ orderId: "", type: "" });
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const nextOrders = await orderService.getMyOrders();

        if (!ignore) {
          setOrders(nextOrders || []);
          setStatus("succeeded");
        }
      } catch (error) {
        if (!ignore) {
          setOrders([]);
          setErrorMessage(getApiErrorMessage(error, "Unable to load your orders right now."));
          setStatus("failed");
        }
      }
    };

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (status !== "succeeded" || !focusedOrderId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(`order-${focusedOrderId}`);

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [focusedOrderId, orders.length, status]);

  const handleReorder = async (order) => {
    setBusyAction({ orderId: order.id, type: "reorder" });
    setActionFeedback(null);

    try {
      const result = await orderService.reorderOrder(order.id);
      await dispatch(fetchCart());

      const addedCount = Number(result?.summary?.addedCount || 0);
      const skippedCount = Number(result?.summary?.skippedCount || 0);
      const orderCode = order.id.slice(-8).toUpperCase();

      setActionFeedback({
        tone: addedCount ? "success" : "warning",
        title: addedCount ? "Items added to cart" : "Nothing new was added",
        message: addedCount
          ? `${addedCount} item${addedCount === 1 ? "" : "s"} from order #${orderCode} are back in your cart.${skippedCount ? ` ${skippedCount} item${skippedCount === 1 ? " was" : "s were"} skipped because stock changed.` : ""}`
          : skippedCount
            ? `We could not add products from order #${orderCode} because they are unavailable or already at the maximum available quantity in your cart.`
            : `Order #${orderCode} did not contain any items that could be added right now.`,
        actionHref: addedCount ? "/cart" : "/products",
        actionLabel: addedCount ? "Open cart" : "Browse products",
      });
    } catch (error) {
      setActionFeedback({
        tone: "error",
        title: "Reorder failed",
        message: getApiErrorMessage(error, "We could not add those items back to your cart right now."),
      });
    } finally {
      setBusyAction({ orderId: "", type: "" });
    }
  };

  const handleCancel = async (order) => {
    setBusyAction({ orderId: order.id, type: "cancel" });
    setActionFeedback(null);

    try {
      const updatedOrder = await orderService.cancelOrder(order.id);

      setOrders((currentOrders) => currentOrders.map((entry) => (entry.id === updatedOrder.id ? updatedOrder : entry)));
      setActionFeedback({
        tone: "success",
        title: "Order cancelled",
        message: `Order #${order.id.slice(-8).toUpperCase()} was cancelled successfully. Inventory and reward coins were updated automatically where needed.`,
      });
    } catch (error) {
      setActionFeedback({
        tone: "error",
        title: "Unable to cancel order",
        message: getApiErrorMessage(error, "This order could not be cancelled right now."),
      });
    } finally {
      setBusyAction({ orderId: "", type: "" });
    }
  };

  if (status === "loading") {
    return <AccountCollectionSkeleton />;
  }

  if (status === "failed") {
    return (
      <StatusBanner
        tone="error"
        title="Order history unavailable"
        message={errorMessage}
        action={
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="button-primary text-sm">
            Retry orders
          </button>
        }
      />
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description={`Once ${user?.name || "you"} complete checkout, recent orders and delivery status will appear here.`}
        action={
          <Link href="/products" className="button-primary">
            Start shopping
          </Link>
        }
      />
    );
  }

  const content = (
    <div className="space-y-5">
      {!embedded ? (
        <div className="max-w-2xl space-y-3">
          <div className="pill-chip w-fit">Order history</div>
          <h1 className="text-4xl sm:text-5xl">Every checkout, tracked in one place.</h1>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">Review totals, delivery status, payment state, and the exact items that went into each order.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Order history</div>
          <h1 className="text-3xl sm:text-4xl">Track every delivery and reorder with confidence.</h1>
          <p className="text-sm leading-7 text-slate-600">Your full order list stays connected to payments, delivery status, and coin rewards.</p>
        </div>
      )}

      {searchParams.get("placed") ? (
        <StatusBanner tone="success" title="Order placed" message="Your order was placed successfully and is now visible below." className="shadow-soft" />
      ) : null}

      {actionFeedback ? (
        <StatusBanner
          tone={actionFeedback.tone}
          title={actionFeedback.title}
          message={actionFeedback.message}
          className="shadow-soft"
          action={actionFeedback.actionHref ? <Link href={actionFeedback.actionHref} className="button-secondary px-4 py-2.5 text-sm">{actionFeedback.actionLabel}</Link> : null}
        />
      ) : null}

      <div className="space-y-4">
        {orders.map((order) => {
          const reorderBusy = busyAction.orderId === order.id && busyAction.type === "reorder";
          const cancelBusy = busyAction.orderId === order.id && busyAction.type === "cancel";
          const primaryProductHref = order.orderItems[0]?.slug ? `/products/${order.orderItems[0].slug}` : "/products";

          return (
            <article
              key={order.id}
              id={`order-${order.id}`}
              className={cn(
                "surface-card scroll-mt-28 space-y-5 p-5 transition sm:p-6",
                focusedOrderId === order.id ? "ring-2 ring-[#1195e8]/25 shadow-[0_18px_38px_rgba(17,149,232,0.12)]" : ""
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Order #{order.id.slice(-8).toUpperCase()}</div>
                  <h2 className="mt-2 text-2xl text-brand-dark">{formatDate(order.createdAt)}</h2>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                    {order.shippingAddress?.city ? (
                      <span className="inline-flex items-center gap-2 rounded-pill bg-slate-50 px-3 py-1.5">
                        <MapPin className="h-4 w-4 text-[#1195e8]" />
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                    ) : null}
                    {order.deliverySlot ? (
                      <span className="inline-flex items-center gap-2 rounded-pill bg-slate-50 px-3 py-1.5">
                        <Clock3 className="h-4 w-4 text-[#1195e8]" />
                        {order.deliverySlot}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="pill-chip bg-brand-soft/75 text-brand-dark">{formatOrderStatus(order.orderStatus)}</span>
                  <span className="pill-chip bg-slate-100 text-slate-600">{formatOrderStatus(order.paymentStatus)}</span>
                </div>
              </div>

              <div className="space-y-3 rounded-[1.35rem] border border-slate-100 bg-[#fbfcf8] p-4">
                <div className="relative h-2 rounded-full bg-slate-100">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#7ab640,#1195e8)]" style={{ width: getProgressWidth(order.orderStatus) }} />
                </div>
                <div className="grid grid-cols-5 gap-2 text-[11px] font-medium text-slate-500">
                  {ORDER_STEPS.map((step, index) => {
                    const active = order.orderStatus !== "cancelled" && (ORDER_PROGRESS[order.orderStatus] || 0) >= index;

                    return (
                      <div key={step} className={active ? "font-semibold text-brand-dark" : "text-slate-400"}>
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-4">
                <div className="rounded-[1.25rem] bg-brand-soft/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Payment</div>
                  <div className="mt-2 font-semibold text-brand-dark">{formatOrderStatus(order.paymentMethod)}</div>
                </div>
                <div className="rounded-[1.25rem] bg-brand-soft/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Items</div>
                  <div className="mt-2 font-semibold text-brand-dark">{order.orderItems.length} products</div>
                </div>
                <div className="rounded-[1.25rem] bg-brand-soft/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</div>
                  <div className="mt-2 font-semibold text-brand-dark">{formatCurrency(order.totalPrice)}</div>
                </div>
                <div className="rounded-[1.25rem] bg-brand-soft/60 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Reward coins</div>
                  <div className="mt-2 font-semibold text-brand-dark">+{order.rewardCoinsEarned || 0}</div>
                </div>
              </div>

              <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Delivering to</div>
                <div className="mt-2 font-semibold text-brand-dark">{order.shippingAddress?.fullName || user?.name || "Customer"}</div>
                <div>{order.shippingAddress?.addressLine1}</div>
                {order.shippingAddress?.addressLine2 ? <div>{order.shippingAddress.addressLine2}</div> : null}
                <div>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => void handleReorder(order)} disabled={reorderBusy || cancelBusy} className="button-secondary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
                  <RefreshCw className={cn("h-4 w-4", reorderBusy ? "animate-spin" : "")} />
                  {reorderBusy ? "Adding to cart..." : "Reorder items"}
                </button>
                {canCancelOrder(order) ? (
                  <button type="button" onClick={() => void handleCancel(order)} disabled={reorderBusy || cancelBusy} className="button-secondary px-4 py-2.5 text-sm text-rose-600 disabled:cursor-not-allowed disabled:opacity-60">
                    <XCircle className="h-4 w-4" />
                    {cancelBusy ? "Cancelling..." : "Cancel order"}
                  </button>
                ) : null}
                <Link href={`/account/orders/${order.id}`} className="button-secondary px-4 py-2.5 text-sm">
                  <Truck className="h-4 w-4" />
                  Track order
                </Link>
                <Link href={primaryProductHref} className="button-secondary px-4 py-2.5 text-sm">
                  <ArrowRight className="h-4 w-4" />
                  View first item
                </Link>
              </div>

              <div className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-white px-4 py-3 shadow-soft">
                    <div>
                      <div className="font-semibold text-brand-dark">{item.name}</div>
                      <div className="text-sm text-slate-500">Qty {item.quantity} | {item.unit}</div>
                    </div>
                    <div className="font-semibold text-brand-dark">{formatCurrency(item.lineTotal)}</div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {!embedded ? (
        <div className="flex justify-end">
          <Link href="/products" className="button-secondary px-4 py-3 text-sm">
            Continue shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );

  if (embedded) {
    return content;
  }

  return <main className="page-shell section-gap">{content}</main>;
}
