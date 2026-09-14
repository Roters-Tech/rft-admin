'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';
import { DepartmentSelector } from '@/components/ui/DepartmentSelector';

export default function SuperOnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([
    'Computer Science',
    'Electrical & Electronic Engineering',
    'Medicine & Surgery',
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<any[]>([
    {
      id: 'plan-free',
      name: 'Free Trial',
      price: 0,
      note: 'School onboarding, basic dashboard metrics, up to 2 admin users.',
    }
  ]);
  const [selectedPlan, setSelectedPlan] = useState('plan-free');
  
  useEffect(() => {
    adminApiRequest('/admin/subscriptions')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data);
          // Auto-select the first plan
          if (!selectedPlan || selectedPlan === 'plan-free') {
            setSelectedPlan(data[0].id);
          }
        }
      })
      .catch((err) => console.warn('Failed to load plans:', err));
  }, []);

  const currentPlanObj = plans.find((p) => p.id === selectedPlan) || plans[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter an institution name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create School (with nested subscription if applicable)
      const school = await adminApiRequest('/admin/schools', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          acronym: acronym.trim() || name.substring(0, 5).toUpperCase(),
          contactEmail: contactEmail.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          status: 'active',
          subscriptions: {
            create: [
              {
                planName: currentPlanObj.name,
                price: typeof currentPlanObj.price === 'number' ? currentPlanObj.price : 0,
                status: 'active'
              }
            ]
          }
        }),
      });

      // 2. Batch Create Selected Departments if school was created
      if (school?.id && selectedDepartments.length > 0) {
        await adminApiRequest('/admin/departments/batch', {
          method: 'POST',
          body: JSON.stringify({
            schoolId: school.id,
            departments: selectedDepartments,
          }),
        }).catch((err) => console.warn('Department batch save notice:', err));
      }

      showToast(`Successfully onboarded ${name} with ${selectedDepartments.length} departments!`, 'success');
      router.push('/dashboard/super/schools');
    } catch (err: any) {
      showToast(err?.message || 'Failed to onboard school. Ensure backend is running.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#ebeefd] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,30,90,0.05)]">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Schools • Onboard New School</div>
        <h1 className="mt-3 font-display text-[34px] font-bold tracking-[-0.03em] text-brand-navy">Add New Institution</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
          Create an institutional profile, select departments, assign contact details, and pick a subscription tier.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.65fr]">
          <div className="space-y-5">
            <section className="rounded-[24px] border border-[#edf0fb] bg-white p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-navy">01</div>
              <h2 className="mt-2 text-lg font-bold text-brand-navy">General Information</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Federal University of Technology"
                  className="h-12 rounded-xl border border-[#edf0fb] bg-[#fafbff] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy text-text-primary placeholder:text-text-muted"
                />
                <input
                  value={acronym}
                  onChange={(e) => setAcronym(e.target.value)}
                  placeholder="Acronym e.g. FUTO"
                  className="h-12 rounded-xl border border-[#edf0fb] bg-[#fafbff] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy text-text-primary placeholder:text-text-muted"
                />
              </div>
            </section>

            {/* Department Multi-Select Component */}
            <section>
              <DepartmentSelector
                selectedDepartments={selectedDepartments}
                onChange={setSelectedDepartments}
              />
            </section>

            <section className="rounded-[24px] border border-[#edf0fb] bg-white p-5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-navy">03</div>
              <h2 className="mt-2 text-lg font-bold text-brand-navy">Contact & Location</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@institution.edu"
                  className="h-12 rounded-xl border border-[#edf0fb] bg-[#fafbff] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy text-text-primary placeholder:text-text-muted"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 000 0000"
                  className="h-12 rounded-xl border border-[#edf0fb] bg-[#fafbff] px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy text-text-primary placeholder:text-text-muted"
                />
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Campus address, City, State"
                className="mt-4 min-h-24 w-full rounded-xl border border-[#edf0fb] bg-[#fafbff] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy text-text-primary placeholder:text-text-muted"
              />
            </section>
          </div>

          <div className="space-y-4">
            <section className="rounded-[24px] bg-brand-navy p-5 text-white">
              <h2 className="text-lg font-bold">Subscription Tier</h2>
              <p className="mt-1 text-xs text-white/70">Institutional access plan & pricing</p>
              <div className="mt-4 space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer rounded-xl border px-3 py-3 transition-all ${
                      selectedPlan === plan.id
                        ? 'border-brand-gold bg-white text-brand-navy shadow-md'
                        : 'border-white/15 bg-white/8 text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{plan.name}</p>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${selectedPlan === plan.id ? 'bg-brand-gold text-brand-navy' : 'bg-white/10 text-white'}`}>
                        {typeof plan.price === 'number' ? `₦${plan.price.toLocaleString()} / year` : plan.price}
                      </span>
                    </div>
                    <p className={`mt-1 text-xs ${selectedPlan === plan.id ? 'text-text-secondary' : 'text-white/70'}`}>
                      {plan.note || (plan.features ? plan.features.join(', ') : 'Basic plan features')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 text-sm border-t border-white/15 pt-4">
                <div className="flex items-center justify-between text-white/75">
                  <span>Selected Departments</span>
                  <span className="font-bold text-brand-gold">{selectedDepartments.length}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-white">
                  <span>Selected Tier</span>
                  <span className="text-brand-gold">{currentPlanObj.name}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-gold text-sm font-bold text-brand-navy hover:bg-brand-gold-light transition-all disabled:opacity-50"
              >
                {submitting ? 'Creating Institution...' : 'Complete Onboarding'}
              </button>
            </section>
          </div>
        </div>
      </form>
    </div>
  );
}
