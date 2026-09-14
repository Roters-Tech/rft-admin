import { AdmissionQueuePanel } from '@/components/demo/AdmissionQueuePanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SchoolAdmissionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Admissions Workflow"
        subtitle="A functional intake and approval flow for the Main Campus demo."
      />
      <AdmissionQueuePanel />
    </div>
  );
}
