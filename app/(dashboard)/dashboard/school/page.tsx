'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCheck, Plus, RefreshCw, ShieldCheck, ShieldAlert } from 'lucide-react';
import { lecturers } from '@/lib/mock-data/lecturers';
import { FacultyTable } from '@/components/dashboard/FacultyTable';
import { ManagePanel } from '@/components/dashboard/ManagePanel';
import { ContentUploadPanel } from '@/components/dashboard/ContentUploadPanel';
import { AppButton } from '@/components/ui/AppButton';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { SectionGrid } from '@/components/ui/SectionGrid';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [lecturersList, setLecturersList] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<{ name: string; maxStudents: number }>({
    name: 'Free Trial',
    maxStudents: 10,
  });
  const [loading, setLoading] = useState(true);

  const schoolName = user?.school || 'University of Lagos';

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      let data = await adminApiRequest('/admin/analytics/dashboard').catch(() => null);
      if (!data) {
        data = await adminApiRequest('/admin/analytics/public/overview').catch(() => null);
      }
      if (data) {
        setMetrics(data);
      }

      const plans = await adminApiRequest('/admin/subscriptions').catch(() => []);
      if (Array.isArray(plans) && plans.length > 0) {
        const capacity = data?.schoolCapacity ?? (user as any)?.schoolCapacity ?? (user as any)?.capacity ?? 10;
        const matched = plans.find((p: any) => p.maxStudents === capacity) || plans[0];
        setActivePlan(matched);
      }

      const lecs = await adminApiRequest('/admin/users?role=LECTURER').catch(() => []);
      if (Array.isArray(lecs)) {
        setLecturersList(
          lecs.map((l: any) => ({
            id: l.id,
            name: l.fullName,
            department: l.department?.name || 'Academic Faculty',
            initials: l.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
          }))
        );
      }
    } catch (err) {
      console.warn('Backend analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const isCapReached = (metrics?.totalStudents ?? 0) >= activePlan.maxStudents && activePlan.maxStudents > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${schoolName} — School Admin`}
        subtitle="Real-time overview of academic activity across your campus."
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
            <AppButton href="/dashboard/school/lecturers">
              <Plus className="h-4 w-4" />
              Add Lecturer
            </AppButton>
          </div>
        }
      />

      {isCapReached && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  Student Enrolment Limit Reached ({metrics?.totalStudents ?? 0} / {activePlan.maxStudents} Students)
                </h3>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  Your institution has reached the maximum capacity limit for the <strong>{activePlan.name}</strong>. Upgrade to a higher subscription tier to onboard more students and unlock full platform capabilities.
                </p>
              </div>
            </div>
            <a
              href="/dashboard/school/billing"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm transition-all"
            >
              Upgrade Subscription Plan
            </a>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          label="Total Students"
          value={String(metrics?.totalStudents ?? 0)}
          helper={
            <span className="inline-flex items-center gap-2 text-status-optimal">
              <ArrowUpRight className="h-4 w-4" /> Live System Sync
            </span>
          }
          accentClassName="bg-brand-navy"
        />
        <MetricCard
          label="Total Lecturers"
          value={String(metrics?.totalLecturers ?? lecturersList.length)}
          helper={
            <span className="inline-flex items-center gap-2 text-status-optimal">
              <CheckCheck className="h-4 w-4" /> Verified Academic Staff
            </span>
          }
          accentClassName="bg-brand-gold"
        />
        <MetricCard
          label="Current Subscription Plan"
          value={activePlan.name}
          helper={
            <span className="inline-flex items-center gap-2 text-emerald-600 font-bold">
              <ShieldCheck className="h-4 w-4" /> Active • Limit: {activePlan.maxStudents === 0 ? 'Unlimited' : activePlan.maxStudents.toLocaleString()} Students
            </span>
          }
          accentClassName="bg-emerald-500"
        />
      </div>

      <SectionGrid>
        <Panel title="Faculty Distribution & Health" subtitle="Capacity, enrollment pressure, and academic faculty breakdown.">
          <div className="mt-2">
            <FacultyTable schoolId={user?.schoolId} />
          </div>
        </Panel>

        <div className="space-y-6">
          <ManagePanel
            title="Manage Lecturers"
            items={lecturersList}
            cta="+ Add New Lecturer"
            href="/dashboard/school/lecturers"
            iconOnly
          />
          <ContentUploadPanel
            title="Institutional Content"
            subtitle="Upload platform-wide resources and guides."
            href="/dashboard/school/content"
          />
        </div>
      </SectionGrid>
    </div>
  );
}

