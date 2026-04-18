"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Download,
  MapPin,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  XCircle,
} from "lucide-react";

import { AccountCollectionSkeleton } from "@/components/shared/Skeletons";
import StatusBanner from "@/components/shared/StatusBanner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl, shouldBypassNextImageOptimization } from "@/lib/api-config";
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

const formatOrderCode = (orderId = "") => orderId.slice(-8).toUpperCase();

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildInvoiceMarkup = (order) => {
  const invoiceNumber = `INV-${formatOrderCode(order.id)}-${new Date(order.createdAt).getFullYear()}`;
  const itemRows = (order.orderItems || [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.unit || "-")}</td>
          <td>${escapeHtml(String(item.quantity || 0))}</td>
          <td>${escapeHtml(formatCurrency(item.price || 0))}</td>
          <td>${escapeHtml(formatCurrency(item.lineTotal || 0))}</td>
        </tr>`
    )
    .join("");

  const addressLines = [
    order.shippingAddress?.fullName,
    order.shippingAddress?.phone,
    order.shippingAddress?.addressLine1,
    order.shippingAddress?.addressLine2,
    order.shippingAddress?.landmark,
    [order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", "),
    order.shippingAddress?.country,
  ]
    .filter(Boolean)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${escapeHtml(invoiceNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 32px; }
      .header { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; margin-bottom:32px; }
      .brand { font-size: 28px; font-weight: 700; color: #1195e8; }
      .muted { color:#64748b; font-size: 13px; line-height: 1.6; }
      .grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; margin-bottom:24px; }
      .card { border:1px solid #e2e8f0; border-radius:16px; padding:18px; }
      .label { font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:#94a3b8; margin-bottom:8px; }
      .value { font-size:15px; font-weight:600; color:#0f172a; }
      table { width:100%; border-collapse:collapse; margin-top:24px; }
      th, td { text-align:left; padding:12px; border-bottom:1px solid #e2e8f0; font-size:14px; }
      th { color:#64748b; text-transform:uppercase; font-size:11px; letter-spacing:0.14em; }
      .totals { margin-left:auto; width:320px; margin-top:24px; }
      .totals-row { display:flex; justify-content:space-between; padding:8px 0; color:#475569; }
      .totals-row.total { border-top:1px solid #e2e8f0; margin-top:8px; padding-top:12px; font-weight:700; color:#0f172a; }
      .footer { margin-top:32px; font-size:12px; color:#64748b; line-height:1.6; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="brand">FreshCart</div>
        <div class="muted">Premium grocery delivery invoice</div>
      </div>
      <div>
        <div class="label">Invoice number</div>
        <div class="value">${escapeHtml(invoiceNumber)}</div>
        <div class="muted">Order #${escapeHtml(formatOrderCode(order.id))}</div>
        <div class="muted">Placed on ${escapeHtml(formatDate(order.createdAt, { day: "numeric", month: "short", year: "numeric" }))}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label">Billing and delivery</div>
        <div class="muted">${addressLines}</div>
      </div>
      <div class="card">
        <div class="label">Payment details</div>
        <div class="value">${escapeHtml(formatOrderStatus(order.paymentMethod))}</div>
        <div class="muted">Payment status: ${escapeHtml(formatOrderStatus(order.paymentStatus))}</div>
        <div class="muted">Order status: ${escapeHtml(formatOrderStatus(order.orderStatus))}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Unit</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Line total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div class="totals">
      <div class="totals-row"><span>Items subtotal</span><strong>${escapeHtml(formatCurrency(order.itemsPrice || 0))}</strong></div>
      <div class="totals-row"><span>Shipping</span><strong>${escapeHtml(formatCurrency(order.shippingPrice || 0))}</strong></div>
      <div class="totals-row"><span>Tax</span><strong>${escapeHtml(formatCurrency(order.taxPrice || 0))}</strong></div>
      <div class="totals-row total"><span>Total</span><strong>${escapeHtml(formatCurrency(order.totalPrice || 0))}</strong></div>
    </div>

    <div class="footer">
      This invoice was generated from your FreshCart account. Use your browser's Save as PDF option after print opens if you want a downloadable copy.
    </div>
  </body>
</html>`;
};

