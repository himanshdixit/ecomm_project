import { stripHtml } from "@/lib/rich-text";

const fallbackSiteName = process.env.NEXT_PUBLIC_APP_NAME || "FreshCart Studio";
const fallbackSiteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const siteConfig = {
  name: fallbackSiteName,
  description:
    "Premium grocery delivery with fresh produce, dairy, pantry essentials, and fast category-based shopping built for modern e-commerce.",
  url: fallbackSiteUrl,
  locale: "en_US",
  defaultOgImage: "/opengraph-image",
};

export const defaultKeywords = [
  "online grocery delivery",
  "fresh groceries",
  "daily essentials",
  "quick commerce",
  "premium grocery store",
  "fruit and vegetable delivery",
  "FreshCart Studio",
];

export const noIndexRobots = {
  index: false,
  follow: false,
};

export const indexRobots = {
  index: true,
  follow: true,
};

export const absoluteUrl = (path = "/") => new URL(path, siteConfig.url).toString();

export const truncateText = (value = "", maxLength = 160) => {
  const normalized = stripHtml(value).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
};

export const buildMetadata = ({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.defaultOgImage,
  keywords = [],
  robots,
  type = "website",
}) => ({
  title,
  description,
  keywords: [...new Set([...defaultKeywords, ...keywords].filter(Boolean))],
  alternates: {
    canonical: path,
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl(path),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type,
    images: image ? [image] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: image ? [image] : undefined,
  },
  ...(robots ? { robots } : {}),
});
