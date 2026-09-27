'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import {
  CreditCard,
  CheckCircle,
  AlertTriangle,
  ArrowDown,
  Clock,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface Plan {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
  features: string[];
}

export function SchoolBillingPanel() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference');
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  // Downgrade modal state
  const [downgradeModal, setDowngradeModal] = useState<{ open: boolean; plan: Plan | null }>({
    open: false,
    plan: null,
  });
  const [schedulingDowngrade, setSchedulingDowngrade] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);

  // Verify payment on redirect back from Paystack
  useEffect(() => {
    const verifyPayment = async (ref: string) => {
      try {
        await adminApiRequest('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({ reference: ref }),
        });
        showToast('Subscription payment verified successfully!', 'success');
        router.replace('/dashboard/school/billing');
      } catch (err: any) {
        showToast(err.message || 'Payment verification failed', 'error');
      }
    };

    if (reference) {
      verifyPayment(reference);
    }
  }, [reference, router, showToast]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, overviewData] = await Promise.all([
        adminApiRequest('/admin/subscriptions').catch(() => null),
        adminApiRequest('/admin/analytics/overview').catch(() => null),
      ]);
      if (plansData) setPlans(plansData);
      if (overviewData) setMetrics(overviewData);
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpgrade = async (plan: Plan) => {
    try {
      setUpgradingPlanId(plan.id);
      const res = await adminApiRequest('/admin/subscriptions/upgrade', {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id, amount: plan.price }),
      });
      if (res && res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        showToast('Failed to initialize payment', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Upgrade failed', 'error');
    } finally {
      setUpgradingPlanId(null);
    }
  };

  const handleScheduleDowngrade = async () => {
    if (!downgradeModal.plan) return;
    setSchedulingDowngrade(true);
    try {
      await adminApiRequest('/admin/subscriptions/schedule-downgrade', {
        method: 'POST',
        body: JSON.stringify({ planId: downgradeModal.plan.id }),
      });
      showToast(
        `Downgrade to ${downgradeModal.plan.name} scheduled. Your current plan will remain active until the end of the billing cycle.`,
        'success'
      );
      setDowngradeModal({ open: false, plan: null });
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule downgrade', 'error');
    } finally {
      setSchedulingDowngrade(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-secondary animate-pulse">Loading billing details...</div>;
  }

  const currentStudents = metrics?.totalStudents || 0;
  const currentPlanName = metrics?.currentPlanName || null;
  const nextPlanId = metrics?.nextPlanId || null;
  const planExpiresAt = metrics?.planExpiresAt ? new Date(metrics.planExpiresAt) : null;

  // Resolve active plan accurately
  const currentPlan =
    plans.find(
      (p) =>
        (currentPlanName &&
          (p.name.toLowerCase() === currentPlanName.toLowerCase() ||
            p.id.toLowerCase() === currentPlanName.toLowerCase())) ||
        (metrics?.schoolCapacity && p.maxStudents === metrics.schoolCapacity)
    ) ||
    plans.find((p) => p.price === 0) ||
    plans[0];

  const currentCapacity = currentPlan?.maxStudents ?? metrics?.schoolCapacity ?? 10;
  const isUnlimited = currentCapacity >= 100000;
  const isNearLimit = isUnlimited ? false : currentStudents >= Math.floor(currentCapacity * 0.9);
  const isAtLimit = isUnlimited ? false : currentStudents >= currentCapacity;

  // Filter lower tiers for the discreet management section
  const lowerTierPlans = plans.filter(
    (p) => currentPlan && p.id !== currentPlan.id && p.price < currentPlan.price && p.maxStudents < currentPlan.maxStudents
  );
  const highestPlanPrice = Math.max(...plans.map((p) => p.price), 0);

  return (
    <div className="space-y-8">
      {/* Current Usage Widget */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-brand-navy/10 flex items-center justify-center text-brand-navy">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-brand-navy">
                Current Subscription: <span className="text-brand-primary">{currentPlan?.name || 'Active Plan'}</span>
              </h2>
              <p className="text-xs text-gray-500">Live institutional capacity and quota utilization</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            {currentPlan?.name || 'Active Plan'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Student Enrolment Limit
            </span>
            <span className="text-2xl font-black text-brand-navy">
              {currentStudents.toLocaleString()}{' '}
              <span className="text-sm text-gray-400 font-semibold">
                / {isUnlimited ? 'Unlimited' : currentCapacity.toLocaleString()} Students
              </span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-brand-navy'
              }`}
              style={{
                width: `${
                  isUnlimited
                    ? Math.min((currentStudents / 100) * 100, 100)
                    : Math.min((currentStudents / currentCapacity) * 100, 100)
                }%`,
              }}
            />
          </div>

          {isAtLimit && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2 font-medium border border-red-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Student capacity limit reached. Upgrade your plan below to unlock more registrations.</span>
            </div>
          )}
          {!isAtLimit && isNearLimit && (
            <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 flex items-center gap-2 font-medium border border-amber-100">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Approaching capacity limit (over 90% utilized). Upgrade recommended.</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-500 border-t border-slate-100">
            {planExpiresAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Current billing cycle renewal:{' '}
                <strong className="text-gray-700 font-semibold">
                  {planExpiresAt.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </strong>
              </span>
            )}

            {nextPlanId && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-amber-700 font-bold border border-amber-200">
                <Clock className="w-3.5 h-3.5" />
                Downgrade to {plans.find((p) => p.id === nextPlanId)?.name || nextPlanId} scheduled for next cycle
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-brand-navy">Available Subscription Plans</h2>
            <p className="text-xs text-gray-500">Scale your institutional capacity and unlock premium features</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrent = currentPlan ? plan.id === currentPlan.id : plan.maxStudents === currentCapacity;
            const isUpgrade =
              !isCurrent &&
              (plan.price > (currentPlan?.price ?? 0) || plan.maxStudents > (currentPlan?.maxStudents ?? 0));
            const isScheduledDowngrade = nextPlanId === plan.id;
            const isFeatured = isUpgrade && plan.price === highestPlanPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-[28px] border transition-all flex flex-col p-6 sm:p-7 ${
                  isCurrent
                    ? 'border-brand-navy ring-2 ring-brand-navy/10 bg-white shadow-md'
                    : isFeatured
                    ? 'border-brand-primary/40 bg-gradient-to-b from-brand-primary/5 to-white shadow-md hover:shadow-xl hover:-translate-y-0.5'
                    : isUpgrade
                    ? 'border-slate-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5'
                    : 'border-slate-200/70 bg-slate-50/60 opacity-90'
                }`}
              >
                {/* Header Badges */}
                {isCurrent && (
                  <span className="absolute -top-3 left-6 bg-brand-navy text-white text-[11px] font-extrabold tracking-wider uppercase px-3 py-0.5 rounded-full shadow-sm">
                    Current Active Plan
                  </span>
                )}
                {isFeatured && !isCurrent && (
                  <span className="absolute -top-3 left-6 bg-gradient-to-r from-brand-primary to-brand-navy text-white text-[11px] font-extrabold tracking-wider uppercase px-3.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended
                  </span>
                )}
                {isScheduledDowngrade && (
                  <span className="absolute -top-3 left-6 bg-amber-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Clock className="w-3 h-3" /> Scheduled for Next Cycle
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 mt-1">
                  <h3 className="text-lg font-bold text-brand-navy">{plan.name}</h3>
                  {isUpgrade && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <Zap className="w-3 h-3 text-emerald-600" />
                      +{Math.max(plan.maxStudents - currentCapacity, 0).toLocaleString()} Cap
                    </span>
                  )}
                </div>

                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-brand-navy">
                      {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && <span className="text-xs text-gray-500 font-semibold">/ billing cycle</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports up to <strong className="text-brand-navy font-bold">{plan.maxStudents.toLocaleString()}</strong> students
                  </p>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8 flex-1 border-t border-slate-100 pt-5">
                  <li className="flex items-start gap-2 text-xs text-brand-navy font-bold">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    Up to {plan.maxStudents.toLocaleString()} Enrolled Students
                  </li>
                  {plan.features?.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                      <CheckCircle className="w-4 h-4 text-brand-primary/80 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Card Action Button Area */}
                <div className="mt-auto pt-2">
                  {isCurrent ? (
                    <div className="w-full py-3 rounded-2xl font-bold text-xs text-center bg-slate-100 text-slate-700 border border-slate-200 cursor-default flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Current Plan
                    </div>
                  ) : isUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgradingPlanId === plan.id}
                      className="w-full py-3.5 rounded-2xl font-bold text-xs text-white bg-brand-navy hover:bg-brand-navy/90 active:scale-[0.99] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {upgradingPlanId === plan.id ? (
                        'Initializing Payment...'
                      ) : (
                        <>
                          Upgrade to {plan.name}
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : isScheduledDowngrade ? (
                    <div className="w-full py-3 rounded-2xl font-semibold text-xs text-center bg-amber-50 text-amber-700 border border-amber-200 cursor-default flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Downgrade Scheduled
                    </div>
                  ) : (
                    <div className="w-full py-2.5 px-3 rounded-2xl bg-slate-100/70 border border-slate-200/60 text-center text-xs font-semibold text-slate-500">
                      Lower Capacity Tier
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discreet Subscription Tier Management Section (Tucked away at bottom) */}
      {lowerTierPlans.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <button
            type="button"
            onClick={() => setShowManageOptions(!showManageOptions)}
            className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              Manage Tier Settings & Downgrade Options
            </span>
            {showManageOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showManageOptions && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                If your institution requires reducing capacity for upcoming academic sessions, you may schedule a tier change below. The change will take effect seamlessly at the end of your active billing cycle without interrupting ongoing classes.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {lowerTierPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-3 bg-slate-50/50"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-800">{plan.name}</span>
                      <p className="text-[11px] text-gray-500">
                        {plan.maxStudents.toLocaleString()} students • {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDowngradeModal({ open: true, plan })}
                      className="text-xs text-gray-500 hover:text-gray-800 underline font-medium px-2 py-1 rounded hover:bg-slate-200 transition"
                    >
                      Schedule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {downgradeModal.open && downgradeModal.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center">
                <ArrowDown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-navy">Confirm Tier Schedule</h3>
                <p className="text-xs text-gray-500">Effective at the end of current cycle</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                Schedule switch to <strong>{downgradeModal.plan.name}</strong>?
              </p>
              <p className="text-xs text-amber-800 mt-2 leading-relaxed">
                Your current plan will remain <strong>fully active</strong> with existing capacity until the renewal date
                {planExpiresAt && (
                  <> (<strong>{planExpiresAt.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>)</>
                )}.
                After that, capacity will adjust to <strong>{downgradeModal.plan.maxStudents.toLocaleString()} students</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDowngradeModal({ open: false, plan: null })}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDowngrade}
                disabled={schedulingDowngrade}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all disabled:opacity-50 shadow-sm"
              >
                {schedulingDowngrade ? 'Scheduling...' : 'Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
