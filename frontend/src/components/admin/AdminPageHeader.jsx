export default function AdminPageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/75 bg-white/88 p-5 shadow-[0_28px_70px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_55%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_40%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-2.5">
          {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-600">{eyebrow}</p> : null}
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.35rem]">{title}</h1>
            {description ? <p className="max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto lg:justify-end">{action}</div> : null}
      </div>
    </div>
  );
}
