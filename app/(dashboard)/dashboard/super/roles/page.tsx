'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, Search, Shield, UserPlus2, RefreshCw } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

export default function SuperRolesPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('SCHOOL_ADMIN');
  const [schoolId, setSchoolId] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, schoolsData] = await Promise.all([
        adminApiRequest('/admin/users').catch(() => null),
        adminApiRequest('/admin/schools').catch(() => null),
      ]);

      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(schoolsData)) setSchools(schoolsData);
    } catch (err) {
      console.warn('Backend roles query error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      showToast('Please enter full name and email', 'error');
      return;
    }

    setCreating(true);
    try {
      await adminApiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password: 'TemporaryPass123!',
          role,
          schoolId: schoolId || undefined,
        }),
      });

      showToast(`Created ${fullName} with role ${role}!`, 'success');
      setFullName('');
      setEmail('');
      setPhone('');
      fetchData();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create user role', 'error');
    } finally {
      setCreating(false);
    }
  };

  const rawUsers = users || [];
  const displayUsers = rawUsers.filter((u: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = (u.fullName || u.name || '').toLowerCase();
    const em = (u.email || '').toLowerCase();
    return name.includes(q) || em.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[#ebeefd] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,30,90,0.05)]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              Administration • Role Management
            </div>
            <h1 className="mt-3 font-display text-[34px] font-bold tracking-[-0.03em] text-brand-navy">
              Access Authority & Role Assignments
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Provision administrative and academic accounts across institutions with real-time backend synchronization.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.2fr]">
          <form onSubmit={handleCreateUser} className="rounded-[24px] bg-brand-navy p-5 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <UserPlus2 className="h-4 w-4" />
              Create New Account / Role
            </div>
            <p className="mt-2 text-xs text-white/70">
              Directly assign roles to specific school containers.
            </p>
            <div className="mt-5 space-y-3">
              <label className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Full Name</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Julian Thorne"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jthorne@unilag.edu.ng"
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">Phone</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 801 000 0000"
                  className="h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">System Role</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full mt-1 flex h-11 items-center justify-between rounded-xl border border-white/10 bg-[#1e2d5a] px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="SCHOOL_ADMIN">School Admin</option>
                    <option value="LECTURER">Lecturer</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">School</span>
                  <select
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    className="w-full mt-1 flex h-11 items-center justify-between rounded-xl border border-white/10 bg-[#1e2d5a] px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="">Select School...</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gold text-sm font-bold text-brand-navy hover:bg-brand-gold-light transition-all disabled:opacity-50"
            >
              <Shield className="h-4 w-4" />
              {creating ? 'Authorizing...' : 'Authorize & Create Account'}
            </button>
          </form>

          <div className="rounded-[24px] border border-[#eef1fb] bg-[#fbfcff] p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex h-11 flex-1 items-center rounded-xl border border-[#edf0fb] bg-white px-4">
                <Search className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search directory by name, email..."
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                    <th className="px-3 py-3">Name & Identity</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Assigned School</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((item: any, index: number) => (
                    <tr
                      key={item.id || item.email || index}
                      className={`text-sm ${index !== 0 ? "border-t border-[#edf0fb]" : ""}`}
                    >
                      <td className="px-3 py-4">
                        <p className="font-semibold text-brand-navy">
                          {item.fullName || item.name}
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          {item.email}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-md bg-[#eef2ff] px-2 py-1 text-[10px] font-semibold text-brand-navy uppercase">
                          {item.role}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-text-secondary">
                        {item.school?.name || item.school || 'Platform Central'}
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-status-optimal-bg px-3 py-1 text-[10px] font-semibold text-status-optimal uppercase">
                          {item.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-[10px] text-text-muted">
              Showing {displayUsers.length} active platform user accounts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
