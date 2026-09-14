'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, UserCog, RefreshCw, Plus, X, Mail, CheckCircle2, Search, Power, Edit2, BookOpen } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

export default function SuperLecturersPage() {
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Filter states
  const [filterSchoolId, setFilterSchoolId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states (Create)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [successInfo, setSuccessInfo] = useState<{ email: string; tempPassword: string } | null>(null);

  // Form states (Edit)
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSchoolId, setEditSchoolId] = useState('');
  const [editCourseIds, setEditCourseIds] = useState<string[]>([]);

  const { showToast } = useToast();

  const fetchLecturers = async () => {
    setLoading(true);
    try {
      let endpoint = '/admin/users?role=LECTURER';
      if (filterSchoolId) endpoint += `&schoolId=${filterSchoolId}`;
      if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`;

      const data = await adminApiRequest(endpoint);
      if (Array.isArray(data)) {
        setLecturers(data);
      }
    } catch (err) {
      console.warn('Backend lecturers query failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolsAndCourses = async () => {
    try {
      const [schoolsData, coursesData] = await Promise.all([
        adminApiRequest('/schools/public').catch(() => []),
        adminApiRequest('/courses').catch(() => []),
      ]);
      if (Array.isArray(schoolsData)) setSchools(schoolsData);
      if (Array.isArray(coursesData)) setCourses(coursesData);
    } catch (err) {
      console.warn('Failed to fetch reference data:', err);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, [filterSchoolId, searchQuery]);

  useEffect(() => {
    fetchSchoolsAndCourses();
  }, []);

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      showToast('Please provide full name and email address', 'error');
      return;
    }

    setSubmitting(true);
    setSuccessInfo(null);

    try {
      const res = await adminApiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          schoolId: schoolId || undefined,
          courseIds: selectedCourseIds,
        }),
      });

      showToast(`Lecturer ${fullName} onboarded! Credentials sent to ${email}`, 'success');
      setSuccessInfo({ email, tempPassword: res.tempPassword });
      setFullName('');
      setEmail('');
      setSchoolId('');
      setSelectedCourseIds([]);
      fetchLecturers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to onboard lecturer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (lecturer: any) => {
    const newStatus = lecturer.status === 'ACTIVE' || lecturer.status === 'active' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApiRequest(`/admin/users/${lecturer.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Lecturer ${lecturer.fullName || lecturer.email} status updated to ${newStatus}`, 'success');
      fetchLecturers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    }
  };

  const openEditModal = (lecturer: any) => {
    setEditingLecturer(lecturer);
    setEditFullName(lecturer.fullName || '');
    setEditEmail(lecturer.email || '');
    setEditSchoolId(lecturer.school?.id || '');
    setEditCourseIds(lecturer.taughtCourses?.map((c: any) => c.id) || []);
    setShowEditModal(true);
  };

  const handleUpdateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLecturer) return;

    setSubmitting(true);
    try {
      await adminApiRequest(`/admin/users/${editingLecturer.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: editFullName,
          email: editEmail,
          schoolId: editSchoolId || null,
          courseIds: editCourseIds,
        }),
      });

      showToast(`Lecturer ${editFullName} profile updated successfully`, 'success');
      setShowEditModal(false);
      fetchLecturers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update lecturer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCourseSelection = (courseId: string, isEdit = false) => {
    if (isEdit) {
      setEditCourseIds((prev) =>
        prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
      );
    } else {
      setSelectedCourseIds((prev) =>
        prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
      );
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Lecturer Access & Course Assignment"
        subtitle="Manage verified academic staff, assign teaching courses, and configure account access."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLecturers}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <AppButton onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Onboard Lecturer
            </AppButton>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between border border-gray-100">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-surface px-3 py-2 sm:w-72">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by lecturer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-text-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Filter Institution:</span>
          <select
            value={filterSchoolId}
            onChange={(e) => setFilterSchoolId(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-text-primary outline-none"
          >
            <option value="">All Schools ({schools.length})</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.acronym})
              </option>
            ))}
          </select>
        </div>
      </div>

      {lecturers.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {lecturers.map((lecturer) => {
            const isActive = lecturer.status === 'ACTIVE' || lecturer.status === 'active';
            return (
              <Panel key={lecturer.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-text-primary">{lecturer.fullName || lecturer.name}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      {lecturer.school?.name ? `${lecturer.school.name} (${lecturer.school.acronym || 'Campus'})` : 'Global Faculty'}
                    </p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-status-optimal" />
                </div>

                <div className="mt-4 rounded-2xl bg-surface p-4">
                  <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Contact Details</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{lecturer.email}</p>
                </div>

                {/* Assigned Courses Badge list */}
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Assigned Teaching Courses</p>
                  {lecturer.taughtCourses && lecturer.taughtCourses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {lecturer.taughtCourses.map((c: any) => (
                        <span key={c.id} className="inline-flex items-center gap-1 rounded-lg bg-brand-navy/10 px-2.5 py-1 text-xs font-semibold text-brand-navy">
                          <BookOpen className="h-3 w-3" />
                          {c.code}: {c.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted italic">No courses assigned yet.</p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    onClick={() => openEditModal(lecturer)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-brand-navy" />
                    Edit Profile & Courses
                  </button>

                  <button
                    onClick={() => handleToggleStatus(lecturer)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="h-3.5 w-3.5" />
                    {isActive ? 'Deactivate Lecturer' : 'Activate Lecturer'}
                  </button>
                </div>
              </Panel>
            );
          })}
        </div>
      ) : (
        <Panel title="Lecturer Access Registry" subtitle="Verified academic staff and department leads.">
          <div className="py-8 text-center">
            <UserCog className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm font-bold text-text-primary">No Lecturers Found</p>
            <p className="mt-1 text-xs text-text-secondary">Click "Onboard Lecturer" above to invite academic staff and assign courses.</p>
          </div>
        </Panel>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Onboard New Lecturer</h3>
                <p className="text-xs text-text-secondary">Credentials will be emailed via Resend automatically.</p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSuccessInfo(null);
                }}
                className="rounded-lg p-1 text-text-muted hover:bg-surface hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {successInfo ? (
              <div className="my-6 space-y-4 rounded-xl bg-emerald-50 p-4 text-emerald-900 border border-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Credentials Sent via Email!
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  An email has been delivered to <strong>{successInfo.email}</strong> containing their temporary password.
                </p>
                <div className="rounded-lg bg-white p-3 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Temporary Password</p>
                  <p className="text-sm font-mono font-bold text-brand-navy mt-0.5">{successInfo.tempPassword}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Onboard Another Lecturer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateLecturer} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Stella Obua"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lecturer@university.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                    Institution / School (Optional)
                  </label>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy bg-white"
                  >
                    <option value="">Select Institution</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.acronym})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Selection Checkboxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                    Assign Teaching Courses
                  </label>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 space-y-2 bg-surface">
                    {courses.length > 0 ? (
                      courses.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCourseIds.includes(c.id)}
                            onChange={() => toggleCourseSelection(c.id, false)}
                            className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                          />
                          <span>{c.code}: {c.name || c.title}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted">No platform courses created yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        Create & Send Credentials
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingLecturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Edit Lecturer Profile</h3>
                <p className="text-xs text-text-secondary">Update personal info and assigned courses.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-text-muted hover:bg-surface">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLecturer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Institution</label>
                <select
                  value={editSchoolId}
                  onChange={(e) => setEditSchoolId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy bg-white"
                >
                  <option value="">No Institution (Global)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.acronym})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
                  Assigned Teaching Courses
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 p-3 space-y-2 bg-surface">
                  {courses.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCourseIds.includes(c.id)}
                        onChange={() => toggleCourseSelection(c.id, true)}
                        className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                      />
                      <span>{c.code}: {c.name || c.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
