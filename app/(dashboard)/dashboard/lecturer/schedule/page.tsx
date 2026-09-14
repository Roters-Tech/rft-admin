import { ScheduleClassForm } from '@/components/demo/ScheduleClassForm';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LecturerSchedulePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Schedule Class"
        subtitle="A working scheduling flow for physical, hybrid, or virtual sessions."
      />
      <ScheduleClassForm />
    </div>
  );
}
