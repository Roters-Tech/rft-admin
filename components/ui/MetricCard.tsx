import { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  helper: ReactNode;
  accentClassName: string;
}

export function MetricCard({ label, value, helper, accentClassName }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white p-6 shadow-card transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-card-hover">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-text-secondary">{label}</p>
      <p className="mt-4 font-display text-[40px] font-bold leading-none text-text-primary">{value}</p>
      <div className="mt-4 text-sm text-text-secondary">{helper}</div>
      <div className={`mt-6 h-1 rounded-full ${accentClassName}`} />
    </div>
  );
}
