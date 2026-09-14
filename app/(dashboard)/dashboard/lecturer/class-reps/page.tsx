'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, ShieldCheck, RefreshCw, Users, UserCheck, BookOpen, Star, ShieldOff, Building2, Layers, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';

const LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L'];

export default function LecturerClassRepsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [classRepAssignments, setClassRepAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('All Levels');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reps' | 'students'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/admin/users?role=STUDENT';
      if (user?.schoolId) {
        endpoint += `&schoolId=${user.schoolId}`;
      }

      const coursesEndpoint = user?.id ? `/courses?lecturerId=${user.id}` : '/courses';

      const [studentsData, coursesData, deptsData, repsData] = await Promise.all([
        adminApiRequest(endpoint).catch(() => []),
        adminApiRequest(coursesEndpoint).catch(() => []),
        adminApiRequest('/departments/public').catch(() => []),
        adminApiRequest('/admin/class-reps').catch(() => []),
      ]);

      if (Array.isArray(studentsData)) setStudents(studentsData);
      if (Array.isArray(coursesData)) setCourses(coursesData);
      if (Array.isArray(deptsData)) setDepartments(deptsData);
      if (Array.isArray(repsData)) setClassRepAssignments(repsData);
    } catch (err) {
      console.warn('Failed to fetch class reps page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.departmentId, user?.schoolId, user?.id]);

  // Confirmation Modal state
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
        body: JSON.stringify({
          studentId: confirmStudent.id,
          courseId: selectedCourseFilter || (courses.length > 0 ? courses[0].id : undefined),
        }),
      });
      showToast(`Successfully promoted ${studentName} to Class Representative!`, 'success');
      setConfirmStudent(null);
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to appoint Class Rep', 'error');
    } finally {
      setAppointing(false);
    }
  };

  const handleRevokeClassRep = async (studentId: string, studentName: string) => {
    try {
      const assignment = classRepAssignments.find((a) => a.studentId === studentId || a.student?.id === studentId);
      if (assignment?.id) {
        await adminApiRequest(`/admin/class-reps/${assignment.id}`, {
          method: 'DELETE',
        });
      }
      showToast(`Revoked Class Rep status for ${studentName}`, 'success');
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke Class Rep assignment', 'error');
    }
  };

  // Filtered Students Roster
  const filteredStudents = students.filter((st) => {
    const isRep =
      st.role === 'CLASS_REP' ||
      (st.classRepAssignments && st.classRepAssignments.length > 0) ||
      classRepAssignments.some((a) => a.studentId === st.id || a.student?.id === st.id);

    // Status filter
    if (statusFilter === 'reps' && !isRep) return false;
    if (statusFilter === 'students' && isRep) return false;

    // Level filter
    if (selectedLevelFilter !== 'All Levels') {
      const numLevel = selectedLevelFilter.replace('L', '');
      const studentLevel = (st.level || '300').toString().replace('L', '');
      if (studentLevel !== numLevel) return false;
    }

    // Department filter
    if (selectedDeptFilter !== 'all') {
      const studentDeptName = (st.department?.name || st.department || '').toLowerCase();
      if (!studentDeptName.includes(selectedDeptFilter.toLowerCase())) return false;
    }

    // Search query matching
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (st.fullName || '').toLowerCase().includes(q);
      const matchEmail = (st.email || '').toLowerCase().includes(q);
      const matchMatric = (st.matricNumber || st.matricNo || '').toLowerCase().includes(q);
      const matchDept = (st.department?.name || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMatric && !matchDept) return false;
    }

    return true;
  });

  const repCount = students.filter(
    (s) =>
      s.role === 'CLASS_REP' ||
      (s.classRepAssignments && s.classRepAssignments.length > 0) ||
      classRepAssignments.some((a) => a.studentId === s.id || a.student?.id === s.id)
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Department Students & Class Reps"
        subtitle="Select a department and level to view enrolled students and manage Class Representative appointments."
        actions={
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-xs font-semibold text-text-secondary hover:bg-surface transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        }
      />

      {/* Metrics Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white font-bold">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Enrolled Students</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{students.length}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold text-brand-navy font-bold">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Class Representatives</p>
            <p className="text-2xl font-bold text-brand-navy mt-1">{repCount}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-gray-100 shadow-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500 text-white font-bold">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Taught Courses</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{courses.length}</p>
          </div>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <Panel>
        <div className="space-y-4">
          {/* Level Selection Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-bold text-text-secondary flex items-center gap-1 mr-2">
              <Layers className="h-3.5 w-3.5 text-brand-navy" /> Level:
            </span>
            {LEVELS.map((lvl) => {
              const isActive = selectedLevelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevelFilter(lvl)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'bg-surface text-text-secondary hover:bg-gray-100 hover:text-text-primary border border-gray-200'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2 border-t border-gray-100">
            {/* Search Input */}
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-surface px-3 py-2.5">
              <Search className="h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name, email, or matric number..."
                className="w-full bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Department Dropdown */}
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-surface px-3 py-2">
                <Building2 className="h-3.5 w-3.5 text-text-muted" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-text-primary outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((d: any) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                  <option value="law">Law</option>
                  <option value="computer science">Computer Science</option>
                  <option value="engineering">Engineering</option>
                </select>
              </div>

              {/* Status Segment Pills */}
              <div className="flex rounded-xl border border-gray-200 p-1 bg-surface">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    statusFilter === 'all' ? 'bg-brand-navy text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('reps')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    statusFilter === 'reps' ? 'bg-brand-gold text-brand-navy font-bold' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Reps ({repCount})
                </button>
                <button
                  onClick={() => setStatusFilter('students')}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    statusFilter === 'students' ? 'bg-brand-navy text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Students ({students.length - repCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">Matric No</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => {
                  const isRep =
                    st.role === 'CLASS_REP' ||
                    (st.classRepAssignments && st.classRepAssignments.length > 0) ||
                    classRepAssignments.some((a) => a.studentId === st.id || a.student?.id === st.id);

                  return (
                    <tr key={st.id} className="border-b border-gray-100 text-sm hover:bg-surface">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${
                              isRep ? 'bg-brand-gold text-brand-navy' : 'bg-brand-navy'
                            }`}
                          >
                            {(st.fullName || st.email || 'ST').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-brand-navy">{st.fullName}</p>
                            <p className="text-xs text-text-secondary">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-text-primary">
                        {st.matricNumber || st.matricNo || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-brand-navy">
                        {st.level || '300'}L
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-text-secondary">
                        {st.department?.name || user?.department?.name || 'Department Faculty'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isRep ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 px-3 py-1 text-[10px] font-bold text-brand-navy border border-brand-gold">
                            ⭐ Class Rep
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-text-secondary">
                            Student
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {!isRep ? (
                          <button
                            onClick={() => confirmMakeClassRep(st)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Appoint Class Rep
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRevokeClassRep(st.id, st.fullName)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-all"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                            Revoke Rep
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Users className="mx-auto h-8 w-8 text-text-muted" />
                    <p className="mt-2 text-sm font-bold text-text-primary">No Enrolled Students Found</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {search || selectedLevelFilter !== 'All Levels' || selectedDeptFilter !== 'all'
                        ? 'Try clearing your level or department filter criteria.'
                        : 'Enrolled students will automatically appear here once registered.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

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
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
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
