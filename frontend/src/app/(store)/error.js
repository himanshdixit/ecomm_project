"use client";

import AppErrorState from "@/components/shared/AppErrorState";

export default function StoreError({ error, reset }) {
  return (
    <main className="page-shell section-gap">
      <AppErrorState
        title="This shopping view could not load"
        description={error?.message || "We were not able to load this part of the storefront right now."}
        reset={reset}
      />
    </main>
  );
}
