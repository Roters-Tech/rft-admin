import { ReactNode } from 'react';

interface InfoListItem {
  label: string;
  value: ReactNode;
}

export function InfoList({ items }: { items: InfoListItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4 rounded-xl bg-surface-muted px-4 py-3">
          <span className="text-sm text-text-secondary">{item.label}</span>
          <span className="text-right text-sm font-semibold text-text-primary">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
