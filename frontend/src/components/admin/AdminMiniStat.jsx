import clsx from "clsx";

const toneClasses = {
  emerald: "from-emerald-500/12 via-emerald-500/4 to-transparent text-emerald-700 ring-emerald-500/20",
  blue: "from-sky-500/12 via-sky-500/4 to-transparent text-sky-700 ring-sky-500/20",
  amber: "from-amber-500/12 via-amber-500/4 to-transparent text-amber-700 ring-amber-500/20",
  violet: "from-violet-500/12 via-violet-500/4 to-transparent text-violet-700 ring-violet-500/20",
  slate: "from-slate-500/10 via-slate-500/4 to-transparent text-slate-700 ring-slate-500/15",
};

export default function AdminMiniStat({ label, value, helper, tone = "emerald" }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/75 bg-white/92 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div
        className={clsx(
          "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-br opacity-100 ring-1 ring-inset",
          toneClasses[tone] || toneClasses.emerald
        )}
      />
      <div className="relative space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
        <p className="text-2xl font-black tracking-tight text-slate-950 sm:text-[1.85rem]">{value}</p>
        {helper ? <p className="text-sm text-slate-500">{helper}</p> : null}
      </div>
    </div>
  );
}
