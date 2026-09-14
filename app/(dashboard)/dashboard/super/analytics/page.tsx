'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';

export default function SuperAnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminApiRequest('/admin/analytics/overview');
      if (data) setMetrics(data);
    } catch (err) {
      console.warn('Backend analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#ebeefd] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,30,90,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[34px] font-bold tracking-[-0.03em] text-brand-navy">Global Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Cross-institution real-time reporting for school growth, active subscriptions, and network performance.
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Metrics
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#eef1fb] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Schools Live</p>
            <p className="mt-3 font-display text-[32px] font-bold text-brand-navy">{metrics ? String(metrics.totalSchools || 0) : '0'}</p>
          </div>

          <div className="rounded-2xl border border-[#eef1fb] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Students Active</p>
            <p className="mt-3 font-display text-[32px] font-bold text-brand-navy">{metrics ? String(metrics.totalStudents || 0) : '0'}</p>
          </div>

          <div className="rounded-2xl border border-[#eef1fb] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Past Questions Library</p>
            <p className="mt-3 font-display text-[32px] font-bold text-brand-navy">{metrics ? String(metrics.pastQuestionsCount || 0) : '0'}</p>
          </div>

          <div className="rounded-2xl border border-[#eef1fb] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Active Subscriptions</p>
            <p className="mt-3 font-display text-[32px] font-bold text-status-optimal">{metrics ? String(metrics.activeSubscriptions || 0) : '0'}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#eef1fb] bg-[#fbfcff] p-6">
          <p className="text-lg font-bold text-brand-navy">Network Health Summary</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            System metrics are synchronized directly with the NestJS PostgreSQL backend database. Live data feeds total institutions, courses, student registrations, and verified content items across all campuses.
          </p>
        </div>
      </div>
    </div>
  );
}
