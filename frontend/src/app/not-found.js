import Link from "next/link";

import StorefrontShell from "@/components/layout/StorefrontShell";

export default function NotFound() {
  return (
    <StorefrontShell>
      <main className="page-shell section-gap">
        <div className="surface-card p-8 text-center sm:p-12">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand">Page not found</div>
          <h1 className="mb-4 text-4xl sm:text-5xl">This aisle seems empty.</h1>
          <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            The page you are looking for is unavailable right now. You can head back to the storefront and continue browsing.
          </p>
          <Link href="/" className="inline-flex rounded-pill bg-brand-dark px-5 py-3.5 font-semibold text-white transition hover:-translate-y-0.5">
            Return home
          </Link>
        </div>
      </main>
    </StorefrontShell>
  );
}
