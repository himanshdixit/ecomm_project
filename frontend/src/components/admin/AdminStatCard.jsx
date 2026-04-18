import clsx from "clsx";

import { formatCompactNumber, formatCurrency } from "@/lib/format";

const formatValue = (value, type) => {
  if (type === "currency") {
    return formatCurrency(value);
  }

  if (type === "compact") {
    return formatCompactNumber(value);
  }

  return Number(value || 0).toLocaleString("en-IN");
};

export default function AdminStatCard({ title, value, description, icon: Icon, tone = "emerald", type = "number" }) {
  const toneClasses = {
    emerald: "from-emerald-500/18 via-emerald-500/7 to-transparent text-emerald-700 ring-emerald-500/20",
    blue: "from-sky-500/18 via-sky-500/7 to-transparent text-sky-700 ring-sky-500/20",
    amber: "from-amber-500/18 via-amber-500/7 to-transparent text-amber-700 ring-amber-500/20",
    violet: "from-violet-500/18 via-violet-500/7 to-transparent text-violet-700 ring-violet-500/20",
  };

  return (
    <div className="relative h-full overflow-hidden rounded-[28px] border border-white/75 bg-white/95 p-5 shadow-[0_26px_60px_rgba(15,23,42,0.08)]">
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-br ring-1 ring-inset",
          toneClasses[tone] || toneClasses.emerald
        )}
      />
      <div className="relative flex h-full flex-col justify-between gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500">{title}</p>
            <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[2rem]">{formatValue(value, type)}</p>
          </div>
          {Icon ? (
            <div
              className={clsx(
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ring-1 shadow-[0_18px_30px_rgba(255,255,255,0.25)]",
                toneClasses[tone] || toneClasses.emerald
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
        <p className="max-w-[24rem] text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
