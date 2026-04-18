import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from "../constants/index.js";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { applyCategoryHierarchy } from "../utils/catalog.js";
import { resolveProductVariant } from "../utils/productVariants.js";

const categoryBlueprints = [
  ["Fresh Produce", "Produce", "fresh-produce", null, "Fruits and vegetables in nested grocery aisles.", "#E7F8D8", true],
  ["Fresh Fruits", "Fruits", "fresh-fruits", "fresh-produce", "Sweet, juicy fruit picks for every day.", "#FFF0D2", true],
  ["Tropical Fruits", "Tropical", "tropical-fruits", "fresh-fruits", "Mangoes and tropical staples.", "#FFF4CC", false],
  ["Citrus Fruits", "Citrus", "citrus-fruits", "fresh-fruits", "Juicing and vitamin-rich citrus.", "#FFEBC0", false],
  ["Fresh Vegetables", "Vegetables", "fresh-vegetables", "fresh-produce", "Leafy and cooking vegetables.", "#E5F4D6", true],
  ["Leafy Vegetables", "Leafy", "leafy-vegetables", "fresh-vegetables", "Washed greens and bunches.", "#DFF0CF", false],
  ["Daily Vegetables", "Daily Veg", "daily-vegetables", "fresh-vegetables", "Tomatoes and kitchen staples.", "#FDE8D9", false],
  ["Dairy & Breakfast", "Dairy", "dairy-breakfast", null, "Milk, yogurt, and breakfast essentials.", "#E7F1FF", true],
  ["Fresh Milk", "Milk", "fresh-milk", "dairy-breakfast", "Single-serve to family-size milk packs.", "#EEF5FF", false],
  ["Curd & Yogurt", "Yogurt", "curd-yogurt", "dairy-breakfast", "Curd tubs and Greek yogurt cups.", "#F2F7FF", false],
  ["Staples & Cooking", "Staples", "staples-cooking", null, "Rice, flour, and essential pantry stock.", "#FFF2D9", true],
  ["Rice & Grains", "Rice", "rice-grains", "staples-cooking", "Bulk rice inventory in family sizes.", "#FAF0D8", false],
  ["Basmati Rice", "Basmati", "basmati-rice", "rice-grains", "Aged long-grain basmati bags.", "#F8ECD0", false],
  ["Snacks & Beverages", "Snacks", "snacks-beverages", null, "Biscuits, gift packs, and drinks.", "#FFF0E8", true],
  ["Cookies & Gift Packs", "Gift Packs", "cookies-gift-packs", "snacks-beverages", "Premium cookies and biscuit gift boxes.", "#FCE9E2", false],
  ["Personal & Home Care", "Home Care", "personal-home-care", null, "Bath bars and refill essentials.", "#EAF6F7", false],
  ["Soaps & Bars", "Soaps", "soaps-bars", "personal-home-care", "Single bars and multipacks for family use.", "#F5FAFB", false],
];

const productImages = (...fileNames) => fileNames.map((fileName) => `/uploads/products/${fileName}`);

