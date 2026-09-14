'use client';

import { useEffect, useState } from 'react';
import { BookOpen, FileText, Upload, Users, RefreshCw } from 'lucide-react';
import { AssignedCoursesTable } from '@/components/lecturer/AssignedCoursesTable';
import { AppButton } from '@/components/ui/AppButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { SectionGrid } from '@/components/ui/SectionGrid';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

export default function LecturerDashboardPage() {
  const { user } = useAuth();
  const [coursesCount, setCoursesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [repsCount, setRepsCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const coursesEndpoint = user?.id ? `/courses?lecturerId=${user.id}` : '/courses';
      const contentEndpoint = user?.id ? `/content?uploaderId=${user.id}` : '/content';
      let studentsEndpoint = '/admin/users?role=STUDENT';
      if (user?.departmentId) studentsEndpoint += `&departmentId=${user.departmentId}`;
      else if (user?.schoolId) studentsEndpoint += `&schoolId=${user.schoolId}`;

      const [courses, students, reps, content] = await Promise.all([
        adminApiRequest(coursesEndpoint).catch(() => []),
        adminApiRequest(studentsEndpoint).catch(() => []),
        adminApiRequest('/admin/class-reps').catch(() => []),
        adminApiRequest(contentEndpoint).catch(() => []),
      ]);

      if (Array.isArray(courses)) setCoursesCount(courses.length);
      if (Array.isArray(students)) setStudentsCount(students.length);
      if (Array.isArray(reps)) {
        const filteredReps = reps.filter(r => {
          if (user?.departmentId) return r.student?.departmentId === user.departmentId;
          if (user?.schoolId) return r.student?.schoolId === user.schoolId;
          return true;
        });
        setRepsCount(filteredReps.length);
      }
      if (Array.isArray(content)) setContentCount(content.length);
    } catch (err) {
      console.warn('Lecturer dashboard metrics warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user?.id, user?.departmentId, user?.schoolId]);

  const deptName =
    user?.department?.name ||
    (typeof user?.department === 'string' ? user.department : null) ||
    'Computer Science';

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome Back, ${user?.name || 'Lecturer'}`}
        subtitle={`Department: ${deptName} • Operational overview of your assigned courses, resources, and student reps.`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <AppButton href="/dashboard/lecturer/content">
              <Upload className="h-4 w-4" />
              Upload Content
            </AppButton>
          </div>
        }
      />

      <SectionGrid>
        <Panel
          title="Academic Overview"
          subtitle="Real-time live system metrics for your active department."
        >
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-surface p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-text-primary">{coursesCount}</p>
                  <p className="text-xs font-semibold text-text-secondary">Assigned Courses</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-text-primary">{studentsCount}</p>
                  <p className="text-xs font-semibold text-text-secondary">Department Students</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gold text-white">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-text-primary">{repsCount}</p>
                  <p className="text-xs font-semibold text-text-secondary">Appointed Class Reps</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-surface p-5 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-text-primary">{contentCount}</p>
                  <p className="text-xs font-semibold text-text-secondary">Uploaded Resources</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </SectionGrid>

      <AssignedCoursesTable onCoursesUpdated={fetchMetrics} />
    </div>
  );
}
