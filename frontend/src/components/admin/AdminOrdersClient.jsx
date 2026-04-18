"use client";

import { useMemo, useState } from "react";
import { FaClipboardList } from "react-icons/fa";

import AdminMiniStat from "@/components/admin/AdminMiniStat";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSectionCard from "@/components/admin/AdminSectionCard";
import AdminTable from "@/components/admin/AdminTable";
import {
  adminBadgeClass,
  adminInputClass,
  adminPrimaryButtonClass,
} from "@/components/admin/adminStyles";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatCurrency, formatDateTime, titleCase } from "@/lib/format";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/api";

const orderStatusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];
const sortOrders = (items) => [...items].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const getBadgeClass = (value) => {
  if (["paid", "delivered", "confirmed"].includes(value)) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (["processing", "shipped"].includes(value)) {
    return "bg-sky-50 text-sky-700";
  }

  if (["failed", "cancelled", "refunded"].includes(value)) {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-amber-50 text-amber-700";
};

export default function AdminOrdersClient({ initialOrders = [] }) {
  const [orders, setOrders] = useState(sortOrders(initialOrders));
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(initialOrders.map((order) => [order.id, { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus }]))
  );
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!query) {
        return true;
      }

      const normalizedQuery = query.toLowerCase();
      return (
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.user?.name?.toLowerCase().includes(normalizedQuery) ||
        order.user?.email?.toLowerCase().includes(normalizedQuery) ||
        order.orderStatus.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [orders, query]);

  const pendingOrders = orders.filter((order) => ["pending", "confirmed", "processing"].includes(order.orderStatus)).length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === "delivered").length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid").length;
  const revenueProcessed = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);

  const updateOrder = async (orderId) => {
    const draft = drafts[orderId];
    setPendingOrderId(orderId);
    setFeedback(null);

    try {
      const order = await adminService.updateOrder(orderId, draft);

      setOrders((currentOrders) => sortOrders(currentOrders.map((item) => (item.id === order.id ? order : item))));
      setDrafts((currentDrafts) => ({
        ...currentDrafts,
        [order.id]: {
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        },
      }));
      setFeedback({ type: "success", message: `Order #${order.id.slice(-6).toUpperCase()} updated successfully.` });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error, "Unable to update the order right now.") });
    } finally {
      setPendingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Order operations"
        title="Manage orders"
        description="Track fulfillment, payment progression, and delivery updates across every order in a cleaner responsive queue."
        action={
          <div className={adminPrimaryButtonClass}>
            <FaClipboardList className="h-4 w-4" />
            {orders.length} orders
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Orders" value={orders.length.toLocaleString("en-IN")} helper={`${filteredOrders.length} in current view`} tone="emerald" />
        <AdminMiniStat label="In progress" value={pendingOrders.toLocaleString("en-IN")} helper="Pending to processing stages" tone="amber" />
        <AdminMiniStat label="Delivered" value={deliveredOrders.toLocaleString("en-IN")} helper="Completed fulfillment" tone="blue" />
        <AdminMiniStat label="Revenue" value={formatCurrency(revenueProcessed)} helper={`${paidOrders} paid orders`} tone="violet" />
      </div>

      <AdminSectionCard
        title="Order queue"
        description="Update order lifecycle and payment state without leaving the dashboard."
        action={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${adminInputClass} md:w-[20rem]`}
            placeholder="Search by order or customer"
          />
        }
      >
        {feedback ? (
          <div
            className={cn(
              "mb-4 rounded-[1.2rem] px-4 py-3 text-sm font-medium",
              feedback.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            )}
          >
            {feedback.message}
          </div>
        ) : null}

        <AdminTable
          minWidthClassName="min-w-[1080px]"
          columns={[
            { key: "order", label: "Order" },
            { key: "customer", label: "Customer" },
            { key: "amount", label: "Amount" },
            { key: "status", label: "Current status" },
            { key: "controls", label: "Update controls" },
          ]}
          emptyMessage="No orders found."
        >
          {filteredOrders.length
            ? filteredOrders.map((order) => {
                const draft = drafts[order.id] || { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus };
                const hasChanges = draft.orderStatus !== order.orderStatus || draft.paymentStatus !== order.paymentStatus;

                return (
                  <tr key={order.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div>
                        <p className="font-semibold text-slate-950">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div>
                        <p className="font-medium text-slate-900">{order.user?.name || order.shippingAddress?.fullName || "Guest"}</p>
                        <p className="text-xs text-slate-500">{order.user?.email || order.shippingAddress?.phone || "--"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <p className="font-semibold text-slate-950">{formatCurrency(order.totalPrice)}</p>
                      <p className="text-xs text-slate-500">{order.orderItems.length} items</p>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="space-y-2">
                        <span className={cn(adminBadgeClass, getBadgeClass(order.orderStatus))}>{titleCase(order.orderStatus)}</span>
                        <span className={cn(adminBadgeClass, getBadgeClass(order.paymentStatus))}>{titleCase(order.paymentStatus)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 first:pl-5 last:pr-5">
                      <div className="flex min-w-[300px] flex-col gap-3 xl:flex-row xl:items-center">
                        <select
                          value={draft.orderStatus}
                          onChange={(event) =>
                            setDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [order.id]: {
                                ...draft,
                                orderStatus: event.target.value,
                              },
                            }))
                          }
                          className={`${adminInputClass} xl:w-[11rem]`}
                        >
                          {orderStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {titleCase(status)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={draft.paymentStatus}
                          onChange={(event) =>
                            setDrafts((currentDrafts) => ({
                              ...currentDrafts,
                              [order.id]: {
                                ...draft,
                                paymentStatus: event.target.value,
                              },
                            }))
                          }
                          className={`${adminInputClass} xl:w-[11rem]`}
                        >
                          {paymentStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {titleCase(status)}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!hasChanges || pendingOrderId === order.id}
                          onClick={() => updateOrder(order.id)}
                          className={adminPrimaryButtonClass}
                        >
                          {pendingOrderId === order.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            : null}
        </AdminTable>
      </AdminSectionCard>
    </div>
  );
}
