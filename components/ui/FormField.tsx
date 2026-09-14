import { InputHTMLAttributes, ReactNode } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  icon?: ReactNode;
}

export function FormField({ label, hint, icon, className = '', ...props }: FormFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{label}</span>
      <div className="flex h-12 items-center rounded-xl border border-transparent bg-surface px-4 transition-all duration-200 ease-in-out focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
        {icon ? <span className="mr-3 text-text-muted">{icon}</span> : null}
        <input
          {...props}
          className={`w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${className}`}
        />
      </div>
      {hint ? <span className="block text-xs text-text-muted">{hint}</span> : null}
    </label>
  );
}
