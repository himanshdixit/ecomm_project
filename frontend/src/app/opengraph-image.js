import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/seo";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const siteHost = new URL(siteConfig.url).host;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #163C92 0%, #2D66D7 56%, #42A0EE 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-80px",
            top: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "9999px",
            background: "rgba(255, 199, 90, 0.34)",
            filter: "blur(12px)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "860px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                alignSelf: "flex-start",
                borderRadius: "9999px",
                background: "rgba(255,255,255,0.14)",
                padding: "12px 22px",
                fontSize: "24px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
              }}
            >
              Premium Grocery Delivery
            </div>
            <div style={{ fontSize: "78px", fontWeight: 800, lineHeight: 1.02 }}>{siteConfig.name}</div>
            <div style={{ fontSize: "32px", lineHeight: 1.4, color: "rgba(255,255,255,0.82)", maxWidth: "900px" }}>
              Fresh produce, dairy, pantry essentials, and fast category-first shopping shaped around the PrimeBasket identity.
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "24px", color: "rgba(255,255,255,0.78)" }}>
            <div>Category-based browsing | Clean URLs | SEO-ready storefront</div>
            <div style={{ color: "#FFC75A", fontWeight: 700 }}>{siteHost}</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