export default function OrderDetailClient({ user, orderId }) {
  const dispatch = useAppDispatch();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [busyAction, setBusyAction] = useState({ type: "", orderId: "" });
  const [actionFeedback, setActionFeedback] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      setStatus("loading");
      setErrorMessage("");

      try {
        const nextOrder = await orderService.getOrderById(orderId);

        if (!ignore) {
          setOrder(nextOrder);
          setStatus("succeeded");
        }
      } catch (error) {
        if (!ignore) {
          setOrder(null);
          setErrorMessage(getApiErrorMessage(error, "Unable to load this order right now."));
          setStatus("failed");
        }
      }
    };

    void loadOrder();

    return () => {
      ignore = true;
    };
  }, [orderId]);

  const handleReorder = async () => {
    if (!order) {
      return;
    }

    setBusyAction({ orderId: order.id, type: "reorder" });
    setActionFeedback(null);

    try {
      const result = await orderService.reorderOrder(order.id);
      await dispatch(fetchCart());

      const addedCount = Number(result?.summary?.addedCount || 0);
      const skippedCount = Number(result?.summary?.skippedCount || 0);
      const orderCode = formatOrderCode(order.id);

      setActionFeedback({
        tone: addedCount ? "success" : "warning",
        title: addedCount ? "Items added to cart" : "Nothing new was added",
        message: addedCount
          ? `${addedCount} item${addedCount === 1 ? "" : "s"} from order #${orderCode} are back in your cart.${skippedCount ? ` ${skippedCount} item${skippedCount === 1 ? " was" : "s were"} skipped because stock changed.` : ""}`
          : `We could not add products from order #${orderCode} because they are unavailable or already at the maximum available quantity in your cart.`,
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

  const handleCancel = async () => {
    if (!order) {
      return;
    }

    setBusyAction({ orderId: order.id, type: "cancel" });
    setActionFeedback(null);

    try {
      const updatedOrder = await orderService.cancelOrder(order.id);
      setOrder(updatedOrder);
      setActionFeedback({
        tone: "success",
        title: "Order cancelled",
        message: `Order #${formatOrderCode(order.id)} was cancelled successfully. Inventory and reward coins were updated automatically where needed.`,
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

  const handlePrintInvoice = () => {
    if (!order || typeof window === "undefined") {
      return;
    }

    const invoiceWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=820");

    if (!invoiceWindow) {
      setActionFeedback({
        tone: "warning",
        title: "Pop-up blocked",
        message: "Allow pop-ups for this site to print or save your invoice as PDF.",
      });
      return;
    }

    invoiceWindow.document.open();
    invoiceWindow.document.write(buildInvoiceMarkup(order));
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
  };

  if (status === "loading") {
    return <AccountCollectionSkeleton />;
  }

  if (status === "failed" || !order) {
    return (
      <StatusBanner
        tone="error"
        title="Order unavailable"
        message={errorMessage || "We could not find this order."}
        action={<Link href="/account/orders" className="button-primary text-sm">Back to orders</Link>}
      />
    );
  }

  const reorderBusy = busyAction.orderId === order.id && busyAction.type === "reorder";
  const cancelBusy = busyAction.orderId === order.id && busyAction.type === "cancel";
  const invoiceNumber = `INV-${formatOrderCode(order.id)}-${new Date(order.createdAt).getFullYear()}`;

  return (
    <div className="space-y-5">
      <section className="surface-card p-5 sm:p-6 print-hidden">
        <div className="flex flex-col gap-4">
          <Link href="/account/orders" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" />
            Back to order history
          </Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Track order</div>
              <h1 className="mt-2 text-3xl sm:text-4xl">Order #{formatOrderCode(order.id)}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Placed on {formatDate(order.createdAt, { day: "numeric", month: "long", year: "numeric" })}. This detail page keeps delivery progress, order totals, invoice details, and address information together.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="pill-chip bg-brand-soft/75 text-brand-dark">{formatOrderStatus(order.orderStatus)}</span>
              <span className="pill-chip bg-slate-100 text-slate-600">{formatOrderStatus(order.paymentStatus)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleReorder} disabled={reorderBusy || cancelBusy} className="button-secondary px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">
              <RefreshCw className={cn("h-4 w-4", reorderBusy ? "animate-spin" : "")} />
              {reorderBusy ? "Adding to cart..." : "Reorder items"}
            </button>
            {canCancelOrder(order) ? (
              <button type="button" onClick={handleCancel} disabled={reorderBusy || cancelBusy} className="button-secondary px-4 py-2.5 text-sm text-rose-600 disabled:cursor-not-allowed disabled:opacity-60">
                <XCircle className="h-4 w-4" />
                {cancelBusy ? "Cancelling..." : "Cancel order"}
              </button>
            ) : null}
            <button type="button" onClick={handlePrintInvoice} className="button-primary px-4 py-2.5 text-sm">
              <Download className="h-4 w-4" />
              Download invoice
            </button>
          </div>
        </div>
      </section>

      {actionFeedback ? (
        <StatusBanner
          tone={actionFeedback.tone}
          title={actionFeedback.title}
          message={actionFeedback.message}
          className="shadow-soft print-hidden"
          action={actionFeedback.actionHref ? <Link href={actionFeedback.actionHref} className="button-secondary px-4 py-2.5 text-sm">{actionFeedback.actionLabel}</Link> : null}
        />
      ) : null}

      <section className="surface-card p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <Truck className="h-4 w-4 text-[#1195e8]" />
          Delivery progress
        </div>
        <div className="mt-4 space-y-4 rounded-[1.4rem] border border-slate-100 bg-[#fbfcf8] p-4 sm:p-5">
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
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.2rem] bg-white px-4 py-3 shadow-soft">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Delivery slot</div>
              <div className="mt-2 font-semibold text-brand-dark">{order.deliverySlot || "Fastest available slot"}</div>
            </div>
            <div className="rounded-[1.2rem] bg-white px-4 py-3 shadow-soft">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Order placed</div>
              <div className="mt-2 font-semibold text-brand-dark">{formatDate(order.createdAt)}</div>
            </div>
            <div className="rounded-[1.2rem] bg-white px-4 py-3 shadow-soft">
              <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Reward coins</div>
              <div className="mt-2 font-semibold text-brand-dark">+{order.rewardCoinsEarned || 0}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr),360px]">
        <section className="space-y-5">
          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <ShoppingBag className="h-4 w-4 text-[#1195e8]" />
              Ordered items
            </div>
            <div className="mt-5 space-y-3">
              {order.orderItems.map((item) => {
                const productImage = resolveMediaUrl(item.image || "/images/products/produce-crate.svg");
                const productHref = item.slug ? `/products/${item.slug}` : "/products";

                return (
                  <div key={item.id} className="flex items-center gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-soft">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.15rem] bg-slate-50">
                      <Image src={productImage} alt={item.name} width={96} height={96} className="h-16 w-16 object-contain" unoptimized={shouldBypassNextImageOptimization(productImage)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={productHref} className="line-clamp-2 font-semibold text-brand-dark hover:text-[#1195e8]">{item.name}</Link>
                      <div className="mt-1 text-sm text-slate-500">Qty {item.quantity} | {item.unit}</div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-500">
                        <span>{formatCurrency(item.price)} each</span>
                        <span className="rounded-pill bg-slate-100 px-2.5 py-1">Line total {formatCurrency(item.lineTotal)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="invoice-sheet surface-card p-5 sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Invoice view</div>
                <h2 className="mt-2 text-2xl">Tax and payment summary</h2>
              </div>
              <div className="rounded-pill bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{invoiceNumber}</div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.16em] text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">Item</th>
                    <th className="pb-3 pr-4 font-semibold">Unit</th>
                    <th className="pb-3 pr-4 font-semibold">Qty</th>
                    <th className="pb-3 pr-4 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="py-4 pr-4 font-medium text-brand-dark">{item.name}</td>
                      <td className="py-4 pr-4">{item.unit}</td>
                      <td className="py-4 pr-4">{item.quantity}</td>
                      <td className="py-4 pr-4">{formatCurrency(item.price)}</td>
                      <td className="py-4 font-semibold text-brand-dark">{formatCurrency(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 ml-auto max-w-sm space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Items subtotal</span><span className="font-semibold text-brand-dark">{formatCurrency(order.itemsPrice)}</span></div>
              <div className="flex items-center justify-between"><span>Shipping</span><span className="font-semibold text-brand-dark">{formatCurrency(order.shippingPrice)}</span></div>
              <div className="flex items-center justify-between"><span>Tax</span><span className="font-semibold text-brand-dark">{formatCurrency(order.taxPrice)}</span></div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base"><span className="font-semibold text-brand-dark">Total paid</span><span className="font-semibold text-brand-dark">{formatCurrency(order.totalPrice)}</span></div>
            </div>
          </section>
        </section>

        <aside className="space-y-5">
          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <MapPin className="h-4 w-4 text-[#1195e8]" />
              Delivery address
            </div>
            <div className="mt-4 rounded-[1.35rem] bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
              <div className="font-semibold text-brand-dark">{order.shippingAddress?.fullName}</div>
              <div>{order.shippingAddress?.phone}</div>
              <div className="mt-2">{order.shippingAddress?.addressLine1}</div>
              {order.shippingAddress?.addressLine2 ? <div>{order.shippingAddress.addressLine2}</div> : null}
              <div>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(", ")}</div>
              <div>{order.shippingAddress?.country}</div>
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <ReceiptText className="h-4 w-4 text-[#1195e8]" />
              Payment snapshot
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Payment method</div>
                <div className="mt-2 font-semibold text-brand-dark">{formatOrderStatus(order.paymentMethod)}</div>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Payment status</div>
                <div className="mt-2 font-semibold text-brand-dark">{formatOrderStatus(order.paymentStatus)}</div>
              </div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Notes</div>
                <div className="mt-2 font-semibold text-brand-dark">{order.notes || "No additional delivery notes were added."}</div>
              </div>
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <ShieldCheck className="h-4 w-4 text-[#1195e8]" />
              Support and records
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">Use the invoice button above to print or save this order as PDF for reimbursements or personal records.</div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">If the order is still pending, confirmed, or processing, you can cancel it from this page and inventory will be restored automatically.</div>
              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3">Reorder adds only in-stock units back to your cart, so it stays accurate even when inventory changes.</div>
            </div>
          </section>

          <section className="surface-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Star className="h-4 w-4 text-amber-500" />
              Reward impact
            </div>
            <div className="mt-4 rounded-[1.35rem] bg-[linear-gradient(135deg,#fff7da,#ffffff)] px-4 py-4 text-sm leading-7 text-slate-600">
              <div className="text-3xl font-semibold text-slate-950">+{order.rewardCoinsEarned || 0}</div>
              <p className="mt-2">These loyalty coins are tied to this order and update automatically if payment or cancellation status changes.</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
