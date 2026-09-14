import { PerformanceChart } from '@/components/lecturer/PerformanceChart';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';

export default function LecturerPerformancePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Performance Overview"
        subtitle="A dedicated view for discussing course analytics, engagement, and assessment outcomes."
      />
      <Panel title="Course Performance" subtitle="Recent mid-term assessment trends across active courses.">
        <PerformanceChart />
      </Panel>
    </div>
  );
}
