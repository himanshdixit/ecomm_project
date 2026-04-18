export default function PageIntro({ title, description }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="max-w-2xl text-sm text-slate-600">{description}</p>
    </div>
  );
}
