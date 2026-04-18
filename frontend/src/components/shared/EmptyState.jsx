export default function EmptyState({ title, description, action }) {
  return (
    <div className="surface-card rounded-[2rem] p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand-soft" />
      <h2 className="mb-3 text-2xl text-brand-dark">{title}</h2>
      <p className="mx-auto max-w-xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