const productBlueprints = [
  ["Alphonso Mangoes", "alphonso-mangoes", "tropical-fruits", "Season special", 4.9, 248, "10 mins", productImages("seed-alphonso-mango-1.jpg", "seed-alphonso-mango-2.jpg"), "#FFF0D2", "Sweet Alphonso mangoes packed for dessert tables and gifting.", ["Naturally sweet", "Gift-worthy", "Seasonal favourite"], ["mango", "fruit"], true, [["1 kg", 189, 219, 24], ["2 kg", 359, 399, 16, true]]],
  ["Sweet Lime Juice Pack", "sweet-lime-juice-pack", "citrus-fruits", "Vitamin C", 4.6, 84, "10 mins", productImages("seed-sweet-lime-1.jpg"), "#FFEAC2", "Juicy sweet lime packs ideal for juice and hydration.", ["Juicing grade", "Hydrating", "Fresh picked"], ["sweet lime", "citrus"], false, [["1 kg", 79, 89, 20, true], ["2 kg", 149, 164, 12]]],
  ["Tender Spinach Pack", "tender-spinach-pack", "leafy-vegetables", "Fresh cut", 4.7, 137, "11 mins", productImages("seed-spinach-1.jpg"), "#E6F6E9", "Washed spinach leaves for curries and smoothie bowls.", ["Washed pack", "Iron rich", "Quick cook"], ["spinach", "greens"], false, [["250 g", 29, 34, 26, true], ["500 g", 54, 60, 16]]],
  ["Vine Tomatoes", "vine-tomatoes", "daily-vegetables", "Chef pick", 4.6, 118, "11 mins", productImages("seed-tomato-1.jpg"), "#FEE7D9", "Bright tomatoes selected for salads and gravies.", ["Kitchen staple", "Balanced sweetness", "Hand sorted"], ["tomato", "vegetable"], false, [["500 g", 24, 29, 32, true], ["1 kg", 44, 52, 20]]],
  ["Farm Toned Milk", "farm-toned-milk", "fresh-milk", "Best seller", 4.8, 276, "10 mins", productImages("seed-milk-1.jpg"), "#EDF5FF", "Chilled toned milk in single-serve and family sizes.", ["Cold chain", "Daily essential", "Fresh sealed"], ["milk", "dairy"], true, [["250 ml", 18, 20, 60], ["500 ml", 34, 38, 54, true], ["1 L", 66, 72, 34]]],
  ["Greek Yogurt Protein Cup", "greek-yogurt-protein-cup", "curd-yogurt", "High protein", 4.8, 96, "12 mins", productImages("seed-yogurt-1.jpg"), "#EEF4FF", "Smooth high-protein yogurt for breakfast bowls and shakes.", ["High protein", "Smooth finish", "Breakfast bowl"], ["greek yogurt", "protein"], false, [["150 g", 42, 48, 28], ["400 g", 98, 110, 18, true]]],
  ["Breakfast Protein Kit", "breakfast-protein-kit", "dairy-breakfast", "Morning fuel", 4.7, 52, "13 mins", productImages("seed-milk-1.jpg", "seed-yogurt-1.jpg"), "#EEF4FF", "Curated combo with eggs, yogurt, and bread for quick breakfasts.", ["Curated combo", "Breakfast ready", "Protein rich"], ["breakfast combo", "protein"], false, [["2 servings", 249, 279, 10, true], ["4 servings", 469, 519, 6]]],
  ["Royal Basmati Rice", "royal-basmati-rice", "basmati-rice", "Top seller", 4.8, 182, "16 mins", productImages("seed-basmati-rice-1.jpg", "seed-basmati-rice-2.jpg"), "#F7EBD4", "Aged long-grain basmati rice for pulao and biryani.", ["Aged grain", "Long grain", "Family staple"], ["rice", "basmati"], true, [["5 kg", 449, 489, 28, true], ["10 kg", 869, 929, 18], ["20 kg", 1699, 1799, 10]]],
  ["Butter Biscuit Box", "butter-biscuit-box", "cookies-gift-packs", "Tea time", 4.7, 68, "14 mins", productImages("seed-biscuit-1.jpg"), "#FDE9DF", "Crisp butter biscuits in shareable tins for tea trays.", ["Tea snack", "Shareable box", "Premium pack"], ["biscuit", "cookies"], false, [["200 g", 69, 79, 24, true], ["400 g", 129, 149, 12]]],
  ["Herbal Bath Soap", "herbal-bath-soap", "soaps-bars", "Family care", 4.5, 102, "18 mins", productImages("seed-soap-1.jpg"), "#EEF7F7", "Herbal bathing bars in single and multipack formats.", ["Herbal base", "Daily use", "Family value"], ["soap", "bath"], false, [["1 bar (125 g)", 38, 42, 40], ["Pack of 4 bars (100 g each)", 136, 152, 22, true], ["Pack of 8 bars (100 g each)", 259, 289, 12]]],
];

