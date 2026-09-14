'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Sparkles, RefreshCw, Plus, Edit3, Trash2, ShieldCheck, X } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

interface Plan {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
  features: string[];
  status?: string;
}

export default function SuperFeesPage() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeesData = async () => {
    setLoading(true);
    try {
      const [overviewData, schoolsData, plansData] = await Promise.all([
        adminApiRequest('/admin/analytics/overview').catch(() => null),
        adminApiRequest('/admin/schools').catch(() => null),
        adminApiRequest('/admin/subscriptions').catch(() => null),
      ]);

      if (overviewData) setMetrics(overviewData);
      if (Array.isArray(schoolsData)) setSchools(schoolsData);
      if (Array.isArray(plansData) && plansData.length > 0) {
        setPlans(plansData);
      } else {
        setPlans([
          {
            id: 'plan-free',
            name: 'Free Trial',
            price: 0,
            maxStudents: 10,
            features: ['Past Questions View', 'Basic Analytics', 'Max 10 Students Limit'],
          },
          {
            id: 'plan-premium',
            name: 'Premium Plan',
            price: 499000,
            maxStudents: 5000,
            features: ['Unlimited Lecturers', 'Advanced Analytics', 'Past Question Downloads', 'Max 5,000 Students'],
          },
          {
            id: 'plan-enterprise',
            name: 'Enterprise Plan',
            price: 1499000,
            maxStudents: 100000,
            features: ['Multi-Campus Hierarchy', 'Dedicated Manager', 'Custom API Access', 'Max 100,000 Students'],
          },
        ]);
      }
    } catch (err) {
      console.warn('Backend fees query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPrice('499000');
    setMaxStudents('500');
    setFeaturesText('Past Question Access, Lecturer Management, Assessment Workflows');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPrice(String(plan.price));
    setMaxStudents(String(plan.maxStudents));
    setFeaturesText(plan.features ? plan.features.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) {
      showToast('Please enter a plan name', 'error');
      return;
    }

    const payload = {
      name: planName.trim(),
      price: price ? Number(price) : 0,
      maxStudents: maxStudents !== '' ? Number(maxStudents) : 10,
      features: featuresText.split(',').map((f) => f.trim()).filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (editingPlan) {
        await adminApiRequest(`/admin/subscriptions/${editingPlan.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        showToast(`Updated ${planName} subscription tier!`, 'success');
      } else {
        await adminApiRequest('/admin/subscriptions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast(`Created new subscription tier: ${planName}!`, 'success');
      }
      setIsModalOpen(false);
      fetchFeesData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save subscription plan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" subscription tier?`)) return;

    try {
      await adminApiRequest(`/admin/subscriptions/${id}`, { method: 'DELETE' });
      showToast(`Deleted ${name} subscription tier`, 'success');
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete plan', 'error');
    }
  };

  const totalRevenue = metrics ? `₦${(metrics.totalRevenue || 0).toLocaleString()}` : '₦0.00';

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#ebeefd] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,30,90,0.05)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="font-display text-[34px] font-bold tracking-[-0.03em] text-brand-navy">
              Subscription & Institutional Fees
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Configure institutional access tiers, set maximum student capacity limits per plan, and manage subscription revenue.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFeesData}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Financials
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-sm font-semibold text-white hover:bg-brand-navy-deep transition-all"
            >
              <Plus className="h-4 w-4" />
              Create New Plan
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-brand-navy/20 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Total Platform Revenue</p>
            <p className="mt-3 font-display text-[34px] font-bold leading-none text-brand-navy">{totalRevenue}</p>
            <p className="mt-2 text-[11px] font-medium text-status-optimal">Live Payment Gateway</p>
          </div>

          <div className="rounded-2xl border border-brand-gold/50 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Configured Tiers</p>
            <p className="mt-3 font-display text-[34px] font-bold leading-none text-brand-navy">{plans.length}</p>
            <p className="mt-2 text-[11px] font-medium text-brand-navy">Super Admin Configurable</p>
          </div>

          <div className="rounded-2xl border border-[#eef1fb] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Active Universities</p>
            <p className="mt-3 font-display text-[34px] font-bold leading-none text-brand-navy">{schools.length}</p>
            <p className="mt-2 text-[11px] font-medium text-status-optimal">Active Entitlements</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {plans.map((tier, index) => (
            <div
              key={tier.id || tier.name}
              className={`relative rounded-[24px] border bg-white p-5 transition-all ${index === 1 ? 'border-brand-navy shadow-card-hover' : 'border-[#eef1fb]'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="rounded-full bg-[#f5f6fb] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-muted inline-block">
                    Cap: {tier.maxStudents.toLocaleString()} Students
                  </div>
                  <p className="mt-4 text-[26px] font-bold text-brand-navy">
                    {tier.name}
                  </p>
                  <p className="mt-2 font-display text-[32px] font-bold leading-none text-brand-navy">
                    ₦{tier.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    billed annually / per school
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(tier)}
                    title="Edit Subscription Tier"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  {plans.length > 1 && (
                    <button
                      onClick={() => handleDeletePlan(tier.id, tier.name)}
                      title="Delete Subscription Tier"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-[#edf0fb] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-navy">
                  Student Limit: <span className="text-status-optimal font-extrabold">{tier.maxStudents.toLocaleString()}</span>
                </p>
                {tier.features?.map((feature) => (
                  <div key={feature} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="mt-1 h-2 w-2 rounded-full bg-status-optimal flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openEditModal(tier)}
                type="button"
                className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-xl border border-gray-200 text-xs font-semibold text-brand-navy hover:bg-brand-navy hover:text-white transition-all"
              >
                Edit Tier & Capacity
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] border border-[#eef1fb] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-brand-navy">Institutional Enrolment & Upgrade Status</h2>
              <p className="mt-1 text-xs text-text-secondary">Schools automatically prompt for tier upgrades when student capacity limit is reached.</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  <th className="px-3 py-3">Institution</th>
                  <th className="px-3 py-3">Assigned Plan</th>
                  <th className="px-3 py-3">Student Capacity</th>
                  <th className="px-3 py-3">Capacity Status</th>
                </tr>
              </thead>
              <tbody>
                {schools.length > 0 ? (
                  schools.map((school, index) => {
                    const assignedPlanName = school.plan || school.subscription?.planName || 'Free Plan';
                    const matchedPlan = plans.find((p) => p.name.toLowerCase() === assignedPlanName.toLowerCase()) || plans[0];
                    const maxCap = matchedPlan?.maxStudents || 10;
                    const currentStudents = school.studentCount ?? 0;
                    const isWithinLimit = currentStudents <= maxCap;

                    return (
                      <tr key={school.id} className={index !== 0 ? 'border-t border-[#edf0fb]' : ''}>
                        <td className="px-3 py-4 text-sm font-semibold text-brand-navy">
                          {school.name} ({school.acronym || 'RFT'})
                        </td>
                        <td className="px-3 py-4 text-sm text-text-secondary font-medium">
                          <span className="rounded-md bg-[#eef2ff] px-2.5 py-1 text-xs font-semibold text-brand-navy">
                            {assignedPlanName}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-text-secondary font-bold">
                          {currentStudents.toLocaleString()} / {maxCap.toLocaleString()}
                        </td>
                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                              isWithinLimit ? 'bg-status-optimal-bg text-status-optimal' : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {isWithinLimit ? 'Within Limit' : 'Cap Exceeded'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="border-t border-[#edf0fb]">
                    <td colSpan={4} className="px-3 py-8 text-center text-xs font-medium text-text-muted">
                      No institutions onboarded yet. Create or onboard a school to assign subscription plans and monitor enrolment limits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interactive Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-brand-navy">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Plan Name
                </label>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Standard Tier"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Annual Price (₦)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="499000"
                    required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                    Max Student Limit
                  </label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    placeholder="10 or 500 or 5000"
                    required
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Features / Permissions (comma separated)
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Past Questions View, Lecturer Management, Assessment Workflows"
                  className="w-full rounded-xl border border-gray-200 bg-surface p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-brand-navy px-6 text-sm font-bold text-white hover:bg-brand-navy-deep transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
