import asyncHandler from "express-async-handler";

import Product from "../models/Product.js";
import User from "../models/User.js";
import { resolveProductVariant } from "../utils/productVariants.js";
import { serializeCart } from "../utils/serializers.js";

const CATEGORY_SELECT = "name shortName slug description image tint deliveryTime isFeatured parent root level sortOrder pathIds pathNames pathSlugs";

const getPopulatedUser = (userId) =>
  User.findById(userId).populate({
    path: "cartItems.product",
    match: { isActive: true },
    populate: {
      path: "category",
      select: CATEGORY_SELECT,
    },
  });

const parseQuantity = (value, fallback = 1) => {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : fallback;
};

export const getCart = asyncHandler(async (req, res) => {
  const user = await getPopulatedUser(req.user._id);

  res.status(200).json({
    success: true,
    message: "Cart fetched successfully.",
    data: {
      cart: serializeCart(user?.cartItems || []),
    },
  });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, variantId = "" } = req.body;
  const quantity = parseQuantity(req.body.quantity, 1);

  if (!productId) {
    res.status(400);
    throw new Error("Product id is required.");
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const selectedVariant = resolveProductVariant(product, variantId);

  if (!selectedVariant) {
    res.status(400);
    throw new Error("A valid product unit is required.");
  }

  if (selectedVariant.stock < quantity) {
    res.status(400);
    throw new Error("Requested quantity exceeds available stock for this unit.");
  }

  const user = await User.findById(req.user._id);
  const existingItem = user.cartItems.find(
    (item) => String(item.product) === String(product._id) && String(item.variantId || "") === String(selectedVariant.id || variantId || "")
  );

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;

    if (nextQuantity > selectedVariant.stock) {
      res.status(400);
      throw new Error("Requested quantity exceeds available stock for this unit.");
    }

    existingItem.quantity = nextQuantity;
  } else {
    user.cartItems.push({
      product: product._id,
      variantId: selectedVariant.id || variantId || "",
      quantity,
    });
  }

  await user.save();
  const populatedUser = await getPopulatedUser(user._id);

  res.status(200).json({
    success: true,
    message: "Cart updated successfully.",
    data: {
      cart: serializeCart(populatedUser?.cartItems || []),
    },
  });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const quantity = Number(req.body.quantity);
  const user = await User.findById(req.user._id);
  const cartItem = user.cartItems.id(req.params.itemId);

  if (!cartItem) {
    res.status(404);
    throw new Error("Cart item not found.");
  }

  if (!Number.isInteger(quantity) || quantity < 0) {
    res.status(400);
    throw new Error("Quantity must be a non-negative integer.");
  }

  if (quantity === 0) {
    user.cartItems.pull(cartItem._id);
  } else {
    const product = await Product.findById(cartItem.product);

    if (!product || !product.isActive) {
      res.status(404);
      throw new Error("Product not found.");
    }

    const selectedVariant = resolveProductVariant(product, cartItem.variantId);

    if (quantity > selectedVariant.stock) {
      res.status(400);
      throw new Error("Requested quantity exceeds available stock for this unit.");
    }

    cartItem.quantity = quantity;
  }

  await user.save();
  const populatedUser = await getPopulatedUser(user._id);

  res.status(200).json({
    success: true,
    message: "Cart item updated successfully.",
    data: {
      cart: serializeCart(populatedUser?.cartItems || []),
    },
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const cartItem = user.cartItems.id(req.params.itemId);

  if (!cartItem) {
    res.status(404);
    throw new Error("Cart item not found.");
  }

  user.cartItems.pull(cartItem._id);
  await user.save();
  const populatedUser = await getPopulatedUser(user._id);

  res.status(200).json({
    success: true,
    message: "Cart item removed successfully.",
    data: {
      cart: serializeCart(populatedUser?.cartItems || []),
    },
  });
});
