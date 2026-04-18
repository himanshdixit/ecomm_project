export default function AdminFormField({ label, error, description, children }) {
  return (
    <label className="block space-y-2.5">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {description ? <span className="text-xs leading-5 text-slate-400">{description}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
    </label>
  );
}
