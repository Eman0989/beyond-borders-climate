
import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1e19] p-6 transition hover:border-emerald-400/20">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {title}
        </p>

        <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-400">
          <Icon size={21} />
        </div>
      </div>

      <div className="text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
