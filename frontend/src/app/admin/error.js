"use client";

import AppErrorState from "@/components/shared/AppErrorState";

export default function AdminError({ error, reset }) {
  return (
    <main className="mx-auto w-full max-w-7xl">
      <AppErrorState
        title="The admin dashboard hit an error"
        description={error?.message || "This admin view failed to render. You can retry safely."}
        reset={reset}
        homeHref="/admin"
      />
    </main>
  );
}
