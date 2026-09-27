'use client';

import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, RefreshCw, X, CheckCircle2, Search, Mail, ShieldAlert, KeyRound, Eye, Trash2, BookOpen, AlertCircle, Award, Trophy, FileText, Phone, ExternalLink, GraduationCap } from 'lucide-react';
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
  title?: string;
  bio?: string;
  status: string;
  department?: Department;
  school?: { id: string; name: string; acronym?: string };
  taughtCourses?: { id: string; code: string; name: string }[];
  pastQuestionsCount?: number;
  materialsCount?: number;
  certifications?: { id: string; name: string; issuer: string; year?: string; credentialUrl?: string }[];
  achievements?: { id: string; title: string; description?: string; year?: string; fileUrl?: string }[];
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-300 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-brand-navy/10 dark:bg-sky-900/30 border border-brand-navy/20 dark:border-sky-500/20 flex items-center justify-center text-brand-navy dark:text-sky-400">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewingLecturer.title ? `${viewingLecturer.title} ` : ''}{viewingLecturer.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {viewingLecturer.department?.name || 'Department Unassigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${viewingLecturer.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                  {viewingLecturer.status}
                </span>
                <button
                  type="button"
                  onClick={() => setViewingLecturer(null)}
                  className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              {/* Contribution Metric Badges */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/40 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] mb-1">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Past Questions</span>
                  </div>
                  <span className="text-xl font-black text-indigo-900 dark:text-indigo-200">
                    {viewingLecturer.pastQuestionsCount ?? 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] mb-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Course Materials</span>
                  </div>
                  <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                    {viewingLecturer.materialsCount ?? 0}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/40 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-sky-600 dark:text-sky-400 font-extrabold text-[11px] mb-1">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Assigned Courses</span>
                  </div>
                  <span className="text-xl font-black text-sky-900 dark:text-sky-200">
                    {viewingLecturer.taughtCourses?.length ?? 0}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </span>
                  <a href={`mailto:${viewingLecturer.email}`} className="font-bold text-slate-900 dark:text-slate-100 hover:text-brand-navy dark:hover:text-sky-400 break-all transition">
                    {viewingLecturer.email}
                  </a>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {viewingLecturer.phoneNumber || 'Not provided'}
                  </span>
                </div>
              </div>

              {/* Bio & Academic Statement */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Academic Bio & Description
                </span>
                {viewingLecturer.bio ? (
                  <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {viewingLecturer.bio}
                  </p>
                ) : (
                  <p className="text-xs italic text-slate-400">
                    No academic bio or summary added yet.
                  </p>
                )}
              </div>

              {/* Taught Courses */}
              {viewingLecturer.taughtCourses && viewingLecturer.taughtCourses.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" /> Assigned Teaching Courses
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {viewingLecturer.taughtCourses.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-brand-navy dark:bg-sky-400" />
                        <span className="font-extrabold text-brand-navy dark:text-sky-300">{c.code}:</span> {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Certifications */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-brand-navy dark:text-sky-400" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Professional Certifications ({viewingLecturer.certifications?.length || 0})
                  </h4>
                </div>
                {viewingLecturer.certifications && viewingLecturer.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewingLecturer.certifications.map((cert) => (
                      <div key={cert.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">{cert.name}</span>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{cert.issuer} {cert.year ? `• ${cert.year}` : ''}</span>
                        </div>
                        {cert.credentialUrl && (
                          <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-navy dark:text-sky-400 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> View Credential
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                    No certifications listed yet.
                  </div>
                )}
              </div>

              {/* Academic Achievements & Honors */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Achievements & Honors ({viewingLecturer.achievements?.length || 0})
                  </h4>
                </div>
                {viewingLecturer.achievements && viewingLecturer.achievements.length > 0 ? (
                  <div className="space-y-2.5">
                    {viewingLecturer.achievements.map((ach) => (
                      <div key={ach.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{ach.title}</span>
                          {ach.year && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                              {ach.year}
                            </span>
                          )}
                        </div>
                        {ach.description && (
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
                            {ach.description}
                          </p>
                        )}
                        {ach.fileUrl && (
                          <a
                            href={ach.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-navy dark:text-sky-400 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> View Verification / Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400">
                    No achievements or honors listed yet.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingLecturer(null)}
                className="rounded-xl bg-brand-navy px-6 py-2.5 text-xs font-extrabold text-white hover:bg-brand-navy-deep shadow-md transition"
              >
                Close Profile
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
