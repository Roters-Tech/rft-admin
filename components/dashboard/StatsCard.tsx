import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  description: ReactNode;
  accent: string;
}

export function StatsCard({ label, value, description, accent }: StatsCardProps) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-card transition-all duration-200 ease-in-out hover:shadow-card-hover">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">{label}</p>
      <p className="mt-4 font-display text-[40px] font-bold leading-none text-text-primary">{value}</p>
      <div className="mt-3 text-sm text-text-secondary">{description}</div>
      <div className={`mt-6 h-1 rounded-full ${accent}`} />
    </div>
  );
}
