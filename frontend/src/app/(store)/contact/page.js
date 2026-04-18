import { Mail, MapPin, Phone } from "lucide-react";

import SectionHeading from "@/components/shared/SectionHeading";
import { contactCards } from "@/lib/mock-data";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact FreshCart Studio for grocery support, delivery questions, partnership enquiries, and storefront help with fast, visible support channels.",
  path: "/contact",
  keywords: ["contact grocery support", "delivery support", "storefront contact page"],
});

export default function ContactPage() {
  return (
    <main className="page-shell section-gap space-y-8">
      <SectionHeading
        eyebrow="Contact"
        title="Keep support fast, visible, and reassuring."
        description="A contact page designed for trust: quick support channels, a clear office anchor, and a clean enquiry form that stays calm on mobile."
      />

      <section className="grid gap-5 md:grid-cols-3">
        {contactCards.map((card, index) => {
          const icons = [Phone, Mail, MapPin];
          const Icon = icons[index] || Mail;

          return (
            <div key={card.title} className="surface-card p-6">
              <div className="mb-4 inline-flex rounded-2xl bg-brand-soft p-3">
                <Icon className="h-6 w-6 text-brand-dark" />
              </div>
              <h2 className="mb-2 text-2xl">{card.title}</h2>
              <p className="mb-2 font-semibold text-brand-dark">{card.value}</p>
              <p className="text-sm leading-7 text-slate-600">{card.detail}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr,0.95fr]">
        <div className="surface-card p-6 sm:p-7">
          <h2 className="mb-5 text-3xl">Send us a note</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Your name" />
            <input className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white" placeholder="Email address" />
            <input className="rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white sm:col-span-2" placeholder="Subject" />
            <textarea className="min-h-[170px] rounded-2xl border border-brand/10 bg-brand-soft/70 px-4 py-3.5 outline-none focus:border-brand/30 focus:bg-white sm:col-span-2" placeholder="Tell us how we can help" />
          </div>
          <button type="button" className="mt-5 rounded-pill bg-brand-dark px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5">
            Send enquiry
          </button>
        </div>

        <div className="surface-card overflow-hidden p-5">
          <div className="mb-4 rounded-[1.6rem] bg-brand-dark p-5 text-white">
            <div className="text-xs uppercase tracking-[0.28em] text-white/60">Operations hub</div>
            <h3 className="mt-2 text-3xl text-white">Where design, supply, and delivery meet.</h3>
          </div>
          <div className="flex min-h-[300px] items-center justify-center rounded-[1.75rem] bg-mesh-green p-6 text-center text-sm leading-7 text-slate-600">
            Map placeholder for showroom, office, or delivery hub. Replace this with an interactive embed when you wire real contact operations.
          </div>
        </div>
      </section>
    </main>
  );
}
