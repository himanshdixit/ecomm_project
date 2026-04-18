export default function AdminSectionCard({ title, description, action, children, className = "" }) {
  return (
    <section
      className={`relative overflow-hidden rounded-[30px] border border-white/75 bg-white/92 p-4 shadow-[0_26px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6 ${className}`.trim()}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,0))]" />
      <div className="relative">
        {(title || description || action) && (
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-200/80 pb-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1.5">
              {title ? <h2 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{title}</h2> : null}
              {description ? <p className="max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
            </div>
            {action ? <div className="flex w-full flex-wrap items-center gap-2.5 sm:w-auto sm:justify-end">{action}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
