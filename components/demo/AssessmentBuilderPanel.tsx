'use client';

import { ClipboardCheck, FileQuestion, TimerReset } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { Panel } from '@/components/ui/Panel';
import { SelectField } from '@/components/ui/SelectField';

export function AssessmentBuilderPanel() {
  return (
    <Panel
      title="Assessment Builder"
      subtitle="A ready-to-demo interface for configuring quizzes, assignments, or mid-term assessments."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label="Course" options={['CS101', 'DB105', 'AL302', 'DS204']} defaultValue="CS101" />
        <SelectField label="Assessment Type" options={['Quiz', 'Assignment', 'Mid-Term']} defaultValue="Quiz" />
        <SelectField label="Submission Mode" options={['Portal Upload', 'Timed CBT', 'External Link']} defaultValue="Portal Upload" />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-surface p-4">
          <FileQuestion className="h-5 w-5 text-brand-navy" />
          <p className="mt-3 text-sm font-bold text-text-primary">12 Questions Drafted</p>
          <p className="mt-1 text-sm text-text-secondary">Question bank connected and ready for randomization.</p>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <TimerReset className="h-5 w-5 text-brand-gold" />
          <p className="mt-3 text-sm font-bold text-text-primary">45 Minute Timer</p>
          <p className="mt-1 text-sm text-text-secondary">Recommended duration based on previous class sessions.</p>
        </div>
        <div className="rounded-2xl bg-surface p-4">
          <ClipboardCheck className="h-5 w-5 text-status-optimal" />
          <p className="mt-3 text-sm font-bold text-text-primary">Auto-grading Enabled</p>
          <p className="mt-1 text-sm text-text-secondary">Objective sections can publish results immediately.</p>
        </div>
      </div>
      <div className="mt-6">
        <AppButton toastMessage="Assessment workflow created successfully.">Publish Assessment Draft</AppButton>
      </div>
    </Panel>
  );
}
