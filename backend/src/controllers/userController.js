import asyncHandler from "express-async-handler";

import Order from "../models/Order.js";
import User from "../models/User.js";
import { deleteManagedUserAvatarFiles, getUserAvatarPublicPath } from "../utils/uploadStorage.js";
import { serializeOrder, serializeProduct, serializeUser } from "../utils/serializers.js";

const CATEGORY_SELECT = "name shortName slug description image tint deliveryTime isFeatured parent root level sortOrder pathIds pathNames pathSlugs";
const MAX_ADDRESSES = 5;
const COINS_PER_RUPEE = 20;
const NEXT_UNLOCK_STEP = 100;

const parseJsonValue = (value, fallback) => {
  if (typeof value !== "string" || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const normalizeAddressEntries = (value) => {
  const source = Array.isArray(value) ? value : parseJsonValue(value, []);

  return (Array.isArray(source) ? source : [])
    .map((entry) => ({
      id: entry?.id || entry?._id || "",
      label: String(entry?.label || "Home").trim() || "Home",
      fullName: String(entry?.fullName || "").trim(),
      phone: String(entry?.phone || "").trim(),
      addressLine1: String(entry?.addressLine1 || "").trim(),
      addressLine2: String(entry?.addressLine2 || "").trim(),
      city: String(entry?.city || "").trim(),
      state: String(entry?.state || "").trim(),
      postalCode: String(entry?.postalCode || "").trim(),
      country: String(entry?.country || "India").trim() || "India",
      landmark: String(entry?.landmark || "").trim(),
      instructions: String(entry?.instructions || "").trim(),
      isDefault: Boolean(entry?.isDefault),
    }))
    .filter((entry) =>
      entry.fullName ||
      entry.phone ||
      entry.addressLine1 ||
      entry.city ||
      entry.state ||
      entry.postalCode ||
      entry.landmark ||
      entry.instructions
    );
};

const validateAddresses = (addresses = []) => {
  if (addresses.length > MAX_ADDRESSES) {
    return `You can save up to ${MAX_ADDRESSES} delivery addresses.`;
  }

  for (const address of addresses) {
    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.postalCode) {
      return "Each saved address must include full name, phone, address line 1, city, state, and postal code.";
    }
  }

  return "";
};

const buildProfileCompletion = (user) => {
  const deliveryAddresses = Array.isArray(user.deliveryAddresses) ? user.deliveryAddresses : [];
  const defaultAddress = deliveryAddresses.find((entry) => entry.isDefault) || deliveryAddresses[0];
  const checklist = [
    { key: "name", complete: Boolean(user.name) },
    { key: "phone", complete: Boolean(user.phone) },
    { key: "avatar", complete: Boolean(user.avatar) },
    { key: "defaultAddress", complete: Boolean(defaultAddress?.addressLine1) },
    { key: "backupAddress", complete: deliveryAddresses.length > 1 },
  ];
  const completedItems = checklist.filter((item) => item.complete).length;

  return {
    score: Math.round((completedItems / checklist.length) * 100),
    completedItems,
    totalItems: checklist.length,
  };
};

const buildCoinsSummary = (user) => {
  const balance = Number(user.rewardCoins || 0);
  const lifetime = Number(user.totalCoinsEarned || balance || 0);
  const nextUnlockAt = Math.ceil(Math.max(balance + 1, NEXT_UNLOCK_STEP) / NEXT_UNLOCK_STEP) * NEXT_UNLOCK_STEP;

  return {
    balance,
    lifetime,
    nextUnlockAt,
    coinsToNextUnlock: Math.max(nextUnlockAt - balance, 0),
    earningRateDescription: `Earn 1 coin for every INR ${COINS_PER_RUPEE} spent`,
  };
};

const buildSpecialOffers = ({ user, totalOrders, activeOrders, wishlistCount }) => {
  const coins = Number(user.rewardCoins || 0);

  return [
    {
      id: "coins-boost",
      title: coins >= 300 ? "Coins-ready free delivery perk" : "Boost your coin balance",
      description: coins >= 300
        ? "Use your balance on fast delivery waivers or premium rewards in upcoming checkouts."
        : `You are ${Math.max(300 - coins, 0)} coins away from the next reward unlock.`,
      eyebrow: "Rewards",
      ctaLabel: coins >= 300 ? "View rewards" : "Shop eligible products",
      ctaHref: coins >= 300 ? "/account" : "/products?featured=true",
      tone: coins >= 300 ? "emerald" : "amber",
    },
    {
      id: "wishlist-save",
      title: wishlistCount ? "Your wishlist is ready for checkout" : "Save products to unlock smarter offers",
      description: wishlistCount
        ? `You already have ${wishlistCount} saved picks waiting for a quick add-to-cart.`
        : "Heart your staples and trending products to get faster reorders and smarter deal reminders.",
      eyebrow: "Wishlist",
      ctaLabel: wishlistCount ? "Open wishlist" : "Explore products",
      ctaHref: wishlistCount ? "/wishlist" : "/products",
      tone: "sky",
    },
    {
      id: "active-orders",
      title: activeOrders ? "Track your active deliveries" : "Keep your order momentum going",
      description: activeOrders
        ? `${activeOrders} active order${activeOrders === 1 ? " is" : "s are"} on the move right now.`
        : totalOrders
          ? "You have past orders ready for one-tap reordering and delivery tracking."
          : "Place your first order to unlock delivery progress, coins, and repeat-order shortcuts.",
      eyebrow: "Orders",
      ctaLabel: totalOrders ? "View order history" : "Start shopping",
      ctaHref: totalOrders ? "/account/orders" : "/products",
      tone: "violet",
    },
  ];
};

const getOrderStats = (orders = []) => {
  const totalOrders = orders.length;
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.orderStatus)).length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === "delivered").length;

  return {
    totalOrders,
    activeOrders,
    deliveredOrders,
  };
};

