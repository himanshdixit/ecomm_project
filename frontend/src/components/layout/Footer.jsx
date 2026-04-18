import Link from "next/link";

import { footerSections } from "@/lib/mock-data";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/70 bg-white/70 pb-28 pt-10 backdrop-blur-xl md:pb-10">
      <div className="page-shell space-y-8">
        <div className="grid gap-5 rounded-[2rem] bg-brand-dark p-6 text-white shadow-glow lg:grid-cols-[1.4fr,1fr] lg:p-8">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">FreshCart Studio</div>
            <h2 className="max-w-xl text-3xl text-white sm:text-4xl">Design-forward grocery shopping with delivery-first UX.</h2>
            <p className="max-w-xl text-sm leading-7 text-white/72 sm:text-base">
              Built for premium essentials, express fulfilment, and a calm browsing experience across mobile and desktop.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur">
            <div className="mb-2 text-sm font-semibold">Need inspiration?</div>
            <p className="mb-4 text-sm text-white/70">Start with fresh vegetables, weekend snack boxes, or breakfast combos.</p>
            <Link href="/products" className="inline-flex rounded-pill bg-brand-accent px-4 py-2.5 font-semibold text-brand-dark transition hover:-translate-y-0.5">
              Explore products
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-[1.1fr,1fr]">
          <div>
            <div className="mb-2 font-display text-2xl text-brand-dark">FreshCart Studio</div>
            <p className="max-w-lg text-sm leading-7 text-slate-600">
              Modern grocery shopping inspired by fast-commerce clarity, elevated with better spacing, stronger hierarchy, and premium visual texture.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{section.title}</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className="block hover:text-brand-dark">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
