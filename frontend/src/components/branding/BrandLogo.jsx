"use client";

import Image from "next/image";
import Link from "next/link";

import { brandIdentity } from "@/lib/branding";
import { cn } from "@/lib/utils";

export default function BrandLogo({
  href,
  className,
  imageClassName,
  priority = false,
  alt,
}) {
  const image = (
    <div className={cn("relative h-12 w-[180px] overflow-hidden rounded-[1rem] bg-white", className)}>
      <Image
        src={brandIdentity.logoPath}
        alt={alt || brandIdentity.name}
        fill
        priority={priority}
        sizes="180px"
        className={cn("object-contain object-center", imageClassName)}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {image}
      </Link>
    );
  }

  return image;
}
