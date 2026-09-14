import { AssessmentBuilderPanel } from '@/components/demo/AssessmentBuilderPanel';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LecturerAssessmentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Assessments"
        subtitle="Build assignments, quizzes, and timed evaluations with a workflow that already feels product-ready."
      />
      <AssessmentBuilderPanel />
    </div>
  );
}