const users = [
  {
    name: "Admin User",
    email: "admin@freshcart.local",
    password: "Admin123!",
    role: "admin",
    phone: "+91 98765 10001",
    rewardCoins: 920,
    totalCoinsEarned: 920,
    deliveryAddresses: [
      {
        label: "Work",
        fullName: "Admin User",
        phone: "+91 98765 10001",
        addressLine1: "32 Residency Road",
        addressLine2: "Suite 501",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
        country: "India",
        landmark: "Near Richmond Circle",
        instructions: "Call at reception before delivery",
        isDefault: true,
      },
    ],
  },
  {
    name: "Demo Shopper",
    email: "user@freshcart.local",
    password: "User123!",
    role: "user",
    phone: "+91 98765 12345",
    rewardCoins: 340,
    totalCoinsEarned: 520,
    deliveryAddresses: [
      {
        label: "Home",
        fullName: "Demo Shopper",
        phone: "+91 98765 12345",
        addressLine1: "17 Residency Road",
        addressLine2: "Apt 302",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560025",
        country: "India",
        landmark: "Opposite Central Mall",
        instructions: "Leave at the door if unreachable",
        isDefault: true,
      },
      {
        label: "Parents",
        fullName: "Demo Shopper",
        phone: "+91 98765 12345",
        addressLine1: "8 Lake View Layout",
        addressLine2: "",
        city: "Mysuru",
        state: "Karnataka",
        postalCode: "570002",
        country: "India",
        landmark: "Near City Bus Stand",
        instructions: "Ring the bell twice",
        isDefault: false,
      },
    ],
  },
  {
    name: "Priya Nair",
    email: "priya@freshcart.local",
    password: "Priya123!",
    role: "user",
    phone: "+91 98989 22211",
    rewardCoins: 180,
    totalCoinsEarned: 280,
    deliveryAddresses: [
      {
        label: "Home",
        fullName: "Priya Nair",
        phone: "+91 98989 22211",
        addressLine1: "44 Green Park",
        addressLine2: "Tower B, Flat 904",
        city: "Kochi",
        state: "Kerala",
        postalCode: "682020",
        country: "India",
        landmark: "Near Metro Station",
        instructions: "Security desk keeps visitor log",
        isDefault: true,
      },
    ],
  },
  {
    name: "Rahul Mehta",
    email: "rahul@freshcart.local",
    password: "Rahul123!",
    role: "user",
    phone: "+91 99887 43120",
    rewardCoins: 120,
    totalCoinsEarned: 160,
    deliveryAddresses: [
      {
        label: "Home",
        fullName: "Rahul Mehta",
        phone: "+91 99887 43120",
        addressLine1: "91 Sunrise Enclave",
        addressLine2: "",
        city: "Ahmedabad",
        state: "Gujarat",
        postalCode: "380015",
        country: "India",
        landmark: "Beside Garden Entrance",
        instructions: "Hand over to resident only",
        isDefault: true,
      },
    ],
  },
];

const wishlistByUser = {
  "user@freshcart.local": ["alphonso-mangoes", "farm-toned-milk"],
  "priya@freshcart.local": ["greek-yogurt-protein-cup", "butter-biscuit-box"],
  "rahul@freshcart.local": ["royal-basmati-rice", "herbal-bath-soap"],
};

const cartByUser = {
  "user@freshcart.local": [
    { slug: "farm-toned-milk", variantLabel: "1 L", quantity: 2 },
    { slug: "tender-spinach-pack", variantLabel: "250 g", quantity: 1 },
  ],
  "priya@freshcart.local": [
    { slug: "greek-yogurt-protein-cup", variantLabel: "400 g", quantity: 1 },
    { slug: "alphonso-mangoes", variantLabel: "1 kg", quantity: 1 },
  ],
};

const orderBlueprints = [
  { userEmail: "user@freshcart.local", items: [{ slug: "farm-toned-milk", variantLabel: "1 L", quantity: 2 }, { slug: "alphonso-mangoes", variantLabel: "2 kg", quantity: 1 }], paymentMethod: PAYMENT_METHODS.MOCK_PAY, paymentStatus: PAYMENT_STATUS.PAID, orderStatus: ORDER_STATUS.DELIVERED, daysAgo: 8 },
  { userEmail: "user@freshcart.local", items: [{ slug: "royal-basmati-rice", variantLabel: "5 kg", quantity: 1 }, { slug: "vine-tomatoes", variantLabel: "1 kg", quantity: 1 }], paymentMethod: PAYMENT_METHODS.COD, paymentStatus: PAYMENT_STATUS.PENDING, orderStatus: ORDER_STATUS.PROCESSING, daysAgo: 2 },
  { userEmail: "priya@freshcart.local", items: [{ slug: "greek-yogurt-protein-cup", variantLabel: "400 g", quantity: 1 }, { slug: "breakfast-protein-kit", variantLabel: "2 servings", quantity: 1 }], paymentMethod: PAYMENT_METHODS.UPI, paymentStatus: PAYMENT_STATUS.PAID, orderStatus: ORDER_STATUS.CONFIRMED, daysAgo: 1 },
];

const shippingAddress = {
  fullName: "Demo Shopper",
  phone: "+91 98765 12345",
  addressLine1: "17 Residency Road",
  addressLine2: "Apt 302",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560025",
  country: "India",
};

