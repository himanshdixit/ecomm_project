export const categoryThemeMap = {
  "fresh-produce": {
    image: "/images/products/fruit-basket.svg",
    tint: "#F2FAE7",
    badge: "Fresh market",
  },
  "fresh-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFF2D9",
    badge: "Fruit aisle",
  },
  "tropical-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFF1CC",
    badge: "Season special",
  },
  "citrus-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFF0C2",
    badge: "Vitamin picks",
  },
  "fresh-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#E8F7D8",
    badge: "Farm fresh",
  },
  "leafy-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#E3F4D4",
    badge: "Leafy greens",
  },
  "daily-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#FDEBDD",
    badge: "Daily kitchen",
  },
  "dairy-breakfast": {
    image: "/images/products/dairy-box.svg",
    tint: "#E8F1FF",
    badge: "Breakfast ready",
  },
  "fresh-milk": {
    image: "/images/products/dairy-box.svg",
    tint: "#EEF5FF",
    badge: "Cold milk",
  },
  "curd-yogurt": {
    image: "/images/products/dairy-box.svg",
    tint: "#F2F7FF",
    badge: "Protein cups",
  },
  "staples-cooking": {
    image: "/images/products/produce-crate.svg",
    tint: "#FFF3DD",
    badge: "Pantry edit",
  },
  "rice-grains": {
    image: "/images/products/produce-crate.svg",
    tint: "#FBF0DA",
    badge: "Bulk grains",
  },
  "basmati-rice": {
    image: "/images/products/produce-crate.svg",
    tint: "#F8ECD1",
    badge: "Family packs",
  },
  "snacks-beverages": {
    image: "/images/products/snack-box.svg",
    tint: "#FFF0E8",
    badge: "Snack shelf",
  },
  "cookies-gift-packs": {
    image: "/images/products/snack-box.svg",
    tint: "#FDEAE1",
    badge: "Gift boxes",
  },
  "personal-home-care": {
    image: "/images/products/home-care.svg",
    tint: "#EBF7F7",
    badge: "Home care",
  },
  "soaps-bars": {
    image: "/images/products/home-care.svg",
    tint: "#F4FAFB",
    badge: "Bath bars",
  },
};

export const homeDealCards = [
  {
    title: "Buy 1 Get 1",
    description: "On select dairy packs, yogurt cups, and breakfast essentials.",
    eyebrow: "Limited deal",
    href: "/categories/dairy-breakfast",
    tint: "linear-gradient(135deg, rgba(224, 241, 255, 0.95), rgba(240, 247, 255, 0.9))",
  },
  {
    title: "Tropical Picks",
    description: "Mangoes and fruit boxes curated for gifting, smoothies, and dessert tables.",
    eyebrow: "Today only",
    href: "/categories/tropical-fruits",
    tint: "linear-gradient(135deg, rgba(255, 243, 214, 0.95), rgba(255, 248, 232, 0.92))",
  },
  {
    title: "Under \u20B9100",
    description: "Everyday kitchen essentials with faster browsing and clearer pack pricing.",
    eyebrow: "Pantry edit",
    href: "/products?maxPrice=100",
    tint: "linear-gradient(135deg, rgba(223, 244, 234, 0.95), rgba(240, 251, 245, 0.92))",
  },
  {
    title: "Family Packs",
    description: "Bulk rice bags, soap value packs, and gift boxes designed for weekly restocks.",
    eyebrow: "Smart savings",
    href: "/categories/staples-cooking",
    tint: "linear-gradient(135deg, rgba(236, 240, 255, 0.95), rgba(248, 250, 255, 0.92))",
  },
];

export function getCategoryTheme(category = {}) {
  const theme = categoryThemeMap[category.slug] || {};

  return {
    image: theme.image || category.image || "/images/products/produce-crate.svg",
    tint: theme.tint || category.tint || "#F5F8EA",
    badge: theme.badge || (category.childrenCount ? `${category.childrenCount} sub-aisles` : "Fresh picks"),
  };
}
