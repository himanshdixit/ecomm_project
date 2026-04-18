import asyncHandler from "express-async-handler";

import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from "../constants/index.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { resolveProductVariant } from "../utils/productVariants.js";
import { serializeCart, serializeOrder } from "../utils/serializers.js";

const CATEGORY_SELECT = "name shortName slug description image tint deliveryTime isFeatured parent root level sortOrder pathIds pathNames pathSlugs";
const USER_CANCELLABLE_ORDER_STATUSES = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING];

const getUserWithCart = (userId) =>
  User.findById(userId).populate({
    path: "cartItems.product",
    match: { isActive: true },
    populate: {
      path: "category",
      select: CATEGORY_SELECT,
    },
  });

const isShippingAddressValid = (address) =>
  address &&
  address.fullName &&
  address.phone &&
  address.addressLine1 &&
  address.city &&
  address.state &&
  address.postalCode;

const calculateRewardCoins = (totalPrice) => Math.max(Math.floor(Number(totalPrice || 0) / 20), 0);

const grantRewardCoins = async (userId, rewardCoins) => {
  if (!userId || rewardCoins <= 0) {
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  user.rewardCoins = Number(user.rewardCoins || 0) + rewardCoins;
  user.totalCoinsEarned = Number(user.totalCoinsEarned || 0) + rewardCoins;
  await user.save();
};

const revokeRewardCoins = async (userId, rewardCoins) => {
  if (!userId || rewardCoins <= 0) {
    return;
  }

  const user = await User.findById(userId);

  if (!user) {
    return;
  }

  user.rewardCoins = Math.max(Number(user.rewardCoins || 0) - rewardCoins, 0);
  user.totalCoinsEarned = Math.max(Number(user.totalCoinsEarned || 0) - rewardCoins, 0);
  await user.save();
};

const restoreOrderInventory = async (order) => {
  for (const item of order.orderItems || []) {
    const product = await Product.findById(item.product);

    if (!product) {
      continue;
    }

    let resolvedVariant = null;

    try {
      resolvedVariant = resolveProductVariant(product, item.variantId);
    } catch {
      resolvedVariant = null;
    }

    if (!resolvedVariant?.id) {
      continue;
    }

    const targetVariant = product.variants.id(resolvedVariant.id);

    if (!targetVariant) {
      continue;
    }

    targetVariant.stock = Number(targetVariant.stock || 0) + Number(item.quantity || 0);
    await product.save();
  }
};

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = PAYMENT_METHODS.COD, deliverySlot = "", notes = "", paymentResult } = req.body;

  if (!isShippingAddressValid(shippingAddress)) {
    res.status(400);
    throw new Error("A complete shipping address is required.");
  }

  const user = await getUserWithCart(req.user._id);
  const cart = serializeCart(user?.cartItems || []);

  if (!cart.items.length) {
    res.status(400);
    throw new Error("Your cart is empty.");
  }

  for (const item of user.cartItems) {
    if (!item.product) {
      res.status(400);
      throw new Error("One or more cart items are no longer available.");
    }

    const selectedVariant = resolveProductVariant(item.product, item.variantId);

    if (item.quantity > selectedVariant.stock) {
      res.status(400);
      throw new Error(`Only ${selectedVariant.stock} units left for ${item.product.name} (${selectedVariant.label}).`);
    }
  }

  const paymentSucceeded = paymentMethod !== PAYMENT_METHODS.COD && paymentResult?.status === "succeeded";
  const rewardCoinsEarned = calculateRewardCoins(cart.totalPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: cart.items.map((item) => ({
      product: item.productId,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
      name: item.name,
      slug: item.slug,
      image: item.image,
      unit: item.unit,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    shippingAddress: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      addressLine1: shippingAddress.addressLine1,
      addressLine2: shippingAddress.addressLine2 || "",
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || "India",
    },
    paymentMethod,
    paymentResult: paymentResult || undefined,
    paymentStatus: paymentSucceeded ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
    orderStatus: paymentMethod === PAYMENT_METHODS.COD || paymentSucceeded ? ORDER_STATUS.CONFIRMED : ORDER_STATUS.PENDING,
    itemsPrice: cart.subtotal,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    rewardCoinsEarned,
    rewardCoinsGranted: false,
    deliverySlot,
    notes,
    paidAt: paymentSucceeded ? new Date() : undefined,
  });

  for (const item of user.cartItems) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      continue;
    }

    const resolvedVariant = resolveProductVariant(product, item.variantId);
    const targetVariant = product.variants.id(resolvedVariant.id);

    if (targetVariant) {
      targetVariant.stock = Math.max(Number(targetVariant.stock || 0) - Number(item.quantity || 0), 0);
      await product.save();
    }
  }

  user.cartItems = [];
  await user.save();

  if (order.orderStatus !== ORDER_STATUS.PENDING && rewardCoinsEarned > 0) {
    await grantRewardCoins(req.user._id, rewardCoinsEarned);
    order.rewardCoinsGranted = true;
    await order.save();
  }

  await order.populate("user", "name email role");

  res.status(201).json({
    success: true,
    message: "Order placed successfully.",
    data: {
      order: serializeOrder(order),
    },
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully.",
    data: {
      orders: orders.map(serializeOrder),
    },
  });
});

