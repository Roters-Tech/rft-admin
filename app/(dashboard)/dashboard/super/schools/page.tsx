'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, RefreshCw, Trash2, Power, MoreVertical, ExternalLink, CreditCard, X } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

export default function SuperSchoolsPage() {
  const { showToast } = useToast();
  const [schools, setSchools] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [tierModalSchool, setTierModalSchool] = useState<any | null>(null);
  const [selectedTierPlan, setSelectedTierPlan] = useState('Free Plan');
  const [submittingTier, setSubmittingTier] = useState(false);

  const handleChangeTier = async (schoolId: string, newPlan: string) => {
    setSubmittingTier(true);
    try {
      await adminApiRequest(`/admin/schools/${schoolId}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ planName: newPlan }),
      });
      showToast(`Successfully updated subscription to ${newPlan}!`, 'success');
      setTierModalSchool(null);
      fetchSchools();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update subscription tier', 'error');
    } finally {
      setSubmittingTier(false);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      let data = await adminApiRequest('/admin/schools').catch(() => null);
      if (!data || !Array.isArray(data)) {
        data = await adminApiRequest('/schools/public').catch(() => []);
      }
      if (Array.isArray(data)) {
        setSchools(data);
      }
    } catch (err) {
      console.warn('Backend query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Close open dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleToggleSchoolStatus = async (id: string, name: string, currentStatus?: string) => {
    setOpenMenuId(null);
    const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
    const actionText = newStatus === 'deactivated' ? 'deactivate' : 'reactivate';

    if (
      !confirm(
        `Are you sure you want to ${actionText} "${name}"? ${
          newStatus === 'deactivated'
            ? 'Users of this campus will be blocked from logging in.'
            : 'Users will be able to access the system again.'
        }`
      )
    ) {
      return;
    }

    try {
      await adminApiRequest(`/admin/schools/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Successfully ${actionText}d ${name}`, 'success');
      fetchSchools();
    } catch (err: any) {
      showToast(err?.message || `Failed to ${actionText} school`, 'error');
    }
  };

  const handleDeleteSchool = async (id: string, name: string) => {
    setOpenMenuId(null);
    if (!confirm(`Are you sure you want to soft delete "${name}"? It will be deactivated and hidden from active platform directory.`)) {
      return;
    }

    try {
      await adminApiRequest(`/admin/schools/${id}`, { method: 'DELETE' });
      showToast(`Successfully soft deleted ${name}`, 'success');
      setSchools((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      showToast(err?.message || 'Failed to soft delete school', 'error');
    }
  };

  const filteredSchools = schools.filter((school) =>
    school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.acronym?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <div className="rounded-[24px] sm:rounded-[28px] border border-[#ebeefd] bg-white p-4 sm:p-6 shadow-[0_10px_30px_rgba(15,30,90,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-[36px] font-bold tracking-[-0.03em] text-brand-navy">School Directory</h1>
            <p className="mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-text-secondary">
              Oversee all onboarded institutions within the global ecosystem. Manage credentials, soft-delete schools, and monitor institutional performance metrics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={fetchSchools}
              disabled={loading}
              className="inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 sm:px-4 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sync API
            </button>
            <Link
              href="/dashboard/super/onboarding"
              className="inline-flex h-10 sm:h-11 items-center justify-center rounded-xl bg-brand-navy px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-brand-navy-deep"
            >
              + Onboard New School
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#eef1fb] bg-white p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Total Schools</p>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
              <p className="font-display text-2xl sm:text-[32px] font-bold leading-none text-brand-navy">{schools.length}</p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-status-optimal">Live Directory</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#eef1fb] bg-white p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Active Campuses</p>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
              <p className="font-display text-2xl sm:text-[32px] font-bold leading-none text-brand-navy">
                {schools.filter((s) => s.status === 'active' || !s.status).length}
              </p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-status-optimal">Active</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#eef1fb] bg-white p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Coverage</p>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
              <p className="font-display text-2xl sm:text-[32px] font-bold leading-none text-brand-navy">100%</p>
              <span className="text-[10px] sm:text-[11px] font-semibold text-brand-navy">Global</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#eef1fb] bg-white p-3.5 sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">Security Guard</p>
            <div className="mt-2 sm:mt-3 flex items-baseline gap-2">
              <p className="font-display text-lg sm:text-[24px] font-bold leading-none text-status-optimal">Protected</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex h-11 items-center rounded-xl border border-[#eef1fb] bg-[#fafbff] px-4">
            <Search className="mr-3 h-4 w-4 text-text-muted flex-shrink-0" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by school name, acronym, or location..."
              className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#eef1fb] bg-white">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-[#fbfcff] text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted border-b border-[#f0f2fb]">
                <th className="px-4 py-3.5 whitespace-nowrap">School Details</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Location / Address</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Acronym</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Plan</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2fb]">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-text-muted font-semibold">
                    No schools found matching your search.
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => (
                  <tr key={school.id} className="text-xs sm:text-sm text-text-primary hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div>
                        <Link href={`/dashboard/super/schools/${school.id}`} className="font-bold text-brand-navy hover:underline truncate block">
                          {school.name}
                        </Link>
                        <p className="mt-0.5 text-[11px] text-text-muted font-mono truncate">ID: {school.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary truncate">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
                        <span className="truncate">{school.address || school.locationLabel || 'Lagos, Nigeria'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold text-brand-navy whitespace-nowrap">
                      {school.acronym || 'RFT'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded-full bg-[#eef2ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-navy border border-brand-navy/15">
                        {school.plan || school.subscription?.planName || 'Free Plan'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {school.status === 'deactivated' ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-800 border border-amber-200">
                          Deactivated
                        </span>
                      ) : (
                        <span className="rounded-full bg-status-optimal-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-status-optimal border border-emerald-200">
                          {school.status || 'Active'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 relative dropdown-container">
                        <Link
                          href={`/dashboard/super/schools/${school.id}`}
                          className="inline-flex items-center gap-1 rounded-xl bg-[#f4f6ff] px-3 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
                        >
                          Manage Profile
                        </Link>

                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === school.id ? null : school.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Actions Menu"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* 3-Dot Actions Dropdown */}
                        {openMenuId === school.id && (
                          <div className="absolute right-0 top-10 z-30 w-52 rounded-2xl bg-white p-1.5 shadow-xl border border-gray-100 text-left space-y-1 animate-in fade-in zoom-in-95 duration-100">
                            <Link
                              href={`/dashboard/super/schools/${school.id}`}
                              onClick={() => setOpenMenuId(null)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4 text-brand-navy" />
                              View Profile
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                setTierModalSchool(school);
                                setSelectedTierPlan(school.plan || school.subscription?.planName || 'Free Plan');
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-brand-navy hover:bg-brand-navy/10 transition-colors"
                            >
                              <CreditCard className="h-4 w-4 text-brand-navy" />
                              Change Subscription Tier
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSchoolStatus(school.id, school.name, school.status)}
                              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                                school.status === 'deactivated'
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-amber-800 hover:bg-amber-50'
                              }`}
                            >
                              <Power className="h-4 w-4" />
                              {school.status === 'deactivated' ? 'Reactivate Access' : 'Deactivate Access'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteSchool(school.id, school.name)}
                              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete School
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Change Modal */}
      {tierModalSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-gold" />
                Change Subscription Tier
              </h3>
              <button
                type="button"
                onClick={() => setTierModalSchool(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Select a subscription plan for <strong>{tierModalSchool.name}</strong>. Student capacity limits and platform features will update instantly.
            </p>

            <div className="space-y-3">
              {[
                { name: 'Free Plan', price: '₦0 / yr', cap: 'Max 10 Students', desc: 'Basic past question view & essential features' },
                { name: 'Premium Plan', price: '₦499,000 / yr', cap: 'Max 5,000 Students', desc: 'Full past question upload/download, lecturer management & analytics' },
                { name: 'Enterprise Plan', price: '₦1,499,000 / yr', cap: 'Max 100,000 Students', desc: 'Unlimited multi-campus hierarchy, custom API & dedicated support' },
              ].map((tier) => {
                const currentPlan = (tierModalSchool.plan || 'Free Plan').toLowerCase();
                const isCurrent = currentPlan.includes(tier.name.split(' ')[0].toLowerCase());
                const isSelected = selectedTierPlan === tier.name;

                return (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTierPlan(tier.name)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-brand-navy uppercase">{tier.name}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{tier.price}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{tier.desc}</span>
                      <span className="font-extrabold text-emerald-700">{tier.cap}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={() => setTierModalSchool(null)}
                className="h-10 rounded-xl px-4 text-xs font-semibold text-text-secondary hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingTier}
                onClick={() => handleChangeTier(tierModalSchool.id, selectedTierPlan)}
                className="h-10 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
              >
                {submittingTier ? 'Updating...' : `Confirm ${selectedTierPlan}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