const getDashboardPayload = async (userId) => {
  const [user, orders] = await Promise.all([
    User.findById(userId).populate({
      path: "wishlist",
      match: { isActive: true },
      populate: {
        path: "category",
        select: CATEGORY_SELECT,
      },
    }),
    Order.find({ user: userId }).sort({ createdAt: -1 }).limit(8),
  ]);

  if (!user) {
    return null;
  }

  const serializedUser = serializeUser(user);
  const serializedOrders = orders.map(serializeOrder);
  const wishlistPreview = (user.wishlist || []).map((product) => serializeProduct(product)).filter(Boolean).slice(0, 4);
  const orderStats = getOrderStats(serializedOrders);

  return {
    user: serializedUser,
    stats: {
      totalOrders: orderStats.totalOrders,
      activeOrders: orderStats.activeOrders,
      deliveredOrders: orderStats.deliveredOrders,
      wishlistCount: wishlistPreview.length || Number(user.wishlist?.length || 0),
      rewardCoins: Number(user.rewardCoins || 0),
      addressCount: serializedUser.deliveryAddresses.length,
    },
    profileCompletion: buildProfileCompletion(user),
    coins: buildCoinsSummary(user),
    specialOffers: buildSpecialOffers({
      user,
      totalOrders: orderStats.totalOrders,
      activeOrders: orderStats.activeOrders,
      wishlistCount: Number(user.wishlist?.length || 0),
    }),
    recentOrders: serializedOrders,
    wishlistPreview,
  };
};

export const getAccountDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardPayload(req.user._id);

  if (!dashboard) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({
    success: true,
    message: "Account dashboard fetched successfully.",
    data: {
      dashboard,
    },
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const uploadedAvatar = req.file ? getUserAvatarPublicPath(req.file.filename) : "";

  try {
    const nextName = String(req.body.name || user.name || "").trim();
    const nextPhone = String(req.body.phone || user.phone || "").trim();
    const removeAvatar = String(req.body.removeAvatar || "").trim().toLowerCase() === "true";
    const nextAddresses = Object.prototype.hasOwnProperty.call(req.body, "deliveryAddresses")
      ? normalizeAddressEntries(req.body.deliveryAddresses)
      : user.deliveryAddresses || [];
    const addressValidationError = validateAddresses(nextAddresses);

    if (!nextName) {
      res.status(400);
      throw new Error("Name is required.");
    }

    if (addressValidationError) {
      res.status(400);
      throw new Error(addressValidationError);
    }

    const previousAvatar = user.avatar || "";

    user.name = nextName;
    user.phone = nextPhone;
    user.deliveryAddresses = nextAddresses;

    if (removeAvatar) {
      user.avatar = "";
    }

    if (uploadedAvatar) {
      user.avatar = uploadedAvatar;
    }

    await user.save();

    if (previousAvatar && previousAvatar !== user.avatar) {
      await deleteManagedUserAvatarFiles(previousAvatar);
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: serializeUser(user),
      },
    });
  } catch (error) {
    if (uploadedAvatar) {
      await deleteManagedUserAvatarFiles(uploadedAvatar);
    }

    throw error;
  }
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Users fetched successfully.",
    data: {
      users: users.map(serializeUser),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  res.status(200).json({
    success: true,
    message: "User fetched successfully.",
    data: {
      user: serializeUser(user),
    },
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  if (!["admin", "user"].includes(role)) {
    res.status(400);
    throw new Error("Role must be either admin or user.");
  }

  if (String(req.user?._id) === String(user._id) && role !== "admin") {
    res.status(400);
    throw new Error("You cannot remove your own admin access.");
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: "User role updated successfully.",
    data: {
      user: serializeUser(user),
    },
  });
});
