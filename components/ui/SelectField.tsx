interface SelectFieldProps {
  label: string;
  options: string[];
  defaultValue?: string;
}

export function SelectField({ label, options, defaultValue }: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">{label}</span>
      <select
        defaultValue={defaultValue}
        className="h-12 w-full rounded-xl border border-transparent bg-surface px-4 text-sm text-text-primary transition-all duration-200 ease-in-out focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
