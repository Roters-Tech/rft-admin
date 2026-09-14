'use client';

import { useEffect, useState } from 'react';
import { Building2, Layers, BookOpen } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';

export function FacultyTable({ schoolId }: { schoolId?: string }) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = schoolId ? `/admin/departments/school/${schoolId}` : '/admin/departments';
    adminApiRequest(endpoint)
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch((err) => console.warn('Failed to load live departments:', err))
      .finally(() => setLoading(false));
  }, [schoolId]);

  if (loading) {
    return <div className="py-6 text-center text-xs text-text-secondary">Loading institutional academic units...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
            <th className="sticky left-0 bg-white py-3 pr-4">Academic Unit / Department</th>
            <th className="px-4 py-3">Institution</th>
            <th className="px-4 py-3">Enrolled Students</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {departments.length > 0 ? (
            departments.map((dep) => (
              <tr key={dep.id} className="border-b border-gray-100 transition-all duration-200 ease-in-out hover:bg-brand-navy-light/40">
                <td className="sticky left-0 bg-white py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-navy/10 text-brand-navy">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{dep.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">
                  {dep.school?.name || dep.school?.acronym || 'Active Campus'}
                </td>
                <td className="px-4 py-4 text-sm text-text-primary font-semibold">
                  {dep.studentCount ?? 0} Enrolled Students
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-status-optimal-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-status-optimal">
                    Active
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr className="border-b border-gray-100 text-sm text-text-secondary">
              <td colSpan={4} className="py-6 text-center text-xs">
                No academic departments configured yet. Onboard a school or add departments from the School Directory.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
