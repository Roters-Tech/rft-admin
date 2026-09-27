'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Building2,
  BookOpen,
  RefreshCw,
  X,
  CheckCircle2,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { adminApiRequest } from '@/lib/apiClient';

interface Department {
  id: string;
  name: string;
  code?: string;
  facultyId: string;
}

interface Faculty {
  id: string;
  name: string;
  code?: string;
  deanName?: string;
  departments: Department[];
}

// Standard tertiary faculty presets
const STANDARD_FACULTIES = [
  'Faculty of Science',
  'Faculty of Engineering & Technology',
  'Faculty of Social Sciences',
  'Faculty of Arts & Humanities',
  'Faculty of Management & Business Studies',
  'Faculty of Law',
  'Faculty of Clinical Sciences',
  'Faculty of Basic Medical Sciences',
  'Faculty of Pharmacy',
  'Faculty of Environmental Sciences',
  'Faculty of Agriculture',
  'Faculty of Education',
  'Faculty of Dental Sciences',
  'Faculty of Veterinary Medicine',
  'Faculty of Communication & Information Sciences',
];

// Standard departments mapped by faculty keywords or global list
const STANDARD_DEPARTMENTS_BY_FACULTY: Record<string, string[]> = {
  science: [
    'Computer Science',
    'Software Engineering',
    'Cybersecurity',
    'Data Science',
    'Information Technology',
    'Mathematics',
    'Statistics',
    'Physics',
    'Chemistry',
    'Biochemistry',
    'Microbiology',
    'Biotechnology',
    'Geology',
    'Zoology',
    'Botany',
  ],
  engineering: [
    'Mechanical Engineering',
    'Electrical & Electronics Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Computer Engineering',
    'Petroleum & Gas Engineering',
    'Mechatronics Engineering',
    'Systems Engineering',
    'Agricultural & Bioresources Engineering',
    'Metallurgical & Materials Engineering',
  ],
  social: [
    'Economics',
    'Political Science',
    'Sociology',
    'Mass Communication',
    'Psychology',
    'Geography & Environmental Management',
    'Public Administration',
    'International Relations',
  ],
  management: [
    'Accounting',
    'Business Administration',
    'Banking & Finance',
    'Marketing',
    'Actuarial Science',
    'Industrial Relations & Personnel Management',
  ],
  arts: [
    'English & Literary Studies',
    'History & Strategic Studies',
    'Philosophy',
    'Religious Studies',
    'Linguistics & African Languages',
    'Theatre Arts & Film Studies',
    'Foreign Languages',
  ],
  law: [
    'Commercial & Industrial Law',
    'Public & International Law',
    'Private & Property Law',
    'Jurisprudence & Legal Theory',
  ],
  medicine: [
    'Medicine & Surgery',
    'Nursing Science',
    'Medical Laboratory Science',
    'Physiotherapy',
    'Human Anatomy',
    'Human Physiology',
    'Public Health',
  ],
  environmental: [
    'Architecture',
    'Building Technology',
    'Estate Management',
    'Quantity Surveying',
    'Urban & Regional Planning',
  ],
  education: [
    'Educational Management',
    'Science Education',
    'Arts & Social Sciences Education',
    'Guidance & Counselling',
    'Educational Foundations',
  ],
  agriculture: [
    'Agricultural Economics',
    'Animal Science',
    'Crop Protection & Horticulture',
    'Soil Science & Land Resources',
    'Fisheries & Aquaculture',
    'Forestry & Wildlife Management',
  ],
};

const ALL_COMMON_DEPARTMENTS = Array.from(
  new Set(Object.values(STANDARD_DEPARTMENTS_BY_FACULTY).flat())
);

