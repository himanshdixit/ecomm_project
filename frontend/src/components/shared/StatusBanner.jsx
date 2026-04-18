import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const toneMap = {
  error: {
    icon: AlertCircle,
    className: "border-rose-200 bg-rose-50 text-rose-700",
    iconClassName: "text-rose-500",
  },
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    iconClassName: "text-emerald-500",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-200 bg-amber-50 text-amber-700",
    iconClassName: "text-amber-500",
  },
  info: {
    icon: Info,
    className: "border-brand/15 bg-brand-soft/85 text-slate-700",
    iconClassName: "text-brand",
  },
};

export default function StatusBanner({ tone = "info", title, message, action, className = "" }) {
  const config = toneMap[tone] || toneMap.info;
  const Icon = config.icon;

  return (
    <div className={cn("rounded-[1.35rem] border px-4 py-3", config.className, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClassName)} />
        <div className="min-w-0 flex-1">
          {title ? <div className="font-semibold">{title}</div> : null}
          {message ? <p className={cn("text-sm leading-6", title ? "mt-1" : "")}>{message}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
