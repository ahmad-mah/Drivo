interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
  index?: number;
}

const staggerDelays = [
  "stagger-1",
  "stagger-2",
  "stagger-3",
  "stagger-4",
  "stagger-5",
  "stagger-6",
  "stagger-7",
  "stagger-8",
];

export function KpiCard({
  label,
  value,
  sub,
  color = "text-text-primary",
  icon,
  index = 0,
}: KpiCardProps) {
  return (
    <div
      className={`glass hover-lift animate-slide-up group rounded-2xl p-4 ${staggerDelays[index] ?? ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
            {label}
          </p>
          <p
            className={`mt-1.5 animate-count-up font-mono text-2xl font-bold tracking-tight ${color}`}
          >
            {value}
          </p>
          {sub && (
            <p className="mt-0.5 text-[11px] font-medium text-text-muted">
              {sub}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-bg-tertiary text-text-muted transition-colors duration-200 group-hover:bg-brand-500/10 group-hover:text-brand-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}