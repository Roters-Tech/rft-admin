'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Star, Users, RefreshCw, Plus, Trash2, X, Search } from 'lucide-react';
import { AppButton } from '@/components/ui/AppButton';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

export function ClassRepAssignmentBoard() {
  const { showToast } = useToast();
  const [reps, setReps] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReps = async () => {
    setLoading(true);
    try {
      const [repsData, studentsData, coursesData] = await Promise.all([
        adminApiRequest('/admin/class-reps').catch(() => []),
        adminApiRequest('/admin/users?role=STUDENT').catch(() => []),
        adminApiRequest('/courses').catch(() => []),
      ]);

      if (Array.isArray(repsData)) setReps(repsData);
      if (Array.isArray(studentsData)) setStudents(studentsData);
      if (Array.isArray(coursesData)) setCourses(coursesData);
    } catch (err) {
      console.warn('Failed to query class reps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReps();
  }, []);

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await adminApiRequest('/admin/class-reps', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudentId,
          courseId: selectedCourseId || undefined,
        }),
      });

      showToast('Class Rep assigned successfully! Notification dispatched to student.', 'success');
      setShowAssignModal(false);
      setSelectedStudentId('');
      setSelectedCourseId('');
      fetchReps();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign class rep', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeRep = async (id: string) => {
    try {
      await adminApiRequest(`/admin/class-reps/${id}`, {
        method: 'DELETE',
      });
      showToast('Class Rep status revoked.', 'success');
      fetchReps();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke assignment', 'error');
    }
  };

  return (
    <Panel
      title="Class Representative Directory"
      subtitle="Appointed student leaders and course communication reps across departments."
      action={
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReps}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-card"
          >
            <Plus className="h-4 w-4" />
            + Appoint Class Rep
          </button>
        </div>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-xs font-medium text-slate-400">Loading directory...</div>
      ) : reps.length > 0 ? (
        <div className="space-y-3">
          {reps.map((rep) => (
            <div key={rep.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{rep.student?.fullName || rep.student?.email || 'Student'}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Course: <span className="font-semibold text-slate-700 dark:text-slate-300">{rep.course?.code ? `${rep.course.code} - ${rep.course.name}` : 'General Representative'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 font-bold text-amber-800 dark:text-amber-300 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ⭐ Class Rep
                  </span>
                  <button
                    onClick={() => handleRevokeRep(rep.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Users className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">No Class Representatives Appointed Yet</p>
          <p className="mt-1 text-xs text-slate-500">Appoint a student as Class Rep for a course to grant them chat and moderation permissions.</p>
        </div>
      )}

      {/* Appoint Class Rep Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                Appoint Class Representative
              </h3>
              <button onClick={() => setShowAssignModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.email}) {s.matricNumber ? `· ${s.matricNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign to Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:ring-2 focus:ring-brand-navy focus:outline-none"
                >
                  <option value="">-- All Department Courses --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
                >
                  {submitting ? 'Assigning...' : 'Appoint Class Rep'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Panel>
  );
}