const roundCurrency = (value) => Number(value.toFixed(2));
const getShippingPrice = (itemsPrice) => (itemsPrice > 0 && itemsPrice < 499 ? 40 : 0);
const getTaxPrice = (itemsPrice) => roundCurrency(itemsPrice * 0.05);
const getDateDaysAgo = (daysAgo) => { const date = new Date(); date.setDate(date.getDate() - daysAgo); return date; };

const getVariantForProduct = (product, variantLabel) => resolveProductVariant(product, product.variants.find((entry) => entry.label === variantLabel)?._id || "");

const buildOrderPayload = (blueprint, userId, productMap) => {
  const orderItems = blueprint.items.map(({ slug, variantLabel, quantity }) => {
    const product = productMap.get(slug);
    const variant = getVariantForProduct(product, variantLabel);

    return {
      product: product._id,
      variantId: String(variant._id),
      variantLabel: variant.label,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || "",
      unit: variant.label,
      price: variant.price,
      quantity,
      lineTotal: roundCurrency(variant.price * quantity),
    };
  });

  const itemsPrice = roundCurrency(orderItems.reduce((total, item) => total + item.lineTotal, 0));
  const shippingPrice = getShippingPrice(itemsPrice);
  const taxPrice = getTaxPrice(itemsPrice);
  const totalPrice = roundCurrency(itemsPrice + shippingPrice + taxPrice);
  const createdAt = getDateDaysAgo(blueprint.daysAgo || 0);

  return {
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod: blueprint.paymentMethod,
    paymentResult: blueprint.paymentStatus === PAYMENT_STATUS.PAID ? { id: `seed-${userId}-${blueprint.daysAgo}`, status: "succeeded", amount: totalPrice } : undefined,
    paymentStatus: blueprint.paymentStatus,
    orderStatus: blueprint.orderStatus,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    rewardCoinsEarned: Math.max(Math.floor(totalPrice / 20), 0),
    rewardCoinsGranted: true,
    deliverySlot: "Deliver in 10-15 mins",
    notes: "Seeded demo order",
    paidAt: blueprint.paymentStatus === PAYMENT_STATUS.PAID ? createdAt : undefined,
    deliveredAt: blueprint.orderStatus === ORDER_STATUS.DELIVERED ? createdAt : undefined,
    createdAt,
    updatedAt: createdAt,
  };
};

const seed = async () => {
  await connectDB();
  await Promise.all([Order.deleteMany(), Product.deleteMany(), Category.deleteMany(), User.deleteMany()]);

  const categoryMap = new Map();
  for (const [name, shortName, slug, parentSlug, description, tint, isFeatured] of categoryBlueprints) {
    const category = new Category({ name, shortName, slug, description, image: "/images/hero/market-fresh.svg", tint, deliveryTime: "12 mins", isFeatured, sortOrder: 0 });
    applyCategoryHierarchy(category, parentSlug ? categoryMap.get(parentSlug) : null);
    await category.save();
    categoryMap.set(slug, category);
  }

  const productMap = new Map();
  for (const [name, slug, categorySlug, badge, rating, reviewsCount, deliveryTime, images, tint, description, highlights, tags, isFeatured, variants] of productBlueprints) {
    const product = await Product.create({ name, slug, category: categoryMap.get(categorySlug)._id, badge, rating, reviewsCount, deliveryTime, images, tint, description, highlights, tags, isFeatured, variants: variants.map(([label, price, originalPrice, stock, isDefault]) => ({ label, packLabel: label, price, originalPrice, stock, isDefault: Boolean(isDefault) })) });
    productMap.set(slug, product);
  }

  const createdUsers = [];
  for (const userData of users) {
    const user = await User.create(userData);
    user.wishlist = (wishlistByUser[user.email] || []).map((slug) => productMap.get(slug)?._id).filter(Boolean);
    user.cartItems = (cartByUser[user.email] || []).map(({ slug, variantLabel, quantity }) => {
      const product = productMap.get(slug);
      const variant = getVariantForProduct(product, variantLabel);
      return { product: product._id, variantId: String(variant._id), quantity };
    });
    await user.save();
    createdUsers.push(user);
  }

  const userMap = new Map(createdUsers.map((user) => [user.email, user]));
  await Order.insertMany(orderBlueprints.map((blueprint) => buildOrderPayload(blueprint, userMap.get(blueprint.userEmail)._id, productMap)));

  console.log(`Seed completed successfully: ${categoryMap.size} categories, ${productMap.size} products, ${createdUsers.length} users, ${orderBlueprints.length} orders.`);
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
