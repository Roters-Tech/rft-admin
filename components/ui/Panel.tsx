import { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, subtitle, action, children, className = '' }: PanelProps) {
  return (
    <section className={`rounded-2xl border border-white/60 bg-white p-6 shadow-card ${className}`}>
      {(title || subtitle || action) ? (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-xl font-bold text-text-primary">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
