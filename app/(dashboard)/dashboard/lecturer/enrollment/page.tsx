import { AdmissionQueuePanel } from '@/components/demo/AdmissionQueuePanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LecturerEnrollmentPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Enrollment"
        subtitle="A lecturer-side intake view for monitoring active registration and readiness for class access."
      />
      <AdmissionQueuePanel />
    </div>
  );
}
