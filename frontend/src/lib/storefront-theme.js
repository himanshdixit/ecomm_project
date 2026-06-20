export const categoryThemeMap = {
  "fresh-produce": {
    image: "/images/products/fruit-basket.svg",
    tint: "#EEF4FF",
    badge: "Fresh market",
  },
  "fresh-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFF3E2",
    badge: "Fruit aisle",
  },
  "tropical-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFF0DA",
    badge: "Season special",
  },
  "citrus-fruits": {
    image: "/images/products/fruit-basket.svg",
    tint: "#FFEACF",
    badge: "Vitamin picks",
  },
  "fresh-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#EEF5FF",
    badge: "Farm fresh",
  },
  "leafy-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#E9F3FF",
    badge: "Leafy greens",
  },
  "daily-vegetables": {
    image: "/images/products/produce-crate.svg",
    tint: "#FFF2E6",
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
    tint: "#FFF4E6",
    badge: "Pantry edit",
  },
  "rice-grains": {
    image: "/images/products/produce-crate.svg",
    tint: "#FFF2E2",
    badge: "Bulk grains",
  },
  "basmati-rice": {
    image: "/images/products/produce-crate.svg",
    tint: "#FFF0DB",
    badge: "Family packs",
  },
  "snacks-beverages": {
    image: "/images/products/snack-box.svg",
    tint: "#FFF2EC",
    badge: "Snack shelf",
  },
  "cookies-gift-packs": {
    image: "/images/products/snack-box.svg",
    tint: "#FFF0EA",
    badge: "Gift boxes",
  },
  "personal-home-care": {
    image: "/images/products/home-care.svg",
    tint: "#ECF6FF",
    badge: "Home care",
  },
  "soaps-bars": {
    image: "/images/products/home-care.svg",
    tint: "#F3F8FF",
    badge: "Bath bars",
  },
};

export const homeDealCards = [
  {
    title: "Buy 1 Get 1",
    description: "On select dairy packs, yogurt cups, and breakfast essentials.",
    eyebrow: "Limited deal",
    href: "/categories/dairy-breakfast",
    tint: "linear-gradient(135deg, rgba(225, 236, 255, 0.96), rgba(245, 249, 255, 0.92))",
  },
  {
    title: "Tropical Picks",
    description: "Mangoes and fruit boxes curated for gifting, smoothies, and dessert tables.",
    eyebrow: "Today only",
    href: "/categories/tropical-fruits",
    tint: "linear-gradient(135deg, rgba(255, 243, 224, 0.96), rgba(255, 249, 239, 0.92))",
  },
  {
    title: "Under \u20B9100",
    description: "Everyday kitchen essentials with faster browsing and clearer pack pricing.",
    eyebrow: "Pantry edit",
    href: "/products?maxPrice=100",
    tint: "linear-gradient(135deg, rgba(231, 239, 255, 0.96), rgba(245, 248, 255, 0.92))",
  },
  {
    title: "Family Packs",
    description: "Bulk rice bags, soap value packs, and gift boxes designed for weekly restocks.",
    eyebrow: "Smart savings",
    href: "/categories/staples-cooking",
    tint: "linear-gradient(135deg, rgba(255, 239, 220, 0.96), rgba(255, 248, 240, 0.92))",
  },
];

export function getCategoryTheme(category = {}) {
  const theme = categoryThemeMap[category.slug] || {};

  return {
    image: theme.image || category.image || "/images/products/produce-crate.svg",
    tint: theme.tint || category.tint || "#F5F7FF",
    badge: theme.badge || (category.childrenCount ? `${category.childrenCount} sub-aisles` : "Fresh picks"),
  };
}
