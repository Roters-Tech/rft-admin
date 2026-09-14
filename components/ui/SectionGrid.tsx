import { ReactNode } from 'react';

export function SectionGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid gap-6 xl:grid-cols-[1.6fr_0.95fr] ${className}`}>{children}</div>;
}
