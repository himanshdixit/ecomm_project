"use client";

import { motion } from "framer-motion";
import { FaBoxOpen, FaChartLine, FaClipboardList, FaUsers } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSectionCard from "@/components/admin/AdminSectionCard";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminTable from "@/components/admin/AdminTable";
import { formatCompactNumber, formatCurrency, formatDateTime, titleCase } from "@/lib/format";

const statusColors = ["#10B981", "#0EA5E9", "#F59E0B", "#8B5CF6", "#F97316", "#EF4444"];

const statCards = [
  {
    key: "revenue",
    title: "Revenue",
    description: "Gross revenue captured across all orders.",
    icon: FaChartLine,
    tone: "emerald",
    type: "currency",
  },
  {
    key: "orders",
    title: "Orders",
    description: "Confirmed, pending, and fulfilled orders.",
    icon: FaClipboardList,
    tone: "blue",
  },
  {
    key: "users",
    title: "Users",
    description: "Registered shoppers and admin operators.",
    icon: FaUsers,
    tone: "violet",
  },
  {
    key: "products",
    title: "Products",
    description: "Active and inactive items in the catalog.",
    icon: FaBoxOpen,
    tone: "amber",
  },
];

export default function AdminDashboardClient({ dashboardData, adminName }) {
  const summary = dashboardData?.summary || {};
  const charts = dashboardData?.charts || {};
  const recentOrders = dashboardData?.recentOrders || [];
  const lowStockProducts = dashboardData?.lowStockProducts || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin dashboard"
        title="Business command center"
        description={`A live overview of sales, users, orders, and inventory health for ${adminName || "your team"}.`}
        action={
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            Avg. order value {formatCurrency(summary.averageOrderValue || 0)}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <AdminStatCard
              title={card.title}
              value={summary[card.key] || 0}
              description={card.description}
              icon={card.icon}
              tone={card.tone}
              type={card.type}
            />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,1fr)]">
        <AdminSectionCard title="Revenue trend" description="Monthly revenue performance over the last six months.">
          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyRevenue || []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                  tickFormatter={(value) => formatCompactNumber(value)}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Order mix" description="Distribution of order pipeline states.">
          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts.ordersByStatus || []} dataKey="count" nameKey="status" innerRadius={70} outerRadius={100} paddingAngle={3}>
                  {(charts.ordersByStatus || []).map((entry, index) => (
                    <Cell key={`${entry.status}-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, titleCase(name)]} />
                <Legend formatter={(value) => titleCase(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)]">
        <AdminSectionCard title="User and order growth" description="New users and orders created each month.">
          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(charts.monthlyOrders || []).map((entry, index) => ({
                  month: entry.month,
                  orders: entry.value,
                  users: charts.monthlyUsers?.[index]?.value || 0,
                }))}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#0EA5E9" radius={[10, 10, 0, 0]} />
                <Bar dataKey="users" fill="#8B5CF6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminSectionCard>

        <AdminSectionCard title="Inventory watch" description="Products that need immediate replenishment.">
          <div className="space-y-3">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{product.category?.name || "Uncategorized"}</p>
                    </div>
                    <div className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-600">
                      {product.stock} left
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{product.unit}</span>
                    <span>{formatCurrency(product.price)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Inventory is healthy right now.
              </div>
            )}
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard title="Recent orders" description="Latest customer orders flowing through the system.">
        <AdminTable
          minWidthClassName="min-w-[760px]"
          columns={[
            { key: "order", label: "Order" },
            { key: "customer", label: "Customer" },
            { key: "total", label: "Total" },
            { key: "status", label: "Status" },
            { key: "createdAt", label: "Placed" },
          ]}
          emptyMessage="No recent orders yet."
        >
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <tr key={order.id} className="transition hover:bg-slate-50/80">
                <td className="px-4 py-4 first:pl-5 last:pr-5">
                  <div>
                    <p className="font-semibold text-slate-950">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{order.orderItems.length} items</p>
                  </div>
                </td>
                <td className="px-4 py-4 first:pl-5 last:pr-5">
                  <div>
                    <p className="font-medium text-slate-900">{order.user?.name || "Guest"}</p>
                    <p className="text-xs text-slate-500">{order.user?.email || "--"}</p>
                  </div>
                </td>
                <td className="px-4 py-4 first:pl-5 last:pr-5 font-semibold text-slate-950">{formatCurrency(order.totalPrice)}</td>
                <td className="px-4 py-4 first:pl-5 last:pr-5">
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    {titleCase(order.orderStatus)}
                  </span>
                </td>
                <td className="px-4 py-4 first:pl-5 last:pr-5 text-sm text-slate-500">{formatDateTime(order.createdAt)}</td>
              </tr>
            ))
          ) : null}
        </AdminTable>
      </AdminSectionCard>
    </div>
  );
}
