import { BarChart3, Layers3, UsersRound } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

const levels = [
  { name: '100 Level', students: '8,940', occupancy: '92%', note: 'High freshman intake across science and business.' },
  { name: '200 Level', students: '10,120', occupancy: '88%', note: 'Most stable progression with strong retention.' },
  { name: '300 Level', students: '9,480', occupancy: '80%', note: 'Internship and practicum planning underway.' },
  { name: '400 Level', students: '7,230', occupancy: '73%', note: 'Assessment load requires lecturer support.' },
];

export default function SuperLevelsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Academic Levels"
        subtitle="Cross-platform visibility into cohort capacity, progression, and support planning."
      />
      <div className="grid gap-5 xl:grid-cols-2">
        {levels.map((level) => (
          <Panel key={level.name}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-text-primary">{level.name}</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{level.note}</p>
              </div>
              <Layers3 className="h-5 w-5 text-brand-navy" />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface p-4">
                <p className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <UsersRound className="h-4 w-4" />
                  Students
                </p>
                <p className="mt-2 text-2xl font-bold text-text-primary">{level.students}</p>
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <p className="inline-flex items-center gap-2 text-sm text-text-secondary">
                  <BarChart3 className="h-4 w-4" />
                  Occupancy
                </p>
                <p className="mt-2 text-2xl font-bold text-text-primary">{level.occupancy}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
