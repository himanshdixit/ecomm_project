import asyncHandler from "express-async-handler";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { serializeOrder, serializeProduct } from "../utils/serializers.js";

const DASHBOARD_MONTHS = 6;

const getMonthSeries = (months = DASHBOARD_MONTHS) => {
  const now = new Date();
  const series = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    series.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date),
    });
  }

  return series;
};

const getSeriesStartDate = (months = DASHBOARD_MONTHS) => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
};

const mergeMonthlySeries = (template, aggregationRows, valueKey) => {
  const rowMap = new Map(aggregationRows.map((row) => [row._id, Number(row[valueKey] || 0)]));

  return template.map((entry) => ({
    month: entry.label,
    value: rowMap.get(entry.key) || 0,
  }));
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const monthSeries = getMonthSeries();
  const startDate = getSeriesStartDate();

  const [
    userCount,
    productCount,
    orderCount,
    revenueAggregation,
    orderStatusBreakdown,
    orderTrends,
    userTrends,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]),
    Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m",
              date: "$createdAt",
            },
          },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(6),
    Product.find({ isActive: true, stock: { $lte: 10 } })
      .populate("category", "name slug")
      .sort({ stock: 1, createdAt: -1 })
      .limit(6),
  ]);

  const monthlyRevenue = mergeMonthlySeries(monthSeries, orderTrends, "revenue");
  const monthlyOrders = mergeMonthlySeries(monthSeries, orderTrends, "orders");
  const monthlyUsers = mergeMonthlySeries(monthSeries, userTrends, "users");
  const totalRevenue = Number(revenueAggregation[0]?.totalRevenue || 0);

  res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully.",
    data: {
      summary: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        revenue: totalRevenue,
        averageOrderValue: orderCount > 0 ? Number((totalRevenue / orderCount).toFixed(2)) : 0,
      },
      charts: {
        monthlyRevenue,
        monthlyOrders,
        monthlyUsers,
        ordersByStatus: orderStatusBreakdown.map((entry) => ({
          status: entry._id || "unknown",
          count: Number(entry.count || 0),
        })),
      },
      recentOrders: recentOrders.map(serializeOrder),
      lowStockProducts: lowStockProducts.map(serializeProduct),
    },
  });
});
