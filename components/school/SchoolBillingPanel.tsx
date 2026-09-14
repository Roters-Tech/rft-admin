'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { CreditCard, CheckCircle, AlertTriangle, ArrowDown, Clock } from 'lucide-react';
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
      showToast(`Downgrade to ${downgradeModal.plan.name} scheduled. Your current plan will remain active until the end of the billing cycle.`, 'success');
      setDowngradeModal({ open: false, plan: null });
      // Re-fetch data so the UI reflects the scheduled downgrade
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
  const maxCapacity = metrics?.schoolCapacity ?? (user as any)?.schoolCapacity ?? (user as any)?.capacity ?? 10;
  const nextPlanId = metrics?.nextPlanId || null;
  const planExpiresAt = metrics?.planExpiresAt ? new Date(metrics.planExpiresAt) : null;
  
  const isUnlimited = maxCapacity === 0;
  const isNearLimit = isUnlimited ? false : currentStudents >= Math.floor(maxCapacity * 0.9);
  const isAtLimit = isUnlimited ? false : currentStudents >= maxCapacity;

  // Determine what the button should say for each plan
  const getButtonState = (plan: Plan) => {
    const isCurrent = plan.maxStudents === maxCapacity;
    const isDowngrade = plan.maxStudents < maxCapacity;
    const isScheduledDowngrade = nextPlanId === plan.id;

    if (isCurrent) return { label: 'Current Plan', disabled: true, style: 'current' };
    if (isScheduledDowngrade) return { label: 'Downgrade Scheduled', disabled: true, style: 'scheduled' };
    if (isDowngrade) return { label: 'Downgrade Plan', disabled: false, style: 'downgrade' };
    return { label: 'Upgrade via Paystack', disabled: false, style: 'upgrade' };
  };

  const handlePlanAction = (plan: Plan) => {
    const state = getButtonState(plan);
    if (state.style === 'downgrade') {
      setDowngradeModal({ open: true, plan });
    } else if (state.style === 'upgrade') {
      handleUpgrade(plan);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Usage Widget */}
      <div className="rounded-[24px] border border-[#ebeefd] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-navy mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-brand-blue" />
          Current Subscription Status
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Student Enrolment
              </span>
              <span className="text-2xl font-bold text-brand-navy">
                {currentStudents.toLocaleString()} <span className="text-lg text-text-muted font-medium">/ {isUnlimited ? 'Unlimited' : maxCapacity.toLocaleString()}</span>
              </span>
            </div>
            {/* Progress Bar */}
            <div className="h-4 w-full bg-[#f1f3fa] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-status-optimal'}`}
                style={{ width: `${isUnlimited ? (Math.min(currentStudents / 100, 100)) : Math.min((currentStudents / maxCapacity) * 100, 100)}%` }}
              />
            </div>
            
            {isAtLimit && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4" /> Capacity reached. New student registrations are blocked.
              </p>
            )}
            {!isAtLimit && isNearLimit && (
              <p className="mt-3 text-sm text-amber-600 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4" /> Approaching capacity limit. Upgrade recommended.
              </p>
            )}

            {planExpiresAt && (
              <p className="mt-3 text-sm text-text-secondary flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Current billing cycle ends: <strong>{planExpiresAt.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
            )}

            {nextPlanId && (
              <p className="mt-2 text-sm text-amber-600 flex items-center gap-1.5 font-medium">
                <ArrowDown className="w-4 h-4" /> Downgrade to <strong>{plans.find(p => p.id === nextPlanId)?.name || nextPlanId}</strong> scheduled at end of cycle.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <h2 className="text-xl font-bold text-brand-navy mt-8 mb-4">Available Plans</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const btnState = getButtonState(plan);
          return (
            <div key={plan.id} className={`relative rounded-[24px] border ${btnState.style === 'current' ? 'border-brand-blue ring-2 ring-brand-blue/20' : 'border-[#ebeefd]'} bg-white p-6 hover:shadow-card-hover transition-all flex flex-col`}>
              {btnState.style === 'current' && (
                <span className="absolute -top-3 left-6 bg-brand-blue text-white text-xs font-bold px-3 py-1 rounded-full">Current Plan</span>
              )}
              {btnState.style === 'scheduled' && (
                <span className="absolute -top-3 left-6 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Downgrade Scheduled
                </span>
              )}
              <h3 className="text-lg font-bold text-brand-navy">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-black text-brand-navy">
                  {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && <span className="text-sm text-text-muted">/cycle</span>}
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-start gap-2 text-sm text-brand-navy font-semibold">
                  <CheckCircle className="w-4 h-4 text-status-optimal shrink-0 mt-0.5" />
                  Up to {plan.maxStudents.toLocaleString()} Students
                </li>
                {plan.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanAction(plan)}
                disabled={btnState.disabled || upgradingPlanId === plan.id}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  btnState.style === 'current'
                    ? 'bg-brand-blue/10 text-brand-blue cursor-default border border-brand-blue/30'
                    : btnState.style === 'scheduled'
                      ? 'bg-amber-50 text-amber-600 cursor-default border border-amber-300'
                      : btnState.style === 'downgrade'
                        ? 'bg-white text-brand-navy border-2 border-brand-navy hover:bg-brand-navy hover:text-white'
                        : 'bg-brand-navy text-white hover:bg-brand-navy-deep hover:shadow-lg'
                }`}
              >
                {upgradingPlanId === plan.id ? 'Processing...' : btnState.label}
              </button>
            </div>
          );
        })}
      </div>

      {/* Downgrade Confirmation Modal */}
      {downgradeModal.open && downgradeModal.plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <ArrowDown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Confirm Downgrade</h3>
                <p className="text-sm text-text-muted">This action cannot be reversed until the next cycle.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-900 leading-relaxed">
                Are you sure you want to downgrade to <strong>{downgradeModal.plan.name}</strong>?
              </p>
              <p className="text-sm text-amber-800 mt-2 leading-relaxed">
                Your current plan will remain <strong>fully active</strong> until the end of your billing cycle
                {planExpiresAt && (
                  <> (<strong>{planExpiresAt.toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>)</>
                )}.
                After that, your capacity will be reduced to <strong>{downgradeModal.plan.maxStudents.toLocaleString()} students</strong>.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDowngradeModal({ open: false, plan: null })}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-text-secondary hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleDowngrade}
                disabled={schedulingDowngrade}
                className="flex-1 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all disabled:opacity-50"
              >
                {schedulingDowngrade ? 'Scheduling...' : 'Yes, Downgrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
