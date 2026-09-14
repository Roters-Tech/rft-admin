'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Mail, ShieldAlert, GraduationCap, Filter, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { adminApiRequest } from '@/lib/apiClient';

interface Department {
  id: string;
  name: string;
}

interface Student {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  matricNumber?: string;
  status: string;
  department?: Department;
  createdAt: string;
}

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApiRequest('/admin/users?role=STUDENT');
      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch student directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApiRequest(`/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchStudents();
    } catch (err: any) {
      setError(err?.message || 'Failed to update student status');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.matricNumber && s.matricNumber.toLowerCase().includes(search.toLowerCase())) ||
      (s.department?.name && s.department.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Enrolled Student Directory"
        subtitle="View and manage active student enrolments across departments and levels."
        actions={
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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

      {/* Search & Counter Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, matric number, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2 text-xs outline-none focus:border-brand-primary"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">
          Total Enrolled: <strong className="text-brand-navy">{filteredStudents.length}</strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex py-12 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading Students...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Enrolled Students</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            When students register via the RFT Mobile App selecting your university, they will automatically appear in this directory.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-slate-100/50">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Matric / Reg No</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        {student.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{student.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-brand-primary">
                    {student.matricNumber || 'Pending'}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-600">
                    {student.department?.name || 'General Academic'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-800">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {student.email}
                      </div>
                      {student.phoneNumber && <div className="text-gray-400">{student.phoneNumber}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(student.id, student.status)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold text-xs transition ${
                        student.status === 'ACTIVE'
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {student.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
