"use client";

import ProductCard from "@/components/product/ProductCard";
import ScrollRail from "@/components/shared/ScrollRail";

export default function ProductRail({ items }) {
  return (
    <ScrollRail
      ariaLabel="trending products"
      viewportClassName="auto-cols-[calc(50%-0.375rem)] sm:auto-cols-[240px] lg:auto-cols-[268px] xl:auto-cols-[286px]"
    >
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </ScrollRail>
  );
}
