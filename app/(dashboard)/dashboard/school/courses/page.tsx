import { platformCourses } from '@/lib/mock-data/platform';
import { AppButton } from '@/components/ui/AppButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { SimpleTable } from '@/components/ui/SimpleTable';

export default function SchoolCoursesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Management"
        subtitle="Review delivery readiness, performance patterns, and enrollment demand at the school level."
        actions={<AppButton toastMessage="Course planning draft created.">Plan New Course</AppButton>}
      />
      <Panel title="Current Course Portfolio" subtitle="A mock admin view with realistic structure for your presentation.">
        <SimpleTable
          data={platformCourses}
          columns={[
            { key: 'code', label: 'Course', sticky: true, render: (course) => <span className="text-sm font-bold text-text-primary">{course.code}: {course.name}</span> },
            { key: 'level', label: 'Level', render: (course) => <span className="text-sm text-text-primary">{course.level}</span> },
            { key: 'module', label: 'Type', render: (course) => <span className="text-sm text-text-primary">{course.module}</span> },
            { key: 'rep', label: 'Class Rep', render: (course) => <span className="text-sm text-text-primary">{course.classRep}</span> },
            { key: 'perf', label: 'Performance', render: (course) => <span className="text-sm font-semibold text-text-primary">{course.performance}%</span> },
          ]}
        />
      </Panel>
    </div>
  );
}
