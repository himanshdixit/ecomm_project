import { absoluteUrl } from "@/lib/seo";
import { getAllProductsForSitemap, getCategories } from "@/lib/storefront";

export default async function sitemap() {
  const [categories, products] = await Promise.all([getCategories(), getAllProductsForSitemap()]);

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "daily" },
    { path: "/products", priority: 0.9, changeFrequency: "daily" },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/categories/${category.slug}`),
      lastModified: category.updatedAt || category.createdAt || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(`/products/${product.slug}`),
      lastModified: product.updatedAt || product.createdAt || new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    })),
  ];
}