export default function SchoolFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Page-level search query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  // Form states
  const [facultyName, setFacultyName] = useState('');
  const [deanName, setDeanName] = useState('');
  const [deptName, setDeptName] = useState('');
  const [facultyModalError, setFacultyModalError] = useState('');
  const [deptModalError, setDeptModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFaculties = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApiRequest('/admin/faculties');
      if (Array.isArray(data)) {
        setFaculties(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch faculties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  // Compute departmental options tailored to the currently selected faculty
  const currentDepartmentOptions = useMemo(() => {
    if (!selectedFacultyId) return ALL_COMMON_DEPARTMENTS;
    const targetFac = faculties.find((f) => f.id === selectedFacultyId);
    if (!targetFac) return ALL_COMMON_DEPARTMENTS;

    const lowerFacName = targetFac.name.toLowerCase();
    for (const [key, depts] of Object.entries(STANDARD_DEPARTMENTS_BY_FACULTY)) {
      if (lowerFacName.includes(key)) {
        return depts;
      }
    }
    return ALL_COMMON_DEPARTMENTS;
  }, [selectedFacultyId, faculties]);

  // Filter faculties and departments based on page-level search query
  const filteredFaculties = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return faculties;

    return faculties
      .map((fac) => {
        const matchFaculty =
          fac.name.toLowerCase().includes(q) ||
          fac.deanName?.toLowerCase().includes(q);

        const matchingDepts = (fac.departments || []).filter((dept) =>
          dept.name.toLowerCase().includes(q)
        );

        if (matchFaculty) {
          return fac; // Show all departments if the faculty itself matches
        }

        if (matchingDepts.length > 0) {
          return {
            ...fac,
            departments: matchingDepts,
          };
        }

        return null;
      })
      .filter((fac): fac is Faculty => fac !== null);
  }, [faculties, searchQuery]);

  const totalDepartmentsCount = useMemo(() => {
    return faculties.reduce((acc, fac) => acc + (fac.departments?.length || 0), 0);
  }, [faculties]);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = facultyName.trim();
    if (!trimmed) {
      setFacultyModalError('Please enter or select a faculty name.');
      return;
    }

    // Check for duplicate faculty name
    const exists = faculties.some(
      (f) => f.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setFacultyModalError(`A faculty named "${trimmed}" already exists in your institution.`);
      return;
    }

    setSubmitting(true);
    setFacultyModalError('');
    setError('');
    try {
      await adminApiRequest('/admin/faculties', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, deanName: deanName.trim() || undefined }),
      });
      setSuccess(`Faculty "${trimmed}" created successfully!`);
      setFacultyName('');
      setDeanName('');
      setFacultyModalError('');
      setIsFacultyModalOpen(false);
      fetchFaculties();
    } catch (err: any) {
      setFacultyModalError(err?.message || 'Failed to create faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = deptName.trim();
    if (!trimmed || !selectedFacultyId) {
      setDeptModalError('Please enter or select a department name.');
      return;
    }

    // Check for duplicate department name under this faculty
    const targetFac = faculties.find((f) => f.id === selectedFacultyId);
    const deptExists = targetFac?.departments?.some(
      (d) => d.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (deptExists) {
      setDeptModalError(`Department "${trimmed}" already exists under ${targetFac?.name || 'this faculty'}.`);
      return;
    }

    setSubmitting(true);
    setDeptModalError('');
    setError('');
    try {
      await adminApiRequest('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed, facultyId: selectedFacultyId }),
      });
      setSuccess(`Department "${trimmed}" added successfully!`);
      setDeptName('');
      setDeptModalError('');
      setIsDeptModalOpen(false);
      fetchFaculties();
    } catch (err: any) {
      setDeptModalError(err?.message || 'Failed to add department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and all associated departments?`)) return;
    try {
      await adminApiRequest(`/admin/faculties/${id}`, { method: 'DELETE' });
      setSuccess(`Faculty "${name}" deleted.`);
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete faculty');
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the department "${name}"?`)) return;
    try {
      await adminApiRequest(`/admin/departments/${id}`, { method: 'DELETE' });
      setSuccess(`Department "${name}" deleted.`);
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete department');
    }
  };

  const selectedFaculty = faculties.find((f) => f.id === selectedFacultyId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty & Department Management"
        subtitle="Configure tertiary faculties, deans, and academic departments for your campus."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFaculties}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-semibold text-text-secondary hover:bg-surface shadow-xs transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => {
                setFacultyName('');
                setDeanName('');
                setIsFacultyModalOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy/90 shadow-md transition"
            >
              <Plus className="h-4 w-4" />
              Add Faculty
            </button>
          </div>
        }
      />

      {/* Alerts */}
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 border border-red-100 text-xs sm:text-sm text-red-700 flex items-center justify-between animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-xs sm:text-sm text-emerald-700 flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            {success}
          </span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculties, deans, or departments..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-8 text-xs text-text-primary placeholder:text-gray-400 focus:bg-white focus:border-brand-navy focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-text-secondary font-medium shrink-0">
          <span className="rounded-lg bg-surface px-3 py-1.5 border border-gray-100">
            <strong>{faculties.length}</strong> Faculties
          </span>
          <span className="rounded-lg bg-surface px-3 py-1.5 border border-gray-100">
            <strong>{totalDepartmentsCount}</strong> Departments
          </span>
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <div className="flex py-16 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2 text-brand-navy" />
          Loading Faculties & Departments...
        </div>
      ) : faculties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Faculties Created Yet</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Create academic faculties (e.g. Faculty of Science) and add departments to structure your university&apos;s academic catalog.
          </p>
          <button
            onClick={() => {
              setFacultyName('');
              setDeanName('');
              setIsFacultyModalOpen(true);
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-navy/90"
          >
            <Plus className="h-4 w-4" />
            Add First Faculty
          </button>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-text-primary">No results found for &ldquo;{searchQuery}&rdquo;</h3>
          <p className="mt-1 text-xs text-gray-500">Try searching for a different faculty name, department, or dean.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface shadow-xs"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredFaculties.map((fac) => (
            <div
              key={fac.id}
              className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-slate-100/50 flex flex-col justify-between transition-all hover:border-gray-200"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-navy/5 text-brand-navy shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-navy leading-snug">{fac.name}</h3>
                      {fac.deanName ? (
                        <p className="mt-1 text-xs text-text-secondary flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                          Dean: <span className="font-semibold text-text-primary">{fac.deanName}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-gray-400 italic">No Dean assigned</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFaculty(fac.id, fac.name)}
                    title="Delete Faculty"
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Departments Section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      Departments ({fac.departments?.length || 0})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFacultyId(fac.id);
                        setDeptName('');
                        setIsDeptModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy hover:text-brand-navy/80 bg-brand-navy/5 hover:bg-brand-navy/10 px-2.5 py-1 rounded-lg transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Dept
                    </button>
                  </div>

                  {fac.departments && fac.departments.length > 0 ? (
                    <div className="space-y-2">
                      {fac.departments.map((dept) => (
                        <div
                          key={dept.id}
                          className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 text-xs border border-gray-100 hover:border-gray-200 transition"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <BookOpen className="h-3.5 w-3.5 text-brand-navy/70 shrink-0" />
                            <span className="font-semibold text-text-primary truncate">{dept.name}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            title="Delete Department"
                            className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 py-5 text-center text-xs text-gray-400 bg-gray-50/50">
                      No departments added yet under this faculty.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                  <Building2 className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-brand-navy">Create New Faculty</h3>
              </div>
              <button
                onClick={() => {
                  setIsFacultyModalOpen(false);
                  setFacultyModalError('');
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="mt-4 space-y-4">
              {/* Duplicate or validation error banner */}
              {facultyModalError && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">Faculty Already Exists</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{facultyModalError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFacultyModalError('')}
                    className="text-amber-500 hover:text-amber-700 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Searchable Combobox for Faculty Name */}
              <div>
                <SearchableCombobox
                  label="Faculty Name"
                  required
                  placeholder="Select standard faculty or type custom name..."
                  value={facultyName}
                  onChange={(val) => {
                    setFacultyName(val);
                    if (facultyModalError) setFacultyModalError('');
                  }}
                  options={STANDARD_FACULTIES}
                  customPromptText="Create custom faculty"
                  emptyText="No standard faculty matched. You can type any custom name."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
                  Dean / Faculty Lead (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Adebayo Ogunlesi"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsFacultyModalOpen(false);
                    setFacultyModalError('');
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !facultyName.trim()}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50 shadow-md transition"
                >
                  {submitting ? 'Creating...' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-navy">Add Department</h3>
                  {selectedFaculty && (
                    <p className="text-[11px] text-text-secondary">
                      To: <span className="font-semibold text-brand-navy">{selectedFaculty.name}</span>
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDeptModalOpen(false);
                  setDeptModalError('');
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="mt-4 space-y-4">
              {/* Duplicate or validation error banner */}
              {deptModalError && (
                <div className="rounded-xl bg-amber-50 p-3 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">Department Already Exists</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">{deptModalError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeptModalError('')}
                    className="text-amber-500 hover:text-amber-700 p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Searchable Combobox for Department Name */}
              <div>
                <SearchableCombobox
                  label="Department Name"
                  required
                  placeholder="Select standard department or type custom name..."
                  value={deptName}
                  onChange={(val) => {
                    setDeptName(val);
                    if (deptModalError) setDeptModalError('');
                  }}
                  options={currentDepartmentOptions}
                  customPromptText="Create custom department"
                  emptyText="No standard department matched. You can type any custom department name."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeptModalOpen(false);
                    setDeptModalError('');
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !deptName.trim()}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50 shadow-md transition"
                >
                  {submitting ? 'Adding...' : 'Add Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
