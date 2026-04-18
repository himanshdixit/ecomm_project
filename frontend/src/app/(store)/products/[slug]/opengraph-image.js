import { ImageResponse } from "next/og";

import { siteConfig, truncateText } from "@/lib/seo";
import { getProductDetail } from "@/lib/storefront";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function ProductOpenGraphImage({ params }) {
  const { slug } = await params;
  const { product } = await getProductDetail(slug);

  const productName = product?.name || "Fresh grocery product";
  const description = truncateText(product?.description || "Premium grocery essentials with faster category-based shopping.", 110);
  const price = product?.price ? `\u20B9${product.price}` : "FreshCart Studio";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #ecfccb 0%, #d9f99d 22%, #f8fafc 22%, #ffffff 100%)",
          color: "#0f172a",
          padding: "54px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            borderRadius: "40px",
            border: "2px solid rgba(15,23,42,0.08)",
            overflow: "hidden",
            background: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "68%",
              padding: "54px",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  alignSelf: "flex-start",
                  borderRadius: "9999px",
                  background: "#183227",
                  color: "white",
                  padding: "12px 20px",
                  fontSize: "22px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                }}
              >
                {product?.badge || "Fresh pick"}
              </div>
              <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.05 }}>{productName}</div>
              <div style={{ fontSize: "28px", lineHeight: 1.4, color: "#475569" }}>{description}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "22px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                  {product?.category?.name || siteConfig.name}
                </div>
                <div style={{ fontSize: "44px", fontWeight: 800, color: "#183227" }}>{price}</div>
              </div>
              <div style={{ fontSize: "24px", color: "#64748b" }}>{product?.deliveryTime || "Fast delivery"}</div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              width: "32%",
              background: product?.tint || "#EAF6F7",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: "40px",
                bottom: "40px",
                left: "40px",
                borderRadius: "32px",
                background: "rgba(255,255,255,0.5)",
              }}
            />
            <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "18px", alignItems: "center", textAlign: "center" }}>
              <div style={{ fontSize: "28px", color: "#475569", letterSpacing: "0.18em", textTransform: "uppercase" }}>FreshCart</div>
              <div style={{ fontSize: "34px", fontWeight: 700, color: "#183227" }}>{product?.stock > 0 ? "In stock" : "Sold out"}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}


