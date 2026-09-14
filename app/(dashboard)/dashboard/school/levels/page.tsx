import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

const rows = [
  ['100 Level', '3,820 students', 'Orientation and foundation modules active'],
  ['200 Level', '2,980 students', 'Course registration stable'],
  ['300 Level', '2,110 students', 'Practicum planning in progress'],
  ['400 Level', '1,740 students', 'Assessment moderation scheduled'],
];

export default function SchoolLevelsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Level Management" subtitle="Mock level planning for academic operations and capacity balancing." />
      <Panel title="Level Summary" subtitle="A simple overview for the school admin flow.">
        <div className="space-y-3">
          {rows.map(([title, metric, note]) => (
            <div key={title} className="rounded-2xl bg-surface px-4 py-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-bold text-text-primary">{title}</p>
                <p className="text-sm font-semibold text-brand-navy">{metric}</p>
              </div>
              <p className="mt-2 text-sm text-text-secondary">{note}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