export const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  res.status(200).json({
    success: true,
    message: "Order fetched successfully.",
    data: {
      order: serializeOrder(order),
    },
  });
});

export const reorderMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  const user = await User.findById(req.user._id);
  const addedItems = [];
  const skippedItems = [];

  for (const orderItem of order.orderItems || []) {
    const product = await Product.findById(orderItem.product);

    if (!product || !product.isActive) {
      skippedItems.push({
        productId: String(orderItem.product || ""),
        name: orderItem.name,
        reason: "This product is no longer available.",
      });
      continue;
    }

    let selectedVariant = null;

    try {
      selectedVariant = resolveProductVariant(product, orderItem.variantId);
    } catch {
      selectedVariant = null;
    }

    if (!selectedVariant) {
      skippedItems.push({
        productId: String(product._id),
        name: product.name,
        reason: "This unit is no longer available.",
      });
      continue;
    }

    const availableStock = Number(selectedVariant.stock || 0);

    if (availableStock <= 0) {
      skippedItems.push({
        productId: String(product._id),
        name: product.name,
        reason: `${selectedVariant.label} is currently out of stock.`,
      });
      continue;
    }

    const existingItem = user.cartItems.find(
      (item) => String(item.product) === String(product._id) && String(item.variantId || "") === String(selectedVariant.id || orderItem.variantId || "")
    );
    const currentQuantity = Number(existingItem?.quantity || 0);
    const requestedQuantity = Number(orderItem.quantity || 1);
    const quantityToAdd = Math.min(requestedQuantity, Math.max(availableStock - currentQuantity, 0));

    if (quantityToAdd <= 0) {
      skippedItems.push({
        productId: String(product._id),
        name: product.name,
        reason: `Your cart already has the maximum available quantity for ${selectedVariant.label}.`,
      });
      continue;
    }

    if (existingItem) {
      existingItem.quantity = currentQuantity + quantityToAdd;
    } else {
      user.cartItems.push({
        product: product._id,
        variantId: selectedVariant.id || orderItem.variantId || "",
        quantity: quantityToAdd,
      });
    }

    addedItems.push({
      productId: String(product._id),
      name: product.name,
      quantity: quantityToAdd,
      variantId: selectedVariant.id || orderItem.variantId || "",
      variantLabel: selectedVariant.label,
    });
  }

  await user.save();
  const populatedUser = await getUserWithCart(req.user._id);

  res.status(200).json({
    success: true,
    message: addedItems.length ? "Selected items were added back to your cart." : "No order items could be added to your cart.",
    data: {
      cart: serializeCart(populatedUser?.cartItems || []),
      summary: {
        addedItems,
        skippedItems,
        addedCount: addedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
        skippedCount: skippedItems.length,
      },
    },
  });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (order.orderStatus === ORDER_STATUS.CANCELLED) {
    res.status(400);
    throw new Error("This order has already been cancelled.");
  }

  if (!USER_CANCELLABLE_ORDER_STATUSES.includes(order.orderStatus)) {
    res.status(400);
    throw new Error("Only pending, confirmed, or processing orders can be cancelled.");
  }

  await restoreOrderInventory(order);

  if (order.rewardCoinsGranted && order.rewardCoinsEarned > 0) {
    await revokeRewardCoins(req.user._id, order.rewardCoinsEarned);
    order.rewardCoinsGranted = false;
  }

  order.orderStatus = ORDER_STATUS.CANCELLED;

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    order.paymentStatus = PAYMENT_STATUS.REFUNDED;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order cancelled successfully.",
    data: {
      order: serializeOrder(order),
    },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "All orders fetched successfully.",
    data: {
      orders: orders.map(serializeOrder),
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "name email role");

  if (!order) {
    res.status(404);
    throw new Error("Order not found.");
  }

  if (orderStatus && !Object.values(ORDER_STATUS).includes(orderStatus)) {
    res.status(400);
    throw new Error("Invalid order status.");
  }

  if (paymentStatus && !Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    res.status(400);
    throw new Error("Invalid payment status.");
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  if (order.orderStatus === ORDER_STATUS.DELIVERED && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID && !order.paidAt) {
    order.paidAt = new Date();
  }

  if (!order.rewardCoinsGranted && order.rewardCoinsEarned > 0 && (order.paymentStatus === PAYMENT_STATUS.PAID || order.orderStatus === ORDER_STATUS.DELIVERED)) {
    await grantRewardCoins(order.user?._id || order.user, order.rewardCoinsEarned);
    order.rewardCoinsGranted = true;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order updated successfully.",
    data: {
      order: serializeOrder(order),
    },
  });
});
