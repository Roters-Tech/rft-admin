import Link from 'next/link';

export function QuickInsightsPanel() {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card">
      <h3 className="text-lg font-bold text-text-primary">Quick Insights</h3>
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">System Status</span>
          <span className="flex items-center gap-2 font-medium text-status-optimal">
            <span className="h-2 w-2 rounded-full bg-status-optimal" />
            Optimal
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Next Submission</span>
          <span className="font-medium text-text-primary">Friday, 11:59 PM</span>
        </div>
      </div>
      <div className="my-4 h-px bg-gray-100" />
      <Link href="/dashboard/lecturer/performance" className="text-sm text-brand-navy underline">
        View Full System Report →
      </Link>
    </div>
  );
}
