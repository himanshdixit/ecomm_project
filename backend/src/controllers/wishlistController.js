import asyncHandler from "express-async-handler";

import Product from "../models/Product.js";
import User from "../models/User.js";
import { serializeProduct } from "../utils/serializers.js";

const CATEGORY_SELECT = "name shortName slug description image tint deliveryTime isFeatured parent root level sortOrder pathIds pathNames pathSlugs";

const getPopulatedUser = (userId) =>
  User.findById(userId).populate({
    path: "wishlist",
    match: { isActive: true },
    populate: {
      path: "category",
      select: CATEGORY_SELECT,
    },
  });

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await getPopulatedUser(req.user._id);

  res.status(200).json({
    success: true,
    message: "Wishlist fetched successfully.",
    data: {
      wishlist: (user?.wishlist || []).map(serializeProduct),
    },
  });
});

export const toggleWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product id is required.");
  }

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found.");
  }

  const user = await User.findById(req.user._id);
  const alreadyWishlisted = user.wishlist.some((id) => String(id) === String(productId));

  if (alreadyWishlisted) {
    user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  const populatedUser = await getPopulatedUser(user._id);

  res.status(200).json({
    success: true,
    message: alreadyWishlisted ? "Product removed from wishlist." : "Product added to wishlist.",
    data: {
      wishlist: (populatedUser?.wishlist || []).map(serializeProduct),
      isWishlisted: !alreadyWishlisted,
    },
  });
});
