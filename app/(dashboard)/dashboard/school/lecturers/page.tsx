'use client';

import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, RefreshCw, X, CheckCircle2, Search, Mail, ShieldAlert, KeyRound, Eye, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { adminApiRequest } from '@/lib/apiClient';

interface Department {
  id: string;
  name: string;
}

interface Lecturer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  status: string;
  department?: Department;
  school?: { id: string; name: string; acronym?: string };
  taughtCourses?: { id: string; code: string; name: string }[];
  createdAt: string;
}

export default function SchoolLecturersPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Modals state
  const [viewingLecturer, setViewingLecturer] = useState<Lecturer | null>(null);
  const [deleteConfirmLecturer, setDeleteConfirmLecturer] = useState<Lecturer | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Onboarding Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [onboardResult, setOnboardResult] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [lecs, facs] = await Promise.all([
        adminApiRequest('/admin/users?role=LECTURER'),
        adminApiRequest('/admin/faculties').catch(() => []),
      ]);

      if (Array.isArray(lecs)) {
        setLecturers(lecs);
      }

      if (Array.isArray(facs)) {
        const allDepts: Department[] = [];
        facs.forEach((f: any) => {
          if (Array.isArray(f.departments)) {
            allDepts.push(...f.departments);
          }
        });
        setDepartments(allDepts);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch lecturers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOnboardLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    setSubmitting(true);
    setError('');
    setOnboardResult(null);

    try {
      const res = await adminApiRequest('/admin/users/lecturers', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phone.trim() || undefined,
          departmentId: selectedDeptId || undefined,
        }),
      });

      setOnboardResult(res);
      setSuccess(`Lecturer onboarded successfully! Temp Password: ${res.tempPassword} (also sent to ${email.trim()})`);
      setFullName('');
      setEmail('');
      setPhone('');
      setSelectedDeptId('');
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard lecturer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApiRequest(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setSuccess(`Lecturer status updated to ${newStatus}.`);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to update lecturer status');
    }
  };

  const handleDeleteLecturer = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await adminApiRequest(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      setSuccess(`Lecturer "${name}" removed successfully.`);
      setDeleteConfirmLecturer(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete lecturer');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredLecturers = lecturers.filter(
    (l) =>
      l.fullName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.department?.name && l.department.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lecturer Directory & Management"
        subtitle="Onboard academic staff, assign departments, and manage access."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setOnboardResult(null);
                setIsModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy/90 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Onboard Lecturer
            </button>
          </div>
        }
      />

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-sm text-emerald-700 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {success}
          </span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by lecturer name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-primary"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total Staff: <strong className="text-brand-navy">{filteredLecturers.length}</strong>
        </span>
      </div>

      {/* Lecturers Table */}
      {loading ? (
        <div className="flex py-12 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading Lecturers...
        </div>
      ) : filteredLecturers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Lecturers Found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Onboard new academic staff members to assign courses and enable content uploads.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-navy/90"
          >
            <Plus className="h-4 w-4" />
            Onboard First Lecturer
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-slate-100/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Lecturer Name</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredLecturers.map((lec) => (
                <tr key={lec.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold">
                        {lec.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{lec.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {lec.department?.name || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-800">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {lec.email}
                      </div>
                      {lec.phoneNumber && <div className="text-gray-400">{lec.phoneNumber}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        lec.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {lec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingLecturer(lec)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 transition"
                        title="View Full Lecturer Details"
                      >
                        <Eye className="h-3.5 w-3.5 text-brand-navy dark:text-sky-400" />
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(lec.id, lec.status)}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-bold text-xs transition ${
                          lec.status === 'ACTIVE'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                        }`}
                        title={lec.status === 'ACTIVE' ? 'Suspend Lecturer Access' : 'Activate Lecturer Access'}
                      >
                        {lec.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmLecturer(lec)}
                        className="inline-flex items-center gap-1 rounded-xl p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 transition"
                        title="Delete Lecturer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Lecturer Details Modal */}
      {viewingLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl border border-slate-300 dark:border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-brand-navy" />
                Lecturer Profile Details
              </h3>
              <button onClick={() => setViewingLecturer(null)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">Full Name</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">{viewingLecturer.fullName}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">Email</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200 break-all">{viewingLecturer.email}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">Phone</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{viewingLecturer.phoneNumber || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">Department</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{viewingLecturer.department?.name || 'Unassigned'}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold ${viewingLecturer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                    {viewingLecturer.status}
                  </span>
                </div>
              </div>

              {viewingLecturer.taughtCourses && viewingLecturer.taughtCourses.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">Taught Courses</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingLecturer.taughtCourses.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-1 rounded-md bg-brand-navy/10 px-2 py-0.5 text-[11px] font-extrabold text-brand-navy dark:text-sky-300">
                        <BookOpen className="h-3 w-3" /> {c.code}: {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLecturer(null)}
                className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-extrabold text-white hover:bg-brand-navy-deep"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Yes / No) */}
      {deleteConfirmLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Lecturer Removal</h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white underline">{deleteConfirmLecturer.fullName}</span> ({deleteConfirmLecturer.email})? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmLecturer(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                No, Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmLecturer.id}
                onClick={() => handleDeleteLecturer(deleteConfirmLecturer.id, deleteConfirmLecturer.fullName)}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === deleteConfirmLecturer.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-navy">Onboard Academic Lecturer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {onboardResult ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    Lecturer Successfully Created!
                  </div>
                  <p>Credentials emailed to <strong>{onboardResult.user?.email || email}</strong>.</p>
                  {onboardResult.tempPassword && (
                    <div className="mt-3 rounded-xl bg-white p-3 border border-emerald-200 font-mono text-xs flex items-center justify-between">
                      <span>Temp Password: <strong>{onboardResult.tempPassword}</strong></span>
                      <KeyRound className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setOnboardResult(null);
                    setIsModalOpen(false);
                  }}
                  className="w-full rounded-xl bg-brand-navy py-2.5 text-xs font-semibold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleOnboardLecturer} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Lecturer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Adebayo Oladimeji"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="adebayo@covenant.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+234 800 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                  >
                    {submitting ? 'Onboarding...' : 'Onboard Lecturer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
