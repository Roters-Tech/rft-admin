'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, Phone, MapPin, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiClient';

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    schoolName: '',
    acronym: '',
    contactEmail: '',
    phone: '',
    address: '',
    adminName: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { schoolName, acronym, contactEmail, phone, address, adminName, password } = formData;
    if (!schoolName || !acronym || !contactEmail || !phone || !address || !adminName || !password) {
      setError('All fields are required. Please fill in every field before submitting.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register-school`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to register university');
      }

      // Store auth session
      if (data.accessToken) {
        localStorage.setItem('rft_admin_token', data.accessToken);
        localStorage.setItem('rft_user', JSON.stringify(data.user));
        document.cookie = `rft_token=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `rft_user=${encodeURIComponent(JSON.stringify(data.user))}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `rft_role=${data.user.role}; path=/; max-age=86400; SameSite=Lax`;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard/school');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary mb-4 shadow-sm">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-brand-navy">
          Register Your Institution
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Onboard your University/College onto the RFT Academic Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-700 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-sm text-emerald-700 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              University registered successfully! Redirecting to your dashboard...
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Institution Full Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="schoolName"
                  required
                  placeholder="e.g. Covenant University"
                  value={formData.schoolName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Acronym / Code *
                </label>
                <input
                  type="text"
                  name="acronym"
                  required
                  placeholder="e.g. CU"
                  value={formData.acronym}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Official Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    required
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Campus Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. KM 10 Idiroko Road, Ota, Ogun State"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>
            </div>

            <hr className="my-6 border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Admin Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="adminName"
                    required
                    placeholder="Prof. David Oye"
                    value={formData.adminName}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                  Admin Contact Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    placeholder="admin@covenant.edu.ng"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90 focus:outline-none transition disabled:opacity-50"
            >
              {loading ? (
                <span>Processing Registration...</span>
              ) : (
                <>
                  <span>Complete University Registration</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-brand-primary hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
