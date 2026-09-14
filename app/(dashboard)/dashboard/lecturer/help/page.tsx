import { CircleHelp, LifeBuoy, MessageSquareText } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

export default function LecturerHelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Help Center"
        subtitle="Support content for your demo, including onboarding guidance and issue escalation paths."
      />
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel>
          <CircleHelp className="h-5 w-5 text-brand-navy" />
          <p className="mt-4 text-base font-bold text-text-primary">Using Assessments</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Walk through quiz setup, grading logic, and submission tracking for lecturers.
          </p>
        </Panel>
        <Panel>
          <LifeBuoy className="h-5 w-5 text-brand-gold" />
          <p className="mt-4 text-base font-bold text-text-primary">Support Escalation</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Show how platform support and academic operations can coordinate on urgent issues.
          </p>
        </Panel>
        <Panel>
          <MessageSquareText className="h-5 w-5 text-status-optimal" />
          <p className="mt-4 text-base font-bold text-text-primary">Communication Tips</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Best practices for class rep messaging and student-facing content delivery.
          </p>
        </Panel>
      </div>
      <AppButton toastMessage="Support request drafted successfully.">Open Support Ticket</AppButton>
    </div>
  );
}
