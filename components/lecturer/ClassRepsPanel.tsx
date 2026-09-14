'use client';

import { useEffect, useState } from 'react';
import { MessageCircleMore, Users, ShieldCheck, RefreshCw, UserCheck, X, BookOpen } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';
import Link from 'next/link';

export function ClassRepsPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirmation Modal state
  const [confirmStudent, setConfirmStudent] = useState<any | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [appointing, setAppointing] = useState(false);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      let endpoint = '/admin/users?role=STUDENT';
      if (user?.departmentId) {
        endpoint += `&departmentId=${user.departmentId}`;
      } else if (user?.schoolId) {
        endpoint += `&schoolId=${user.schoolId}`;
      }
      const coursesEndpoint = user?.id ? `/courses?lecturerId=${user.id}` : '/courses';

      const [studentsData, coursesData] = await Promise.all([
        adminApiRequest(endpoint).catch(() => []),
        adminApiRequest(coursesEndpoint).catch(() => []),
      ]);

      if (Array.isArray(studentsData)) setStudents(studentsData);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        if (coursesData.length > 0) setSelectedCourseId(coursesData[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch department students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [user?.departmentId, user?.schoolId, user?.id]);

  const confirmMakeClassRep = (student: any) => {
    setConfirmStudent(student);
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  };

  const executeMakeClassRep = async () => {
    if (!confirmStudent) return;
    setAppointing(true);
    const studentName = confirmStudent.fullName || confirmStudent.name || confirmStudent.email || 'Student';
    try {
      await adminApiRequest('/admin/class-reps', {
        method: 'POST',
        body: JSON.stringify({
          studentId: confirmStudent.id,
          courseId: selectedCourseId || (courses.length > 0 ? courses[0].id : undefined),
        }),
      });
      showToast(`Successfully appointed ${studentName} as Class Representative!`, 'success');
      setConfirmStudent(null);
      fetchDepartmentData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to appoint Class Rep', 'error');
    } finally {
      setAppointing(false);
    }
  };

  const classReps = students.filter((s) => s.role === 'CLASS_REP' || (s.classRepAssignments && s.classRepAssignments.length > 0));

  return (
    <div className="rounded-xl bg-white p-5 shadow-card border border-gray-100 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Department Students & Class Reps</h3>
          <p className="text-xs text-text-secondary">
            {user?.department?.name ? `Active students in ${user.department.name}` : 'Appoint and manage your department student representatives'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/lecturer/class-reps"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
          >
            Manage All →
          </Link>
          <button
            onClick={fetchDepartmentData}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-text-secondary hover:bg-surface"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {classReps.length > 0 && (
        <div className="rounded-xl bg-brand-gold-light p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-brand-navy" />
            <span className="text-xs font-bold text-brand-navy">
              Appointed Reps ({classReps.length}): {classReps.map((r) => typeof r.fullName === 'string' ? r.fullName : (r.email || 'Student')).join(', ')}
            </span>
          </div>
        </div>
      )}

      {students.length > 0 ? (
        <div className="max-h-64 overflow-y-auto space-y-2">
          {students.map((st) => {
            const isRep = st.role === 'CLASS_REP' || (st.classRepAssignments && st.classRepAssignments.length > 0);
            const stName = typeof st.fullName === 'string' && st.fullName ? st.fullName : (st.email || 'Student');
            return (
              <div
                key={st.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-surface p-3 border border-gray-100 hover:border-gray-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${isRep ? 'bg-brand-gold text-brand-navy' : 'bg-brand-navy'}`}>
                    {stName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      {stName}
                      {isRep && (
                        <span className="rounded-full bg-brand-gold/20 px-2 py-0.5 text-[9px] font-extrabold text-brand-navy border border-brand-gold">
                          ⭐ Class Rep
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-text-secondary">{st.email} • {st.matricNumber || 'Matric N/A'}</p>
                  </div>
                </div>

                {!isRep && (
                  <button
                    onClick={() => confirmMakeClassRep(st)}
                    className="inline-flex items-center gap-1 self-start sm:self-auto rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Make Class Rep
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Users className="mx-auto h-7 w-7 text-text-muted" />
          <p className="mt-2 text-xs font-bold text-text-primary">No Department Students Enrolled Yet</p>
          <p className="mt-1 text-[11px] text-text-secondary">Students enrolled in your department will appear here to be appointed as Class Reps.</p>
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
                  <p className="text-xs text-text-secondary">Select course & confirm appointment</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmStudent(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-text-primary leading-relaxed font-medium">
              Are you sure you want to make <strong className="text-brand-navy font-bold">{confirmStudent.fullName || confirmStudent.email}</strong> a Course Class Representative?
            </p>

            <div className="rounded-xl bg-surface p-3 border border-gray-100 text-xs space-y-2">
              <p className="text-text-secondary"><strong className="text-text-primary">Email:</strong> {confirmStudent.email}</p>
              {confirmStudent.matricNumber && <p className="text-text-secondary"><strong className="text-text-primary">Matric No:</strong> {confirmStudent.matricNumber}</p>}
              {confirmStudent.level && <p className="text-text-secondary"><strong className="text-text-primary">Level:</strong> {confirmStudent.level}L</p>}

              {/* Course Selection Dropdown for Lecturers with Multiple Courses */}
              {courses.length > 0 && (
                <div className="pt-2 border-t border-gray-200/60">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-navy mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> Select Target Course for Rep Appointment:
                  </label>
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-bold text-brand-navy outline-none focus:border-brand-navy"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code}: {c.name || c.title} ({c.level || '300'}L)
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
