'use client';

import { useEffect, useState, useMemo } from 'react';
import { BookOpen, RefreshCw, Plus, Check, X, Layers, Building } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';

export function AssignedCoursesTable({ onCoursesUpdated }: { onCoursesUpdated?: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'assign'>('create');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Faculties & Departments state
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  // New Course Form Fields
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('300');
  const [newUnits, setNewUnits] = useState('3');
  const [newSemester, setNewSemester] = useState('1');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const endpoint = user?.id ? `/courses?lecturerId=${user.id}` : '/courses';
      const data = await adminApiRequest(endpoint);
      if (Array.isArray(data)) {
        setCourses(data);
        setSelectedCourseIds(data.map((c: any) => c.id));
      }
    } catch (err) {
      console.warn('Failed to fetch courses for lecturer:', err);
    } finally {
      setLoading(false);
    }
  };

  const [loadingAvailable, setLoadingAvailable] = useState(false);

  const facultyOptions = useMemo(() => {
    const opts: SearchableOption[] = [{ value: '', label: 'All Faculties / General', sublabel: `${departments.length} Total Departments` }];
    faculties.forEach((f: any) => {
      const depCount = departments.filter((d: any) => d.facultyId === f.id || d.faculty?.id === f.id).length || f.departments?.length || 0;
      opts.push({
        value: f.id,
        label: f.name,
        category: 'Faculty',
        sublabel: `${depCount} Departments`,
      });
    });
    return opts;
  }, [faculties, departments]);

  const departmentOptions = useMemo(() => {
    let list = departments;
    if (selectedFacultyId) {
      const filtered = departments.filter((d: any) => d.facultyId === selectedFacultyId || d.faculty?.id === selectedFacultyId);
      if (filtered.length > 0) {
        list = filtered;
      }
    }

    return list.map((d: any) => {
      const facName = d.faculty?.name || faculties.find((f: any) => f.id === d.facultyId)?.name;
      return {
        value: d.id,
        label: d.name,
        category: facName || 'Department',
      };
    });
  }, [selectedFacultyId, departments, faculties]);

  const handleDepartmentChange = (deptId: string) => {
    setSelectedDepartmentId(deptId);
    const dept = departments.find((d: any) => d.id === deptId);
    if (dept?.facultyId) {
      setSelectedFacultyId(dept.facultyId);
    } else if (dept?.faculty?.id) {
      setSelectedFacultyId(dept.faculty.id);
    }
  };

  const handleFacultyChange = (newFacId: string) => {
    setSelectedFacultyId(newFacId);
    if (newFacId) {
      const matching = departments.filter((d: any) => d.facultyId === newFacId || d.faculty?.id === newFacId);
      if (matching.length > 0 && !matching.some((d: any) => d.id === selectedDepartmentId)) {
        setSelectedDepartmentId(matching[0].id);
      }
    }
  };

  const openModal = async () => {
    setShowAddModal(true);
    setActiveTab('create');
    setNewCode('');
    setNewName('');
    setNewLevel('300');
    setNewUnits('3');
    setNewSemester('1');
    setSelectedFacultyId('');
    setSelectedDepartmentId('');
    setLoadingAvailable(true);

    try {
      const facsPromise = adminApiRequest('/admin/faculties')
        .catch(() => null)
        .then(async (res) => {
          if (Array.isArray(res) && res.length > 0) return res;
          return adminApiRequest('/faculties/public' + (user?.schoolId ? `?schoolId=${user.schoolId}` : '')).catch(() => []);
        });

      const depsPromise = adminApiRequest('/admin/departments' + (user?.schoolId ? `?schoolId=${user.schoolId}` : ''))
        .catch(() => null)
        .then(async (res) => {
          if (Array.isArray(res) && res.length > 0) return res;
          return adminApiRequest('/departments/public' + (user?.schoolId ? `?schoolId=${user.schoolId}` : '')).catch(() => []);
        });

      const [coursesData, facsData, depsData] = await Promise.all([
        adminApiRequest('/courses/public').catch(() => null)
          .then(async (d) => {
            if (Array.isArray(d) && d.length > 0) return d;
            return adminApiRequest('/courses').catch(() => []);
          }),
        facsPromise,
        depsPromise,
      ]);

      if (Array.isArray(coursesData)) {
        setAvailableCourses(coursesData);
      } else {
        setAvailableCourses([]);
      }

      if (Array.isArray(facsData)) {
        setFaculties(facsData);
      }

      let allDeps: any[] = [];
      if (Array.isArray(depsData) && depsData.length > 0) {
        allDeps = depsData;
      } else if (Array.isArray(facsData) && facsData.length > 0) {
        allDeps = facsData.flatMap((f: any) => (f.departments || []).map((d: any) => ({ ...d, faculty: f })));
      }
      setDepartments(allDeps);

      // Preselect lecturer's department or first available department
      if (user?.departmentId && allDeps.some((d: any) => d.id === user.departmentId)) {
        handleDepartmentChange(user.departmentId);
      } else if (allDeps.length > 0) {
        handleDepartmentChange(allDeps[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch available courses / faculties:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  const handleCreateNewCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      showToast('Please enter a course code (e.g. LAW 301)', 'error');
      return;
    }
    if (!newName.trim()) {
      showToast('Please enter a course title (e.g. Law of Evidence I)', 'error');
      return;
    }
    if (!selectedDepartmentId) {
      showToast('Please select both faculty and department for this course', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: newCode.trim().toUpperCase(),
        name: newName.trim(),
        level: newLevel,
        unit: Number(newUnits) || 3,
        credits: Number(newUnits) || 3,
        semester: Number(newSemester) || 1,
        schoolId: user?.schoolId,
        departmentId: selectedDepartmentId,
        facultyId: selectedFacultyId,
        lecturerIds: user?.id ? [user.id] : [],
      };

      await adminApiRequest('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast(`Course "${newCode.toUpperCase()}" created and linked to department successfully!`, 'success');
      setShowAddModal(false);
      await fetchCourses();
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create new course', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignCourses = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await adminApiRequest(`/admin/users/${user.id}/courses`, {
        method: 'PATCH',
        body: JSON.stringify({
          courseIds: selectedCourseIds,
        }),
      });
      showToast('Assigned courses updated successfully!', 'success');
      setShowAddModal(false);
      await fetchCourses();
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update assigned courses', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-card">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-text-primary">Assigned Department Courses</h3>
          <p className="text-xs text-text-secondary">Official curriculum courses available in your department.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            + Add Course
          </button>
          <button
            onClick={fetchCourses}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                <th className="py-3 pr-4">Course Code & Title</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-gray-100 transition-all duration-200 ease-in-out hover:bg-surface-muted">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy text-white font-bold text-xs">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {course.code}: {course.name || course.title}
                        </p>
                        <p className="text-xs text-text-secondary">{course.department?.name || 'Department Faculty'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-text-primary">
                    {course.credits || course.unit || 3} Units
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-brand-navy">
                    {course.level || '300'}L
                  </td>
                  <td className="px-4 py-4 text-sm text-text-secondary">
                    {course.department?.name || 'Academic Dept'}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-text-muted" />
          <p className="mt-2 text-sm font-bold text-text-primary">No Courses Assigned Yet</p>
          <p className="mt-1 text-xs text-text-secondary">Click "+ Add Course" to add a course for your department level.</p>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-brand-navy">Add Department Course</h3>
                <p className="text-xs text-text-secondary">Create or assign official curriculum courses for your department.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex rounded-xl bg-surface p-1 border border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                + Create New Course
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('assign')}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  activeTab === 'assign'
                    ? 'bg-white text-brand-navy shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Assign Existing Course
              </button>
            </div>

            {activeTab === 'create' ? (
              <form onSubmit={handleCreateNewCourse} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SearchableSelect
                    label="Faculty"
                    value={selectedFacultyId}
                    onChange={handleFacultyChange}
                    options={facultyOptions}
                    placeholder="All Faculties / Select Faculty..."
                    emptyText="No faculties found"
                  />

                  <SearchableSelect
                    label="Department"
                    required
                    value={selectedDepartmentId}
                    onChange={handleDepartmentChange}
                    options={departmentOptions}
                    placeholder="Search or select department..."
                    emptyText="No departments found"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      placeholder="e.g. LAW 301"
                      className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs text-text-primary outline-none focus:border-brand-navy focus:bg-white placeholder:text-text-muted font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Level *
                    </label>
                    <select
                      value={newLevel}
                      onChange={(e) => setNewLevel(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs font-bold text-brand-navy outline-none focus:border-brand-navy focus:bg-white"
                    >
                      <option value="100">100 Level (100L)</option>
                      <option value="200">200 Level (200L)</option>
                      <option value="300">300 Level (300L)</option>
                      <option value="400">400 Level (400L)</option>
                      <option value="500">500 Level (500L)</option>
                      <option value="600">600 Level (600L)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Course Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Law of Evidence I"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs text-text-primary outline-none focus:border-brand-navy focus:bg-white placeholder:text-text-muted font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Credit Units *
                    </label>
                    <select
                      value={newUnits}
                      onChange={(e) => setNewUnits(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs font-semibold text-text-primary outline-none focus:border-brand-navy focus:bg-white"
                    >
                      <option value="1">1 Unit</option>
                      <option value="2">2 Units</option>
                      <option value="3">3 Units</option>
                      <option value="4">4 Units</option>
                      <option value="5">5 Units</option>
                      <option value="6">6 Units</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                      Semester
                    </label>
                    <select
                      value={newSemester}
                      onChange={(e) => setNewSemester(e.target.value)}
                      className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs font-semibold text-text-primary outline-none focus:border-brand-navy focus:bg-white"
                    >
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="h-11 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Creating Course...' : 'Create & Add Course'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Select Platform Courses to Assign to Yourself
                  </label>
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 p-3 space-y-2 bg-surface">
                    {loadingAvailable ? (
                      <div className="flex items-center gap-2 p-3 text-xs text-text-muted">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand-navy" />
                        <span>Loading department courses...</span>
                      </div>
                    ) : availableCourses.length > 0 ? (
                      availableCourses.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer hover:bg-white p-1.5 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                          <input
                            type="checkbox"
                            checked={selectedCourseIds.includes(c.id)}
                            onChange={() => {
                              setSelectedCourseIds((prev) =>
                                prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                              );
                            }}
                            className="rounded border-gray-300 text-brand-navy focus:ring-brand-navy"
                          />
                          <span>
                            <strong className="text-brand-navy font-bold">{c.code}</strong>: {c.name || c.title} <span className="text-text-muted">({c.level || '300'}L)</span>
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-text-muted p-2">
                        No additional platform courses found. Use the <strong>"+ Create New Course"</strong> tab above to add a course for your department.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="h-11 rounded-xl border border-gray-200 px-4 text-xs font-semibold text-text-secondary hover:bg-surface"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignCourses}
                    disabled={saving}
                    className="h-11 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all disabled:opacity-50 shadow-sm"
                  >
                    {saving ? 'Saving...' : 'Save Assigned Courses'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
