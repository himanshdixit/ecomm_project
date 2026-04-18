import { resolveProductVariant, serializeProductVariant, syncProductSummaryFromVariants } from "./productVariants.js";

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  if (value.id) {
    return String(value.id);
  }

  return String(value);
};

const buildCategoryPath = (category) => {
  const pathNames = Array.isArray(category?.pathNames) ? category.pathNames : [];
  const pathSlugs = Array.isArray(category?.pathSlugs) ? category.pathSlugs : [];

  return [
    ...pathNames.map((name, index) => ({
      name,
      slug: pathSlugs[index] || "",
    })),
    ...(category ? [{ name: category.name, slug: category.slug }] : []),
  ];
};

const serializeAddress = (address) => {
  if (!address) {
    return null;
  }

  return {
    id: getId(address),
    label: address.label || "Home",
    fullName: address.fullName || "",
    phone: address.phone || "",
    addressLine1: address.addressLine1 || "",
    addressLine2: address.addressLine2 || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || "",
    country: address.country || "India",
    landmark: address.landmark || "",
    instructions: address.instructions || "",
    isDefault: Boolean(address.isDefault),
  };
};

export const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const deliveryAddresses = Array.isArray(user.deliveryAddresses)
    ? user.deliveryAddresses.map(serializeAddress).filter(Boolean)
    : [];
  const defaultDeliveryAddress = deliveryAddresses.find((address) => address.isDefault) || deliveryAddresses[0] || null;

  return {
    id: getId(user),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    avatar: user.avatar || "",
    rewardCoins: Number(user.rewardCoins || 0),
    totalCoinsEarned: Number(user.totalCoinsEarned || user.rewardCoins || 0),
    deliveryAddresses,
    defaultDeliveryAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const serializeCategory = (category, overrides = {}) => {
  if (!category) {
    return null;
  }

  const path = overrides.path || buildCategoryPath(category);
  const children = overrides.children ?? category.children ?? [];

  return {
    id: getId(category),
    name: category.name,
    shortName: category.shortName || category.name,
    slug: category.slug,
    description: category.description || "",
    image: category.image || "",
    tint: category.tint || "#EAF6F7",
    deliveryTime: category.deliveryTime || "Fast delivery",
    itemCount: overrides.itemCount ?? category.itemCount ?? 0,
    directItemCount: overrides.directItemCount ?? category.directItemCount ?? 0,
    isFeatured: Boolean(category.isFeatured),
    parentId: overrides.parentId ?? getId(category.parent),
    rootId: overrides.rootId ?? getId(category.root || category),
    rootSlug: overrides.rootSlug ?? category.rootSlug ?? path[0]?.slug ?? category.slug,
    level: Number(overrides.level ?? category.level ?? 0),
    sortOrder: Number(overrides.sortOrder ?? category.sortOrder ?? 0),
    childrenCount: Number(overrides.childrenCount ?? category.childrenCount ?? children.length ?? 0),
    hasChildren: overrides.hasChildren ?? Boolean(category.hasChildren || children.length),
    path,
    pathLabel: overrides.pathLabel ?? path.map((entry) => entry.name).join(" / "),
    children: Array.isArray(children)
      ? children.map((child) => serializeCategory(child))
      : [],
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

const serializeCategoryRef = (category) => {
  if (!category) {
    return null;
  }

  if (typeof category === "object") {
    return serializeCategory(category);
  }

  return {
    id: getId(category),
  };
};

export const serializeProduct = (product, options = {}) => {
  if (!product) {
    return null;
  }

  const { variants, defaultVariant, price, originalPrice, stock, unit } = syncProductSummaryFromVariants(product);
  const selectedVariant = serializeProductVariant(resolveProductVariant({ ...product, variants }, options.variantId));

  return {
    id: getId(product),
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: Number(price || 0),
    originalPrice: Number(originalPrice ?? price ?? 0),
    stock: Number(stock || 0),
    unit: unit || "1 unit",
    badge: product.badge || "Fresh pick",
    rating: Number(product.rating || 0),
    reviewsCount: Number(product.reviewsCount || 0),
    deliveryTime: product.deliveryTime || "Fast delivery",
    images: Array.isArray(product.images) ? product.images : [],
    image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "",
    highlights: Array.isArray(product.highlights) ? product.highlights : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    tint: product.tint || "#EAF6F7",
    isFeatured: Boolean(product.isFeatured),
    isActive: Boolean(product.isActive ?? true),
    category: serializeCategoryRef(product.category),
    variants: variants.map(serializeProductVariant),
    defaultVariant: serializeProductVariant(defaultVariant),
    selectedVariant,
    variantCount: variants.length,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const serializeCartItem = (item) => {
  if (!item?.product) {
    return null;
  }

  const selectedVariant = serializeProductVariant(resolveProductVariant(item.product, item.variantId));
  const product = serializeProduct(item.product, { variantId: selectedVariant.id });
  const quantity = Number(item.quantity || 1);
  const lineTotal = Number((selectedVariant.price * quantity).toFixed(2));
  const lineSavings = Number(((selectedVariant.originalPrice - selectedVariant.price) * quantity).toFixed(2));

  return {
    id: getId(item),
    quantity,
    lineTotal,
    lineSavings,
    productId: product.id,
    variantId: selectedVariant.id,
    variantLabel: selectedVariant.label,
    slug: product.slug,
    name: product.name,
    image: product.image,
    unit: selectedVariant.label,
    price: selectedVariant.price,
    originalPrice: selectedVariant.originalPrice,
    deliveryTime: product.deliveryTime,
    stock: selectedVariant.stock,
    tint: product.tint,
    category: product.category,
    product,
    selectedVariant,
  };
};

export const serializeCart = (cartItems = []) => {
  const items = cartItems.map(serializeCartItem).filter(Boolean);
  const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const totalSavings = Number(items.reduce((sum, item) => sum + item.lineSavings, 0).toFixed(2));
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingPrice = subtotal > 0 && subtotal < 499 ? 40 : 0;
  const taxPrice = Number((subtotal * 0.05).toFixed(2));
  const totalPrice = Number((subtotal + shippingPrice + taxPrice).toFixed(2));

  return {
    items,
    itemCount: items.length,
    totalQuantity,
    subtotal,
    totalSavings,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

export const serializeOrder = (order) => {
  if (!order) {
    return null;
  }

  return {
    id: getId(order),
    user:
      order.user && typeof order.user === "object"
        ? serializeUser(order.user)
        : order.user
          ? { id: getId(order.user) }
          : null,
    orderItems: (order.orderItems || []).map((item) => ({
      id: getId(item),
      productId: getId(item.product),
      variantId: item.variantId || "",
      variantLabel: item.variantLabel || item.unit || "",
      name: item.name,
      slug: item.slug,
      image: item.image || "",
      unit: item.unit || item.variantLabel || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      lineTotal: Number(item.lineTotal || 0),
    })),
    shippingAddress: serializeAddress(order.shippingAddress),
    paymentMethod: order.paymentMethod,
    paymentResult: order.paymentResult,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    itemsPrice: Number(order.itemsPrice || 0),
    shippingPrice: Number(order.shippingPrice || 0),
    taxPrice: Number(order.taxPrice || 0),
    totalPrice: Number(order.totalPrice || 0),
    rewardCoinsEarned: Number(order.rewardCoinsEarned || 0),
    rewardCoinsGranted: Boolean(order.rewardCoinsGranted),
    deliverySlot: order.deliverySlot || "",
    notes: order.notes || "",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
  };
};
