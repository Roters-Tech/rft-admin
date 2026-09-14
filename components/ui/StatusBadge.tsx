interface StatusBadgeProps {
  status: 'optimal' | 'growing' | 'critical';
}

const styles = {
  optimal: 'bg-status-optimal-bg text-status-optimal',
  growing: 'bg-status-growing-bg text-status-growing',
  critical: 'bg-status-critical-bg text-status-critical',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}
