'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Building2, BookOpen, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
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

export default function SchoolFacultiesPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  // Form states
  const [facultyName, setFacultyName] = useState('');
  const [deanName, setDeanName] = useState('');
  const [deptName, setDeptName] = useState('');
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

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultyName.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      await adminApiRequest('/admin/faculties', {
        method: 'POST',
        body: JSON.stringify({ name: facultyName.trim(), deanName: deanName.trim() || undefined }),
      });
      setSuccess('Faculty created successfully!');
      setFacultyName('');
      setDeanName('');
      setIsFacultyModalOpen(false);
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to create faculty');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !selectedFacultyId) return;

    setSubmitting(true);
    setError('');
    try {
      await adminApiRequest('/admin/departments', {
        method: 'POST',
        body: JSON.stringify({ name: deptName.trim(), facultyId: selectedFacultyId }),
      });
      setSuccess('Department added successfully!');
      setDeptName('');
      setIsDeptModalOpen(false);
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to add department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty and its departments?')) return;
    try {
      await adminApiRequest(`/admin/faculties/${id}`, { method: 'DELETE' });
      setSuccess('Faculty deleted.');
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete faculty');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await adminApiRequest(`/admin/departments/${id}`, { method: 'DELETE' });
      setSuccess('Department deleted.');
      fetchFaculties();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete department');
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faculty & Department Management"
        subtitle="Manage academic faculties, deans, and departments for your institution."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchFaculties}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsFacultyModalOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy/90 shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Faculty
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

      {loading ? (
        <div className="flex py-12 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading Faculties...
        </div>
      ) : faculties.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Faculties Created Yet</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Create faculties (e.g. Faculty of Science) and add departments to structure your university's academic catalog.
          </p>
          <button
            onClick={() => setIsFacultyModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-navy/90"
          >
            <Plus className="h-4 w-4" />
            Add First Faculty
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {faculties.map((fac) => (
            <div key={fac.id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-slate-100/50">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-brand-primary" />
                    <h3 className="text-base font-bold text-brand-navy">{fac.name}</h3>
                  </div>
                  {fac.deanName && (
                    <p className="mt-1 text-xs text-gray-500">
                      Dean: <span className="font-medium text-gray-700">{fac.deanName}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteFaculty(fac.id)}
                  title="Delete Faculty"
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Departments ({fac.departments?.length || 0})
                  </span>
                  <button
                    onClick={() => {
                      setSelectedFacultyId(fac.id);
                      setIsDeptModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Dept
                  </button>
                </div>

                {fac.departments && fac.departments.length > 0 ? (
                  <div className="space-y-2">
                    {fac.departments.map((dept) => (
                      <div
                        key={dept.id}
                        className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5 text-xs border border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium text-gray-800">{dept.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 py-4 text-center text-xs text-gray-400">
                    No departments under this faculty yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Faculty Modal */}
      {isFacultyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-navy">Create New Faculty</h3>
              <button onClick={() => setIsFacultyModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faculty of Science"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Dean / Head Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Adebayo Ogunlesi"
                  value={deanName}
                  onChange={(e) => setDeanName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFacultyModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Save Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-navy">Add Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50"
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
