'use client';

import { useEffect, useState, useMemo, use } from 'react';
import Link from 'next/link';
import { Building2, MapPin, ShieldCheck, Users, Plus, BookOpen, ArrowLeft, RefreshCw, Upload, FileText, CheckCircle, Trash2, Layers, Power, X, CreditCard, GraduationCap, UserCheck, Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { platformSchools } from '@/lib/mock-data/platform';
import { PageHeader } from '@/components/ui/PageHeader';
import { Panel } from '@/components/ui/Panel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';
import { DepartmentSelector } from '@/components/ui/DepartmentSelector';
import { SearchableSelect, SearchableOption } from '@/components/ui/SearchableSelect';

export default function SchoolProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [school, setSchool] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [schoolFaculties, setSchoolFaculties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals for adding lecturer, content, departments, and subscription tier
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTierPlan, setSelectedTierPlan] = useState('Free Plan');

  // Course Modal state & fields
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseLevel, setCourseLevel] = useState('300');
  const [courseUnits, setCourseUnits] = useState('3');
  const [courseSemester, setCourseSemester] = useState('1');
  const [courseFacultyId, setCourseFacultyId] = useState('');
  const [courseDepartmentId, setCourseDepartmentId] = useState('');
  const [courseLecturerId, setCourseLecturerId] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<any | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);

  // Assign Lecturers to Course modal state
  const [assigningCourse, setAssigningCourse] = useState<any | null>(null);
  const [selectedCourseLecturerIds, setSelectedCourseLecturerIds] = useState<string[]>([]);
  const [savingCourseLecturers, setSavingCourseLecturers] = useState(false);
  const [courseLecturerSearch, setCourseLecturerSearch] = useState('');

  const [lecturerName, setLecturerName] = useState('');
  const [lecturerEmail, setLecturerEmail] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [contentCourseId, setContentCourseId] = useState('');
  const [contentLevel, setContentLevel] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contentType, setContentType] = useState<'past_question' | 'resource' | 'slides'>('past_question');
  const [isPaid, setIsPaid] = useState(true);
  const [price, setPrice] = useState(500);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchSchoolDetails = async () => {
    setLoading(true);
    try {
      const schoolData = await adminApiRequest(`/admin/schools/${id}`).catch(() => null);
      if (schoolData) {
        setSchool(schoolData);
      } else {
        const localMatch = platformSchools.find((item) => item.id === id) || {
          id,
          name: 'University Campus',
          location: 'Lagos, Nigeria',
          status: 'optimal',
          students: 12482,
          lecturers: 245,
          courses: 86,
          dean: 'Academic Administration',
        };
        setSchool(localMatch);
      }

      const [coursesData, usersData, depsData, studentsData, contentsData, facsData] = await Promise.all([
        adminApiRequest('/admin/courses').catch(() => []),
        adminApiRequest(`/admin/users?role=LECTURER&schoolId=${id}`).catch(() => []),
        adminApiRequest(`/admin/departments/school/${id}`).catch(() => []),
        adminApiRequest(`/admin/users?role=STUDENT&schoolId=${id}`).catch(() => []),
        adminApiRequest(`/admin/content?schoolId=${id}`).catch(() => []),
        adminApiRequest(`/admin/faculties?schoolId=${id}`).catch(() => null)
          .then(async (res) => {
            if (Array.isArray(res) && res.length > 0) return res;
            return adminApiRequest(`/faculties/public?schoolId=${id}`).catch(() => []);
          }),
      ]);

      if (Array.isArray(coursesData)) {
        const filteredCourses = coursesData.filter((c: any) => c.schoolId === id || c.school?.id === id);
        setCourses(filteredCourses);
      }
      if (Array.isArray(usersData)) setLecturers(usersData);
      if (Array.isArray(depsData)) {
        setDepartments(depsData);
        setSelectedDepartments(depsData.map((d: any) => d.name));
      }
      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }
      if (Array.isArray(contentsData)) {
        setContents(contentsData);
      }
      if (Array.isArray(facsData)) {
        setSchoolFaculties(facsData);
      }
    } catch (err) {
      console.warn('Error fetching school details:', err);
    } finally {
      setLoading(false);
    }
  };

  const facultyOptions = useMemo(() => {
    const opts: SearchableOption[] = [{ value: '', label: 'All Faculties / General', sublabel: `${departments.length} Total Departments` }];
    schoolFaculties.forEach((f: any) => {
      const depCount = departments.filter((d: any) => d.facultyId === f.id || d.faculty?.id === f.id).length || f.departments?.length || 0;
      opts.push({
        value: f.id,
        label: f.name,
        category: 'Faculty',
        sublabel: `${depCount} Departments`,
      });
    });
    return opts;
  }, [schoolFaculties, departments]);

  const departmentOptions = useMemo(() => {
    let list = departments;
    if (courseFacultyId) {
      const filtered = departments.filter((d: any) => d.facultyId === courseFacultyId || d.faculty?.id === courseFacultyId);
      if (filtered.length > 0) {
        list = filtered;
      }
    }

    return list.map((d: any) => {
      const facName = d.faculty?.name || schoolFaculties.find((f: any) => f.id === d.facultyId)?.name;
      return {
        value: d.id,
        label: d.name,
        category: facName || 'Department',
      };
    });
  }, [courseFacultyId, departments, schoolFaculties]);

  const lecturerCreationOptions: SearchableOption[] = useMemo(() => {
    const opts: SearchableOption[] = [{ value: '', label: 'No Lecturer Assigned Yet' }];
    lecturers.forEach((lec) => {
      opts.push({
        value: lec.id,
        label: lec.fullName,
        sublabel: lec.email,
        category: lec.department?.name || 'Faculty',
      });
    });
    return opts;
  }, [lecturers]);

  const filteredAssignLecturers = useMemo(() => {
    if (!courseLecturerSearch.trim()) return lecturers;
    const q = courseLecturerSearch.toLowerCase();
    return lecturers.filter(
      (l: any) =>
        l.fullName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.department?.name?.toLowerCase().includes(q)
    );
  }, [lecturers, courseLecturerSearch]);

  const handleCourseDepartmentChange = (deptId: string) => {
    setCourseDepartmentId(deptId);
    const dept = departments.find((d: any) => d.id === deptId);
    if (dept?.facultyId) {
      setCourseFacultyId(dept.facultyId);
    } else if (dept?.faculty?.id) {
      setCourseFacultyId(dept.faculty.id);
    }
  };

  const handleCourseFacultyChange = (newFacId: string) => {
    setCourseFacultyId(newFacId);
    if (newFacId) {
      const matchingDepts = departments.filter((d: any) => d.facultyId === newFacId || d.faculty?.id === newFacId);
      if (matchingDepts.length > 0 && !matchingDepts.some((d: any) => d.id === courseDepartmentId)) {
        setCourseDepartmentId(matchingDepts[0].id);
      }
    }
  };

  const handleOpenCourseModal = () => {
    setCourseCode('');
    setCourseName('');
    setCourseLevel('300');
    setCourseUnits('3');
    setCourseSemester('1');
    setCourseFacultyId('');
    if (departments.length > 0) {
      setCourseDepartmentId(departments[0].id);
      if (departments[0].facultyId || departments[0].faculty?.id) {
        setCourseFacultyId(departments[0].facultyId || departments[0].faculty?.id);
      }
    } else {
      setCourseDepartmentId('');
    }
    setShowCourseModal(true);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode.trim()) {
      showToast('Please enter a course code (e.g. LAW 301)', 'error');
      return;
    }
    if (!courseName.trim()) {
      showToast('Please enter a course title (e.g. Law of Evidence I)', 'error');
      return;
    }
    if (!courseDepartmentId) {
      showToast('Please select both faculty and department for this course', 'error');
      return;
    }

    setCreatingCourse(true);
    try {
      const payload = {
        code: courseCode.trim().toUpperCase(),
        name: courseName.trim(),
        level: courseLevel,
        unit: Number(courseUnits) || 3,
        credits: Number(courseUnits) || 3,
        semester: Number(courseSemester) || 1,
        schoolId: id,
        departmentId: courseDepartmentId,
        facultyId: courseFacultyId || undefined,
        lecturerIds: courseLecturerId ? [courseLecturerId] : undefined,
      };

      await adminApiRequest('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast(`Course "${courseCode.toUpperCase()}" created and linked to department successfully!`, 'success');
      setShowCourseModal(false);
      setCourseLecturerId('');
      await fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create course', 'error');
    } finally {
      setCreatingCourse(false);
    }
  };

  const openAssignCourseLecturers = (course: any) => {
    setAssigningCourse(course);
    setSelectedCourseLecturerIds((course.lecturers || []).map((l: any) => l.id));
    setCourseLecturerSearch('');
  };

  const toggleLecturerForCourse = (lecturerId: string) => {
    setSelectedCourseLecturerIds((prev) =>
      prev.includes(lecturerId) ? prev.filter((id) => id !== lecturerId) : [...prev, lecturerId]
    );
  };

  const handleSaveCourseLecturers = async () => {
    if (!assigningCourse) return;
    setSavingCourseLecturers(true);
    try {
      await adminApiRequest(`/admin/courses/${assigningCourse.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          lecturerIds: selectedCourseLecturerIds,
        }),
      });
      showToast(`Assigned lecturers for ${assigningCourse.code} updated!`, 'success');
      setAssigningCourse(null);
      await fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign lecturers', 'error');
    } finally {
      setSavingCourseLecturers(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsDeletingCourse(true);
    try {
      await adminApiRequest(`/admin/courses/${deletingCourse.id}`, {
        method: 'DELETE',
      });
      showToast(`Course "${deletingCourse.code}" deleted successfully.`, 'success');
      setDeletingCourse(null);
      await fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete course', 'error');
    } finally {
      setIsDeletingCourse(false);
    }
  };

  useEffect(() => {
    fetchSchoolDetails();
  }, [id]);

  const handleMakeClassRep = async (studentId: string, studentName: string) => {
    try {
      await adminApiRequest('/admin/class-reps', {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      });
      showToast(`Promoted ${studentName} to Class Rep!`, 'success');
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to make student class rep', 'error');
    }
  };

  const handleToggleDeactivation = async () => {
    const isDeactivated = school?.status === 'deactivated';
    const actionText = isDeactivated ? 'reactivate' : 'deactivate';

    if (
      !confirm(
        `Are you sure you want to ${actionText} "${school?.name || 'this institution'}"? ${
          !isDeactivated
            ? 'Users of this campus will be blocked from logging in.'
            : 'Users will be able to access the system again.'
        }`
      )
    ) {
      return;
    }

    try {
      await adminApiRequest(`/admin/schools/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: isDeactivated ? 'active' : 'deactivated' }),
      });
      showToast(`Successfully ${actionText}d ${school?.name || 'institution'}`, 'success');
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || `Failed to ${actionText} school`, 'error');
    }
  };

  const handleSoftDelete = async () => {
    if (!confirm(`Are you sure you want to soft delete "${school?.name || 'this institution'}"?`)) return;

    try {
      await adminApiRequest(`/admin/schools/${id}`, { method: 'DELETE' });
      showToast(`Soft deleted ${school?.name || 'institution'}`, 'success');
      router.push('/dashboard/super/schools');
    } catch (err: any) {
      showToast(err?.message || 'Failed to soft delete school', 'error');
    }
  };

  const handleSaveDepartments = async () => {
    setSubmitting(true);
    try {
      await adminApiRequest('/admin/departments/batch', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: id,
          departments: selectedDepartments,
        }),
      });
      showToast(`Saved ${selectedDepartments.length} departments for ${school?.name || 'school'}!`, 'success');
      setShowDepartmentModal(false);
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save departments', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerName || !lecturerEmail) {
      showToast('Please enter lecturer name and email', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName: lecturerName,
          email: lecturerEmail,
          schoolId: school.id,
        }),
      });

      showToast(`Lecturer ${lecturerName} created! Temporary login credentials sent to ${lecturerEmail}`, 'success');
      setShowLecturerModal(false);
      setLecturerName('');
      setLecturerEmail('');
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to assign lecturer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadContent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Please select at least one file', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const items = selectedFiles.map((file) => ({
        title: selectedFiles.length === 1 ? contentTitle.trim() || file.name.replace(/\.[^/.]+$/, '') : file.name.replace(/\.[^/.]+$/, ''),
        type: contentType,
        courseId: contentCourseId || undefined,
        level: contentLevel || undefined,
        schoolId: school.id,
        isPaid: isPaid,
        price: isPaid ? price : 0,
      }));

      formData.append('items', JSON.stringify(items));

      const response = await adminApiRequest('/admin/content/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (response?.results) {
        showToast(`Bulk upload finished: ${response.successCount} succeeded, ${response.failureCount} failed`, response.failureCount === 0 ? 'success' : 'error');
      }

      setShowContentModal(false);
      setContentTitle('');
      setSelectedFiles([]);
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload content', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeTier = async (newPlan: string) => {
    setSubmitting(true);
    try {
      await adminApiRequest(`/admin/schools/${id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ planName: newPlan }),
      });
      showToast(`Successfully updated subscription to ${newPlan}!`, 'success');
      setShowTierModal(false);
      fetchSchoolDetails();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update subscription tier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!school && loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-brand-navy" />
        <span className="ml-3 text-sm text-text-secondary">Loading institution dashboard...</span>
      </div>
    );
  }

  const activeSchool = school || {
    id,
    name: 'University Institution',
    address: 'Lagos, Nigeria',
    status: 'active',
    _count: { users: 0, courses: 0, departments: 0 },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/super/schools" className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
      </div>

      <PageHeader
        title={`${activeSchool.name} Management`}
        subtitle="Manage departments, institutional settings, assign lecturers, and upload past questions for this campus."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowDepartmentModal(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-brand-navy bg-white px-4 text-xs font-semibold text-brand-navy hover:bg-surface transition-all"
            >
              <Layers className="h-4 w-4" />
              Manage Departments
            </button>
            <button
              onClick={() => setShowLecturerModal(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all"
            >
              <Plus className="h-4 w-4" />
              Assign Lecturer
            </button>
            <button
              onClick={handleOpenCourseModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
            <button
              onClick={() => setShowContentModal(true)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-gold px-4 text-xs font-bold text-brand-navy hover:bg-brand-gold-light transition-all"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload Material(s)
            </button>
            <button
              onClick={handleToggleDeactivation}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition-all ${
                activeSchool.status === 'deactivated'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-600 hover:text-white'
              }`}
            >
              <Power className="h-4 w-4" />
              {activeSchool.status === 'deactivated' ? 'Reactivate Access' : 'Deactivate Access'}
            </button>
            <button
              onClick={handleSoftDelete}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy text-white">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-text-primary">{activeSchool.name}</h2>
                  <span className="rounded-full bg-brand-navy/10 border border-brand-navy/20 px-3 py-0.5 text-xs font-bold text-brand-navy">
                    {activeSchool.plan || activeSchool.subscription?.planName || (activeSchool.capacity && activeSchool.capacity > 10 ? 'Premium Plan' : 'Free Plan')}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTierPlan(activeSchool.plan || activeSchool.subscription?.planName || 'Free Plan');
                      setShowTierModal(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-2.5 py-1 text-[11px] font-bold text-white hover:bg-brand-navy-deep transition-colors"
                  >
                    <CreditCard className="h-3 w-3" /> Change Tier
                  </button>
                </div>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-text-secondary">
                  <MapPin className="h-4 w-4" />
                  {activeSchool.address || activeSchool.location || 'Lagos, Nigeria'}
                </p>
              </div>
            </div>
            {activeSchool.status === 'deactivated' ? (
              <span className="rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                Deactivated
              </span>
            ) : (
              <StatusBadge status={activeSchool.status || 'optimal'} />
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Students Limit</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {students.length} / {(
                  activeSchool.maxStudents ||
                  (activeSchool.plan?.toLowerCase().includes('premium') ? 5000 : (activeSchool.plan?.toLowerCase().includes('enterprise') ? 100000 : 10))
                ).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Departments</p>
              <p className="mt-2 text-2xl font-bold text-brand-navy">{departments.length}</p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Lecturers</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{lecturers.length}</p>
            </div>
            <div className="rounded-2xl bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Courses</p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{courses.length}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Institutional Departments" subtitle="Active academic units setup for this school.">
          <div className="space-y-3">
            {departments.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {departments.map((d: any) => (
                  <span key={d.id || d.name} className="rounded-xl border border-brand-navy/15 bg-[#f4f6ff] px-3 py-1.5 text-xs font-semibold text-brand-navy">
                    {d.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted italic">No departments setup for this campus yet.</p>
            )}
            <button
              onClick={() => setShowDepartmentModal(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Manage / Add Departments
            </button>
          </div>
        </Panel>
      </div>

      {/* Courses & Past Questions Panel */}
      <Panel
        title={`Registered Courses (${courses.length})`}
        subtitle="Catalog of active academic modules for this campus."
        action={
          <button
            onClick={handleOpenCourseModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-navy px-3.5 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Course
          </button>
        }
      >
        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Department / Faculty</th>
                  <th className="py-3 px-4">Assigned Lecturer(s)</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 text-sm hover:bg-surface">
                    <td className="py-3 px-4 font-bold text-brand-navy">{course.code}</td>
                    <td className="py-3 px-4 font-medium text-text-primary">{course.name}</td>
                    <td className="py-3 px-4 text-text-secondary">
                      <span className="font-semibold text-brand-navy">
                        {course.department?.name || 'Department Linked'}
                      </span>
                      {course.department?.faculty?.name ? (
                        <span className="block text-[11px] text-text-muted">{course.department.faculty.name}</span>
                      ) : null}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                        {course.lecturers && course.lecturers.length > 0 ? (
                          course.lecturers.map((l: any) => (
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
                    <td className="py-3 px-4 text-text-secondary">{course.level || '300'}L</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-status-optimal">
                        <CheckCircle className="h-3.5 w-3.5" /> Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openAssignCourseLecturers(course)}
                          className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                          title="Assign Lecturers to this Course"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          Assign
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCourse(course)}
                          className="rounded-lg p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Delete Course"
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
        ) : (
          <div className="py-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm font-bold text-text-primary">No Courses Registered for this Campus Yet</p>
            <p className="mt-1 text-xs text-text-secondary">Click below to create and link the first course to a department and faculty.</p>
            <button
              onClick={handleOpenCourseModal}
              className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Course
            </button>
          </div>
        )}
      </Panel>

      {/* Uploaded Past Questions & Resources Panel */}
      <Panel title={`Uploaded Past Questions & Educational Resources (${contents.length})`} subtitle="Catalog of uploaded past questions, slides, and learning materials for this campus.">
        {contents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Price / Access</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {contents.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 text-sm hover:bg-surface">
                    <td className="py-3 px-4 font-bold text-brand-navy">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-navy" />
                        <span>{item.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-text-secondary uppercase">
                      {item.type || 'past_question'}
                    </td>
                    <td className="py-3 px-4">
                      {item.isPaid ? (
                        <span className="rounded-md bg-brand-gold/20 px-2 py-0.5 text-xs font-bold text-brand-navy border border-brand-gold">
                          ₦{item.price || 500}
                        </span>
                      ) : (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-text-secondary">
                      {item.course?.code || item.course?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
                        >
                          View / Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Upload className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm font-bold text-text-primary">No Past Questions Uploaded for this Campus Yet</p>
            <p className="mt-1 text-xs text-text-secondary">Click "Upload Question" above to upload study materials for students.</p>
          </div>
        )}
      </Panel>

      {/* Enrolled Students & Class Rep Promotion Panel */}
      <Panel title={`Enrolled Students & Class Reps (${students.length})`} subtitle="View students in this campus and appoint Class Reps.">
        {students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Matric No</th>
                  <th className="py-3 px-4">Role / Rep Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const isRep = st.role === 'CLASS_REP' || (st.classRepAssignments && st.classRepAssignments.length > 0);
                  return (
                    <tr key={st.id} className="border-b border-gray-100 text-sm hover:bg-surface">
                      <td className="py-3 px-4 font-bold text-brand-navy">{st.fullName}</td>
                      <td className="py-3 px-4 text-text-secondary">{st.email}</td>
                      <td className="py-3 px-4 text-text-primary font-mono text-xs">{st.matricNumber || st.matricNo || 'N/A'}</td>
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
                      <td className="py-3 px-4">
                        {!isRep && (
                          <button
                            onClick={() => handleMakeClassRep(st.id, st.fullName)}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-deep transition-all"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Make Class Rep
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-text-muted" />
            <p className="mt-2 text-sm font-bold text-text-primary">No Students Enrolled in this Campus Yet</p>
            <p className="mt-1 text-xs text-text-secondary">Students registering under this school will appear here in real time.</p>
          </div>
        )}
      </Panel>


      {/* Modal 1: Manage / Add Departments */}
      {showDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-brand-navy">Manage Departments for {activeSchool.name}</h3>
            <DepartmentSelector
              selectedDepartments={selectedDepartments}
              onChange={setSelectedDepartments}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowDepartmentModal(false)} className="h-11 rounded-xl border border-gray-200 px-5 text-xs font-semibold text-text-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDepartments}
                disabled={submitting}
                className="h-11 rounded-xl bg-brand-navy px-6 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Departments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Assign Lecturer */}
      {showLecturerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-brand-navy">Assign Lecturer to {activeSchool.name}</h3>
            <form onSubmit={handleAssignLecturer} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-text-secondary mb-1">Full Name</label>
                <input
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  placeholder="e.g. Dr. Adebayo Oladimeji"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-text-secondary mb-1">Email</label>
                <input
                  type="email"
                  value={lecturerEmail}
                  onChange={(e) => setLecturerEmail(e.target.value)}
                  placeholder="lecturer@unilag.edu.ng"
                  required
                  className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-sm focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowLecturerModal(false)} className="h-10 rounded-xl px-4 text-xs font-semibold text-text-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="h-10 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white">
                  {submitting ? 'Assigning...' : 'Assign Lecturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Past Question / Material */}
      {showContentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-gold" />
                Upload Past Question / Material
              </h3>
              <button
                type="button"
                onClick={() => setShowContentModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadContent} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Select Document File(s) <span className="text-red-600 font-extrabold">* (Bulk multi-selection supported)</span>
                </label>

                <input
                  type="file"
                  id="admin-file-upload-input"
                  multiple
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      setSelectedFiles((prev) => [...prev, ...files]);
                      if (files.length === 1 && selectedFiles.length === 0 && !contentTitle) {
                        const nameWithoutExt = files[0].name.substring(0, files[0].name.lastIndexOf('.')) || files[0].name;
                        setContentTitle(nameWithoutExt);
                      }
                    }
                  }}
                  className="hidden"
                />

                {selectedFiles.length === 0 ? (
                  <label
                    htmlFor="admin-file-upload-input"
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-navy hover:bg-slate-100 rounded-xl p-5 cursor-pointer transition-colors"
                  >
                    <Upload className="h-7 w-7 text-brand-navy mb-2" />
                    <p className="text-xs font-bold text-slate-900">Click to browse & upload multiple files</p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      PDF, Word (.docx/.doc), PNG, JPG
                    </p>
                  </label>
                ) : (
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700">{selectedFiles.length} file(s) selected</span>
                      <label htmlFor="admin-file-upload-input" className="text-xs font-bold text-brand-navy hover:underline cursor-pointer">
                        + Add More
                      </label>
                    </div>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-brand-navy flex-shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate">{f.name}</p>
                              <p className="text-[10px] text-slate-500 font-semibold">
                                {(f.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedFiles.length <= 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Title</label>
                  <input
                    value={contentTitle}
                    onChange={(e) => setContentTitle(e.target.value)}
                    placeholder="e.g. CS301 2023 First Semester Exam"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Document Category</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  >
                    <option value="past_question">Past Question</option>
                    <option value="resource">Course Material / Doc</option>
                    <option value="slides">Lecture Slides</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Associated Course</label>
                  <select
                    value={contentCourseId}
                    onChange={(e) => setContentCourseId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  >
                    <option value="">General (All Courses)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Level (Optional)</label>
                  <select
                    value={contentLevel}
                    onChange={(e) => setContentLevel(e.target.value)}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-surface px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                  >
                    <option value="">-- Auto/General --</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                  </select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Pricing Model</span>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {isPaid ? `Paid Access (₦${price})` : 'Free Access for Students'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPaid(!isPaid)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isPaid ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isPaid ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-700">{isPaid ? 'Paid' : 'Free'}</span>
                  </div>
                </div>

                {isPaid && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-navy"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContentModal(false)}
                  className="h-10 rounded-xl px-4 text-xs font-semibold text-text-secondary hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 rounded-xl bg-brand-gold px-5 text-xs font-bold text-brand-navy hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Change Subscription Tier */}
      {showTierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-gold" />
                Change Subscription Tier
              </h3>
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Select a new subscription plan for <strong>{activeSchool.name}</strong>. Student capacity limits and platform feature access will update automatically.
            </p>

            <div className="space-y-3">
              {[
                { name: 'Free Plan', price: '₦0 / yr', cap: 'Max 10 Students', desc: 'Basic past question view & essential features' },
                { name: 'Premium Plan', price: '₦499,000 / yr', cap: 'Max 5,000 Students', desc: 'Full past question upload/download, lecturer management & analytics' },
                { name: 'Enterprise Plan', price: '₦1,499,000 / yr', cap: 'Max 100,000 Students', desc: 'Unlimited multi-campus hierarchy, custom API & dedicated support' },
              ].map((tier) => {
                const currentPlan = (activeSchool.plan || 'Free Plan').toLowerCase();
                const isCurrent = currentPlan.includes(tier.name.split(' ')[0].toLowerCase());
                const isSelected = selectedTierPlan === tier.name;

                return (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTierPlan(tier.name)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? 'border-brand-navy bg-brand-navy/5 ring-2 ring-brand-navy'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-brand-navy uppercase">{tier.name}</span>
                        {isCurrent && (
                          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{tier.price}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                      <span>{tier.desc}</span>
                      <span className="font-extrabold text-emerald-700">{tier.cap}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-5">
              <button
                type="button"
                onClick={() => setShowTierModal(false)}
                className="h-10 rounded-xl px-4 text-xs font-semibold text-text-secondary hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleChangeTier(selectedTierPlan)}
                className="h-10 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
              >
                {submitting ? 'Updating...' : `Confirm ${selectedTierPlan}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Add Campus Course */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[24px] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-brand-navy" />
                  Add Campus Course
                </h3>
                <p className="text-xs text-text-secondary">
                  Create or assign official curriculum courses for {activeSchool.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SearchableSelect
                  label="Faculty"
                  value={courseFacultyId}
                  onChange={handleCourseFacultyChange}
                  options={facultyOptions}
                  placeholder="All Faculties / Select Faculty..."
                  emptyText="No faculties found"
                />

                <SearchableSelect
                  label="Department"
                  required
                  value={courseDepartmentId}
                  onChange={handleCourseDepartmentChange}
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
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. LAW 301"
                    className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs text-text-primary outline-none focus:border-brand-navy focus:bg-white placeholder:text-text-muted font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Level *
                  </label>
                  <select
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
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
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
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
                    value={courseUnits}
                    onChange={(e) => setCourseUnits(e.target.value)}
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
                    value={courseSemester}
                    onChange={(e) => setCourseSemester(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-xs font-semibold text-text-primary outline-none focus:border-brand-navy focus:bg-white"
                  >
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </select>
                </div>
              </div>

              <div>
                <SearchableSelect
                  label="Assign Lecturer (Optional)"
                  options={lecturerCreationOptions}
                  value={courseLecturerId}
                  onChange={setCourseLecturerId}
                  placeholder="Search and select lecturer by name, email, or department..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 transition-all shadow-sm"
                >
                  {creatingCourse ? 'Creating...' : 'Create & Add Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Course Confirmation Modal */}
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
                  Are you sure you want to delete <span className="font-bold text-brand-navy">{deletingCourse.code}</span> ({deletingCourse.name})?
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
                    <span className="font-medium text-text-primary">{deletingCourse.level || '300'}L</span>
                  </div>
                </div>
                <p className="mt-2.5 text-[11px] text-red-500 font-medium">
                  This will remove the course curriculum, enrollments, and associated records for this campus.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCourse(null)}
                disabled={isDeletingCourse}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourse}
                disabled={isDeletingCourse}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm flex items-center gap-1.5"
              >
                {isDeletingCourse ? (
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
              Select which lecturers from <strong className="text-brand-navy">{school?.name}</strong> teach this course. Once assigned, this course will appear in their lecturer dashboard automatically.
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lecturers by name, email, or department..."
                  value={courseLecturerSearch}
                  onChange={(e) => setCourseLecturerSearch(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-surface py-2 pl-9 pr-3 text-xs outline-none focus:border-brand-navy"
                />
              </div>
              <span className="text-xs font-bold text-brand-navy whitespace-nowrap">
                {selectedCourseLecturerIds.length} Selected
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
                filteredAssignLecturers.map((lec: any) => {
                  const isChecked = selectedCourseLecturerIds.includes(lec.id);
                  return (
                    <div
                      key={lec.id}
                      onClick={() => toggleLecturerForCourse(lec.id)}
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
                disabled={savingCourseLecturers}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCourseLecturers}
                disabled={savingCourseLecturers}
                className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                {savingCourseLecturers ? (
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
