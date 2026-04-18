"use client";

import AppErrorState from "@/components/shared/AppErrorState";

export default function RootError({ error, reset }) {
  return (
    <main className="page-shell section-gap">
      <AppErrorState
        title="The storefront ran into a problem"
        description={error?.message || "An unexpected error interrupted the app. Try refreshing this view."}
        reset={reset}
      />
    </main>
  );
}
