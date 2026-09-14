'use client';

import { useEffect, useState } from 'react';
import { Users, RefreshCw, ShieldCheck, Search, Power, Edit2, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

export default function SuperStudentsPage() {
  const { showToast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSchoolId, setFilterSchoolId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSchoolId, setEditSchoolId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let endpoint = '/admin/users?role=STUDENT';
      if (filterSchoolId) endpoint += `&schoolId=${filterSchoolId}`;
      if (searchQuery) endpoint += `&search=${encodeURIComponent(searchQuery)}`;

      const data = await adminApiRequest(endpoint);
      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (err) {
      console.warn('Backend students fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const data = await adminApiRequest('/schools/public');
      if (Array.isArray(data)) setSchools(data);
    } catch (err) {
      console.warn('Failed to fetch public schools:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filterSchoolId, searchQuery]);

  useEffect(() => {
    fetchSchools();
  }, []);

  // Confirmation Modal state for Class Rep Appointment
  const [confirmStudent, setConfirmStudent] = useState<any | null>(null);
  const [appointing, setAppointing] = useState(false);

  const confirmMakeClassRep = (student: any) => {
    setConfirmStudent(student);
  };

  const executeMakeClassRep = async () => {
    if (!confirmStudent) return;
    setAppointing(true);
    const studentName = confirmStudent.fullName || confirmStudent.name || confirmStudent.email || 'Student';
    try {
      await adminApiRequest('/admin/class-reps', {
        method: 'POST',
        body: JSON.stringify({ studentId: confirmStudent.id }),
      });
      showToast(`Successfully promoted ${studentName} to Class Rep!`, 'success');
      setConfirmStudent(null);
      fetchStudents();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign class rep', 'error');
    } finally {
      setAppointing(false);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const newStatus = student.status === 'ACTIVE' || student.status === 'active' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApiRequest(`/admin/users/${student.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Student ${student.fullName || student.email} status updated to ${newStatus}`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status', 'error');
    }
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setEditFullName(student.fullName || '');
    setEditEmail(student.email || '');
    setEditSchoolId(student.school?.id || '');
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setSubmitting(true);
    try {
      await adminApiRequest(`/admin/users/${editingStudent.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: editFullName,
          email: editEmail,
          schoolId: editSchoolId || null,
        }),
      });

      showToast(`Student ${editFullName} updated successfully`, 'success');
      setShowEditModal(false);
      fetchStudents();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Oversight & Directory"
        subtitle="Full administrative management of student records, campus filtering, status controls, and class rep promotions."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Filter & Search Controls */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between border border-gray-100">
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-surface px-3 py-2 sm:w-72">
          <Search className="h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or matric..."
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

      <Panel title="Student Registry" subtitle={`Showing ${students.length} registered students from live backend database.`}>
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  <th className="py-3 px-4">Student Profile</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Matric No</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Role & Rep Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isRep = student.role === 'CLASS_REP' || (student.classRepAssignments && student.classRepAssignments.length > 0);
                  const isActive = student.status === 'ACTIVE' || student.status === 'active';

                  return (
                    <tr key={student.id} className="border-b border-gray-100 text-sm hover:bg-surface">
                      <td className="py-3 px-4 font-semibold text-text-primary">{student.fullName}</td>
                      <td className="py-3 px-4 text-text-secondary">{student.email}</td>
                      <td className="py-3 px-4 text-text-primary font-mono text-xs">{student.matricNumber || 'N/A'}</td>
                      <td className="py-3 px-4 text-text-primary font-semibold">{student.school?.name || 'Global'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isRep ? (
                          <span className="rounded-full bg-brand-gold/20 px-3 py-1 text-[10px] font-bold text-brand-navy border border-brand-gold">
                            ⭐ Class Rep
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-text-secondary">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(student)}
                            title="Edit Student Profile"
                            className="rounded-lg p-1.5 border border-gray-200 hover:bg-surface text-brand-navy"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(student)}
                            title={isActive ? 'Deactivate Account' : 'Activate Account'}
                            className={`rounded-lg p-1.5 ${
                              isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>

                          {!isRep && (
                            <button
                              onClick={() => confirmMakeClassRep(student)}
                              className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Promote
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm font-bold text-text-primary">No Students Found</p>
            <p className="mt-1 text-xs text-text-secondary">No registered student records match the active filter or search query.</p>
          </div>
        )}
      </Panel>

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Edit Student Record</h3>
                <p className="text-xs text-text-secondary">Modify student profile information.</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-text-muted hover:bg-surface">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="mt-4 space-y-4">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">Institution / Campus</label>
                <select
                  value={editSchoolId}
                  onChange={(e) => setEditSchoolId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm outline-none focus:border-brand-navy bg-white"
                >
                  <option value="">No Campus (Global)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.acronym})
                    </option>
                  ))}
                </select>
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

      {/* Confirmation Modal */}
      {confirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Confirm Class Rep Appointment</h3>
                  <p className="text-xs text-text-secondary">Appoint Student Representative</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmStudent(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-text-primary leading-relaxed font-medium">
              Are you sure you want to make <strong className="text-brand-navy font-bold">{confirmStudent.fullName || confirmStudent.email}</strong> a Course Class Representative?
            </p>

            <div className="rounded-xl bg-surface p-3 border border-gray-100 text-xs space-y-1">
              <p className="text-text-secondary"><strong className="text-text-primary">Email:</strong> {confirmStudent.email}</p>
              {confirmStudent.matricNumber && <p className="text-text-secondary"><strong className="text-text-primary">Matric No:</strong> {confirmStudent.matricNumber}</p>}
              {confirmStudent.level && <p className="text-text-secondary"><strong className="text-text-primary">Level:</strong> {confirmStudent.level}L</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmStudent(null)}
                className="h-10 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-text-secondary hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeMakeClassRep}
                disabled={appointing}
                className="h-10 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-sm disabled:opacity-50"
              >
                {appointing ? 'Appointing...' : 'Yes, Appoint Class Rep'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
