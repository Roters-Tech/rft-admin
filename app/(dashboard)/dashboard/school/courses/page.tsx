'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Layers,
  Users,
  UserCheck,
  Check,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest, clearAdminApiCache } from '@/lib/apiClient';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';

interface Department {
  id: string;
  name: string;
  facultyId: string;
}

interface Faculty {
  id: string;
  name: string;
  departments?: Department[];
}

interface CourseItem {
  id: string;
  code: string;
  name: string;
  level?: string;
  semester?: number;
  unit?: number;
  status?: string;
  departmentId?: string;
  schoolId?: string;
  department?: {
    id: string;
    name: string;
    faculty?: {
      id: string;
      name: string;
    };
  };
  lecturers?: {
    id: string;
    fullName: string;
    email: string;
  }[];
  _count?: {
    enrollments?: number;
    users?: number;
  };
}

export default function SchoolCoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [formFacultyId, setFormFacultyId] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formLevel, setFormLevel] = useState('100');
  const [formSemester, setFormSemester] = useState('1');
  const [formUnit, setFormUnit] = useState('3');
  const [formLecturerId, setFormLecturerId] = useState('');

  // Lecturers & Assignment State
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [assigningCourse, setAssigningCourse] = useState<CourseItem | null>(null);
  const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);
  const [savingLecturers, setSavingLecturers] = useState(false);
  const [assignLecturerSearch, setAssignLecturerSearch] = useState('');

  // Delete State
  const [deletingCourse, setDeletingCourse] = useState<CourseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      clearAdminApiCache();
      const [coursesData, facultiesData, depsData, lecsData] = await Promise.all([
        adminApiRequest('/admin/courses').catch(() => []),
        adminApiRequest('/admin/faculties').catch(() => []),
        adminApiRequest('/admin/departments').catch(() => []),
        adminApiRequest('/admin/users?role=LECTURER').catch(() => []),
      ]);

      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }
      if (Array.isArray(facultiesData)) {
        setFaculties(facultiesData);
      }
      if (Array.isArray(lecsData)) {
        setLecturers(lecsData);
      }
      let allDeps: any[] = [];
      if (Array.isArray(depsData) && depsData.length > 0) {
        allDeps = depsData;
      } else if (Array.isArray(facultiesData) && facultiesData.length > 0) {
        allDeps = facultiesData.flatMap((f: any) => (f.departments || []).map((d: any) => ({ ...d, faculty: f })));
      }
      setDepartments(allDeps);
    } catch (err: any) {
      setError(err?.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const facultyOptions = useMemo(() => {
    const opts: SearchableOption[] = [{ value: '', label: 'All Faculties / General', sublabel: `${departments.length} Total Departments` }];
    faculties.forEach((f) => {
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
    if (formFacultyId) {
      const filtered = departments.filter((d: any) => d.facultyId === formFacultyId || d.faculty?.id === formFacultyId);
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
  }, [formFacultyId, departments, faculties]);

  const handleDepartmentChange = (deptId: string) => {
    setFormDepartmentId(deptId);
    const dept = departments.find((d: any) => d.id === deptId);
    if (dept?.facultyId) {
      setFormFacultyId(dept.facultyId);
    } else if (dept?.faculty?.id) {
      setFormFacultyId(dept.faculty.id);
    }
  };

  const handleFacultyChange = (newFacultyId: string) => {
    setFormFacultyId(newFacultyId);
    if (newFacultyId) {
      const matching = departments.filter((d: any) => d.facultyId === newFacultyId || d.faculty?.id === newFacultyId);
      if (matching.length > 0 && !matching.some((d: any) => d.id === formDepartmentId)) {
        setFormDepartmentId(matching[0].id);
      }
    }
  };

  // Create course submit
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim() || !formDepartmentId) {
      setError('Please provide course code, course title, and select both faculty and department.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await adminApiRequest('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({
          code: courseCode.trim().toUpperCase(),
          name: courseName.trim(),
          departmentId: formDepartmentId,
          facultyId: formFacultyId,
          level: formLevel,
          semester: Number(formSemester) || 1,
          unit: Number(formUnit) || 3,
          lecturerIds: formLecturerId ? [formLecturerId] : undefined,
        }),
      });

      setSuccess(`Course ${courseCode.trim().toUpperCase()} has been successfully registered!`);
      setCourseCode('');
      setCourseName('');
      setFormFacultyId('');
      setFormDepartmentId('');
      setFormLevel('100');
      setFormSemester('1');
      setFormUnit('3');
      setFormLecturerId('');
      setIsModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const lecturerCreationOptions: SearchableOption[] = useMemo(() => {
    const opts: SearchableOption[] = [{ value: '', label: 'No Lecturer Assigned Yet' }];
    lecturers.forEach((lec) => {
      opts.push({
        value: lec.id,
        label: lec.fullName,
        sublabel: lec.email,
        category: lec.department?.name || 'Faculty / Department',
      });
    });
    return opts;
  }, [lecturers]);

  const filteredAssignLecturers = useMemo(() => {
    if (!assignLecturerSearch.trim()) return lecturers;
    const q = assignLecturerSearch.toLowerCase();
    return lecturers.filter(
      (l: any) =>
        l.fullName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.department?.name?.toLowerCase().includes(q)
    );
  }, [lecturers, assignLecturerSearch]);

  const openAssignModal = (course: CourseItem) => {
    setAssigningCourse(course);
    setSelectedLecturerIds((course.lecturers || []).map((l: any) => l.id));
    setAssignLecturerSearch('');
  };

  const toggleLecturerSelection = (lecturerId: string) => {
    setSelectedLecturerIds((prev) =>
      prev.includes(lecturerId) ? prev.filter((id) => id !== lecturerId) : [...prev, lecturerId]
    );
  };

  const handleSaveLecturerAssignments = async () => {
    if (!assigningCourse) return;
    setSavingLecturers(true);
    try {
      await adminApiRequest(`/admin/courses/${assigningCourse.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lecturerIds: selectedLecturerIds,
        }),
      });
      setSuccess(`Lecturers assigned to ${assigningCourse.code} successfully!`);
      setAssigningCourse(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign lecturers');
    } finally {
      setSavingLecturers(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      await adminApiRequest(`/admin/courses/${deletingCourse.id}`, {
        method: 'DELETE',
      });
      setSuccess(`Course ${deletingCourse.code} removed.`);
      setDeletingCourse(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.department?.name && c.department.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.department?.faculty?.name && c.department.faculty.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFaculty =
        selectedFacultyFilter === 'all' ||
        c.department?.faculty?.id === selectedFacultyFilter;

      const matchesLevel =
        selectedLevelFilter === 'all' ||
        (c.level && c.level.replace(/[^0-9]/g, '') === selectedLevelFilter);

      return matchesSearch && matchesFaculty && matchesLevel;
    });
  }, [courses, searchTerm, selectedFacultyFilter, selectedLevelFilter]);

  // Aggregate stats
  const totalCourses = courses.length;
  const totalEnrollments = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);
  const totalDepts = faculties.reduce((acc, f) => acc + (f.departments?.length || 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course Management"
        subtitle="Configure institution course catalog, link courses to faculties and departments, and track student enrollments."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setError('');
                setSuccess('');
                setFormFacultyId('');
                if (departments.length > 0) {
                  setFormDepartmentId(departments[0].id);
                  if (departments[0].facultyId) {
                    setFormFacultyId(departments[0].facultyId);
                  }
                } else {
                  setFormDepartmentId('');
                }
                setIsModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-bold text-white hover:bg-brand-navy/90"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Catalog Courses</p>
              <p className="text-2xl font-bold text-brand-navy">{totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Active Faculties</p>
              <p className="text-2xl font-bold text-brand-navy">{faculties.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Departments</p>
              <p className="text-2xl font-bold text-brand-navy">{totalDepts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Enrollments</p>
              <p className="text-2xl font-bold text-brand-navy">{totalEnrollments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Panel */}
      <Panel
        title="Institution Course Catalog"
        subtitle="All registered academic courses, their parent faculties and departments, and enrollment counts."
      >
        {/* Filters and search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course code, title, department, or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-surface pl-10 pr-4 py-2.5 text-xs outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFacultyFilter}
              onChange={(e) => setSelectedFacultyFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-text-secondary outline-none focus:border-brand-primary"
            >
              <option value="all">All Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>

            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-text-secondary outline-none focus:border-brand-primary"
            >
              <option value="all">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
              <option value="500">500 Level</option>
              <option value="600">600 Level</option>
              <option value="700">700 Level</option>
            </select>
          </div>
        </div>

        {/* Courses Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 uppercase tracking-wider text-text-secondary border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 font-semibold">Course Code & Title</th>
                <th className="px-4 py-3 font-semibold">Faculty</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Assigned Lecturer(s)</th>
                <th className="px-4 py-3 font-semibold">Level</th>
                <th className="px-4 py-3 font-semibold">Semester</th>
                <th className="px-4 py-3 font-semibold">Units</th>
                <th className="px-4 py-3 font-semibold">Enrollments</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-secondary">
                    <BookOpen className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="font-semibold text-text-primary">No courses found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {courses.length === 0
                        ? 'Click "Add Course" above to register the first course in your curriculum.'
                        : 'No courses match your current search or filters.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCourses.map((c) => {
                  const facultyName =
                    c.department?.faculty?.name ||
                    faculties.find((f) => f.id === c.department?.faculty?.id)?.name ||
                    'General Studies';
                  const deptName = c.department?.name || 'Departmental';
                  const levelLabel = c.level ? `${c.level.replace(/[^0-9]/g, '')} Level` : 'All';
                  const semesterLabel = c.semester === 2 ? '2nd' : '1st';
                  const enrollCount = c._count?.enrollments || 0;

                  return (
                    <tr key={c.id} className="hover:bg-surface/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white font-bold">
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-brand-navy block text-sm">{c.code}</span>
                            <span className="text-text-secondary text-xs">{c.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span>{facultyName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-text-primary">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-gray-400" />
                          <span>{deptName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[180px]">
                          {c.lecturers && c.lecturers.length > 0 ? (
                            c.lecturers.map((l: any) => (
                              <span
                                key={l.id}
                                className="inline-flex items-center gap-1 rounded-md bg-brand-navy/10 px-2 py-0.5 text-[11px] font-semibold text-brand-navy"
                              >
                                <UserCheck className="h-3 w-3" />
                                {l.fullName}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-text-muted italic">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                          {levelLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-text-primary">{semesterLabel}</td>
                      <td className="px-4 py-3.5 font-medium text-text-primary">{c.unit || 3}</td>
                      <td className="px-4 py-3.5 font-semibold text-text-primary">
                        {enrollCount} Students
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openAssignModal(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                            title="Assign Lecturers to this Course"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            Assign
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCourse(c)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Add New Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Add New Course</h3>
                  <p className="text-xs text-text-secondary">Link course directly to faculty and department</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-5 space-y-4">
              <div className="space-y-4">
                <SearchableSelect
                  label="Faculty"
                  value={formFacultyId}
                  onChange={handleFacultyChange}
                  options={facultyOptions}
                  placeholder="All Faculties / Select Faculty..."
                  emptyText="No faculties found"
                />

                <SearchableSelect
                  label="Department"
                  required
                  value={formDepartmentId}
                  onChange={handleDepartmentChange}
                  options={departmentOptions}
                  placeholder="Search or select department..."
                  emptyText="No departments found"
                />
              </div>

              {/* Course Code & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 301"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs font-bold text-brand-navy outline-none focus:border-brand-primary uppercase"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Course Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures and Algorithms"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Level, Semester & Units */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Level *
                  </label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                    <option value="600">600 Level</option>
                    <option value="700">700 Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Semester
                  </label>
                  <select
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                    Credit Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <SearchableSelect
                label="Assign Lecturer (Optional)"
                value={formLecturerId}
                onChange={setFormLecturerId}
                options={lecturerCreationOptions}
                placeholder="Search or select lecturer..."
                emptyText="No lecturers found"
              />

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formDepartmentId}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-brand-navy">Delete Course</h3>
                <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                  Are you sure you want to delete course <span className="font-bold text-brand-navy">{deletingCourse.code}</span> ({deletingCourse.name})?
                </p>
                <div className="mt-3 rounded-xl bg-surface p-3 text-xs text-text-secondary space-y-1.5">
                  <div className="flex justify-between">
                    <span>Department:</span>
                    <span className="font-semibold text-brand-navy">{deletingCourse.department?.name || 'Department Linked'}</span>
                  </div>
                  {deletingCourse.department?.faculty?.name && (
                    <div className="flex justify-between">
                      <span>Faculty:</span>
                      <span className="font-medium text-text-primary">{deletingCourse.department.faculty.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Level:</span>
                    <span className="font-medium text-text-primary">{deletingCourse.level ? `${deletingCourse.level.replace(/[^0-9]/g, '')}L` : '100L'}</span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-red-500 font-medium">
                  This action cannot be undone and will delete all enrollments and links associated with this course.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                disabled={isDeleting}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Lecturers to Course Modal */}
      {assigningCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Assign Course Lecturers</h3>
                  <p className="text-xs text-text-secondary">{assigningCourse.code} • {assigningCourse.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCourse(null)}
                className="rounded-xl p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-text-secondary leading-relaxed">
              Select which verified lecturers teach this course. Once assigned, this course will appear in their lecturer dashboard in real time.
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lecturers by name, email, or department..."
                  value={assignLecturerSearch}
                  onChange={(e) => setAssignLecturerSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-surface py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-navy"
                />
              </div>
              <span className="text-xs font-bold text-brand-navy whitespace-nowrap">
                {selectedLecturerIds.length} Selected
              </span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto max-h-60 rounded-2xl border border-gray-200 p-2 space-y-1 divide-y divide-gray-100">
              {lecturers.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted">
                  No verified lecturers registered for this campus yet.
                </div>
              ) : filteredAssignLecturers.length === 0 ? (
                <div className="py-6 text-center text-xs text-text-muted">
                  No lecturers match your search criteria.
                </div>
              ) : (
                filteredAssignLecturers.map((lec) => {
                  const isChecked = selectedLecturerIds.includes(lec.id);
                  return (
                    <div
                      key={lec.id}
                      onClick={() => toggleLecturerSelection(lec.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isChecked ? 'bg-sky-50 border border-sky-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-5 w-5 rounded-lg border flex items-center justify-center transition ${
                            isChecked ? 'bg-brand-navy border-brand-navy text-white' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-brand-navy">{lec.fullName}</p>
                          <p className="text-[11px] text-text-muted">{lec.email} {lec.department?.name ? `• ${lec.department.name}` : ''}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => setAssigningCourse(null)}
                disabled={savingLecturers}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLecturerAssignments}
                disabled={savingLecturers}
                className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                {savingLecturers ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Save Assignments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
