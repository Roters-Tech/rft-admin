'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCheck, Plus, ShieldCheck, WalletCards, RefreshCw } from 'lucide-react';
import { platformSchools } from '@/lib/mock-data/platform';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { MetricCard } from '@/components/ui/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { SectionGrid } from '@/components/ui/SectionGrid';
import { SchoolActionCenter } from '@/components/demo/SchoolActionCenter';
import { adminApiRequest } from '@/lib/apiClient';

export default function SuperDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      let schoolsData = await adminApiRequest('/admin/schools').catch(() => null);
      if (!schoolsData || !Array.isArray(schoolsData)) {
        schoolsData = await adminApiRequest('/schools/public').catch(() => []);
      }

      let metricsData = await adminApiRequest('/admin/analytics/overview').catch(() => null);
      if (!metricsData) {
        metricsData = await adminApiRequest('/admin/analytics/public/overview').catch(() => null);
      }

      if (metricsData) {
        setMetrics(metricsData);
      }

      if (Array.isArray(schoolsData)) {
        setSchools(
          schoolsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            students: s.studentCount ?? (s._count?.users || 0),
            lecturers: s.lecturerCount ?? (s._count?.users || 0),
            courses: s._count?.courses || s.courses || 0,
            status: s.status === 'deleted' ? 'critical' : 'optimal',
          }))
        );
      }
    } catch (err) {
      console.warn('Backend query error in SuperDashboardPage:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Overview"
        subtitle="Real-time overview of all RFT schools and institutions."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <AppButton href="/dashboard/super/onboarding">
              <Plus className="h-4 w-4" />
              New School
            </AppButton>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          label="Total Schools"
          value={String(metrics?.totalSchools ?? schools.length)}
          helper={
            <span className="inline-flex items-center gap-2 text-status-optimal">
              <ArrowUpRight className="h-4 w-4" /> Live System Data
            </span>
          }
          accentClassName="bg-brand-navy"
        />
        <MetricCard
          label="Total Lecturers"
          value={String(metrics?.totalLecturers ?? 0)}
          helper={
            <span className="inline-flex items-center gap-2 text-status-optimal">
              <CheckCheck className="h-4 w-4" /> Verified Staff
            </span>
          }
          accentClassName="bg-brand-gold"
        />
        <MetricCard
          label="Active Students"
          value={String(metrics?.totalStudents ?? 0)}
          helper={<span className="text-status-optimal">Real-time Student Count</span>}
          accentClassName="bg-brand-navy-mid"
        />
      </div>


      <SectionGrid>
        <Panel title="Schools Overview" subtitle="Platform visibility across all registered campuses.">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  <th className="sticky left-0 bg-white py-3 pr-4">School</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Lecturers</th>
                  <th className="px-4 py-3">Courses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id} className="border-b border-gray-100 transition-all duration-200 ease-in-out hover:bg-brand-navy-light">
                    <td className="sticky left-0 bg-white py-4 pr-4 text-sm font-semibold text-text-primary">{school.name}</td>
                    <td className="px-4 py-4 text-sm text-text-primary">{school.students.toLocaleString()}</td>
                    <td className="px-4 py-4 text-sm text-text-primary">{school.lecturers}</td>
                    <td className="px-4 py-4 text-sm text-text-primary">{school.courses}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={school.status} />
                    </td>
                    <td className="px-4 py-4">
                      <SchoolActionCenter schools={schools} schoolId={school.id} />
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Role Assignment" subtitle="Create platform users and map them to the correct school.">
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Roles & Access Management</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Assign admin or lecturer access with required identity fields.
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-status-optimal" />
                </div>
              </div>
              <AppButton href="/dashboard/super/roles" className="w-full">
                Open Roles Workspace
              </AppButton>
            </div>
          </Panel>
          <Panel title="Subscription Fees" subtitle="Manage school subscription tiers and access.">
            <div className="space-y-4">
              <div className="rounded-2xl bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-text-primary">Free, Premium, and custom tiers</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Configure pricing, school access, and premium modules.
                    </p>
                  </div>
                  <WalletCards className="h-5 w-5 text-brand-gold" />
                </div>
              </div>
              <AppButton href="/dashboard/super/fees" variant="secondary" className="w-full">
                Open Fee Structure
              </AppButton>
            </div>
          </Panel>
        </div>
      </SectionGrid>
    </div>
  );
}
