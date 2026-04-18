import Image from "next/image";
import { Leaf, PackageCheck, Truck } from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import { aboutStats } from "@/lib/mock-data";
import { buildMetadata } from "@/lib/seo";

const values = [
  {
    title: "Fresh-first sourcing",
    description: "Curated produce relationships and better packaging for premium grocery perception.",
    icon: Leaf,
  },
  {
    title: "Thoughtful assortment",
    description: "Quick-commerce speed paired with broader category breadth and cleaner merchandising.",
    icon: PackageCheck,
  },
  {
    title: "Delivery precision",
    description: "Fast slots, confident communication, and a UI that makes urgency feel effortless.",
    icon: Truck,
  },
];

export const metadata = buildMetadata({
  title: "About",
  description:
    "Learn how FreshCart Studio approaches premium grocery UX with calmer merchandising, cleaner category navigation, and faster online shopping flows.",
  path: "/about",
  keywords: ["about grocery brand", "premium grocery UX", "online grocery experience"],
});

export default function AboutPage() {
  return (
    <main className="page-shell section-gap space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
        <div className="space-y-4">
          <div className="pill-chip w-fit">About the brand</div>
          <h1 className="text-4xl sm:text-5xl">A premium grocery experience shaped for speed, clarity, and trust.</h1>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">
            FreshCart Studio rethinks fast-commerce browsing with calmer spacing, better visual hierarchy, and grocery-first storytelling that still feels quick and conversion ready.
          </p>
        </div>
        <div className="surface-card overflow-hidden p-5">
          <div className="rounded-[1.75rem] bg-brand-soft p-4">
            <Image
              src="/images/hero/wellness-crate.svg"
              alt="About FreshCart Studio"
              width={560}
              height={360}
              sizes="(min-width: 1024px) 40vw, 92vw"
              className="mx-auto h-auto w-full max-w-[440px] object-contain"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {aboutStats.map((stat) => (
          <div key={stat.label} className="surface-card p-5 text-center">
            <div className="text-4xl font-display text-brand-dark">{stat.value}</div>
            <div className="mt-2 text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Our approach"
          title="Designed like a modern product, not a crowded listing engine."
          description="Each section is structured to help users move quickly while still giving grocery products a more premium sense of place."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="surface-card p-6">
                <div className="mb-4 inline-flex rounded-2xl bg-brand-soft p-3">
                  <Icon className="h-6 w-6 text-brand-dark" />
                </div>
                <h3 className="mb-2 text-2xl">{value.title}</h3>
                <p className="text-sm leading-7 text-slate-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
