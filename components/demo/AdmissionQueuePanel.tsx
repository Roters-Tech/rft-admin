'use client';

import { BadgeCheck, FilePlus2 } from 'lucide-react';
import { admissionQueue } from '@/lib/mock-data/platform';
import { AppButton } from '@/components/ui/AppButton';
import { Panel } from '@/components/ui/Panel';

export function AdmissionQueuePanel() {
  return (
    <Panel
      title="Admission Queue"
      subtitle="A clean intake review flow for the demo. This will map directly to API-backed application states later."
    >
      <div className="space-y-3">
        {admissionQueue.map((item) => (
          <div key={item.id} className="flex flex-col gap-3 rounded-2xl bg-surface px-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold text-text-primary">{item.student}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {item.program} · {item.level}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-status-optimal-bg px-3 py-1 text-xs font-semibold text-status-optimal">
                {item.status}
              </span>
              <AppButton variant="secondary" className="px-4 py-2" toastMessage={`${item.student} marked for registrar review.`}>
                <BadgeCheck className="h-4 w-4" />
                Review
              </AppButton>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <AppButton href="/dashboard/school/students" className="w-full sm:w-auto">
          <FilePlus2 className="h-4 w-4" />
          Open Student Directory
        </AppButton>
      </div>
    </Panel>
  );
}
