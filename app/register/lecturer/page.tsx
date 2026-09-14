'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { AtSign, LockKeyhole, User, School2, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';
import { useRouter } from 'next/navigation';

export default function LecturerRegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    adminApiRequest('/schools/public')
      .then((data) => {
        if (Array.isArray(data)) setSchools(data);
      })
      .catch((err) => console.warn('Failed to load public schools:', err));
  }, []);

  useEffect(() => {
    if (!schoolId) {
      setDepartments([]);
      setDepartmentId('');
      return;
    }
    const endpoint = `/courses/public?schoolId=${schoolId}`;
    adminApiRequest(endpoint)
      .then((data) => {
        if (Array.isArray(data)) setAvailableCourses(data);
      })
      .catch((err) => console.warn('Failed to load public courses:', err));

    adminApiRequest(`/schools/public/${schoolId}/departments`)
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch((err) => console.warn('Failed to load departments for campus:', err));
  }, [schoolId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !schoolId || !departmentId) {
      showToast('Please fill in all required fields (First Name, Last Name, Email, School, Department, Password)', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await adminApiRequest('/auth/register-lecturer', {
        method: 'POST',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          schoolId,
          departmentId: departmentId || undefined,
          courseIds: selectedCourseIds.length > 0 ? selectedCourseIds : undefined,
          customCourse: courseInput || undefined,
        }),
      });

      const { accessToken, user } = res;
      if (accessToken) {
        window.localStorage.setItem('rft_admin_token', accessToken);
        window.localStorage.setItem('rft_user', JSON.stringify(user));
        document.cookie = `rft_token=${encodeURIComponent(accessToken)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_role=lecturer; path=/; max-age=2592000; SameSite=Lax`;
      }

      showToast(`Welcome ${user?.fullName || firstName}! Account created successfully.`, 'success');
      router.push('/dashboard/lecturer');
    } catch (err: any) {
      showToast(err?.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff] p-4">
      <div className="w-full max-w-[580px] rounded-3xl bg-white p-6 md:p-8 shadow-card border border-gray-100">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-gold-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-navy">
          <BookOpen className="h-3.5 w-3.5 text-brand-navy" />
          Lecturer Self-Registration
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">Create Lecturer Account</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Register your academic profile, select your institution, and access your course dashboard.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                First Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
                <User className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Stella"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
                <User className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Obua"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Institutional Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
              <AtSign className="mr-2 h-4 w-4 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. lecturer@university.edu.ng"
                className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Select Institution / School <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
              <School2 className="mr-2 h-4 w-4 text-text-muted" />
              <select
                required
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
              >
                <option value="">Choose registered campus...</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.acronym})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {schoolId && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Select Academic Department <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
                <BookOpen className="mr-2 h-4 w-4 text-text-muted" />
                <select
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                >
                  <option value="">Select department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
              Select Teaching Courses (Optional)
            </label>
            <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-200 p-3 space-y-2 bg-surface">
              {availableCourses.length > 0 ? (
                availableCourses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer">
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
                    <span>{c.code}: {c.name || c.title}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-text-muted">Loading available campus courses...</p>
              )}
            </div>

            <div className="mt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
                Or Add Custom Course Name / Code
              </label>
              <input
                type="text"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                placeholder="e.g. CSC 401 - Hardware Architecture"
                className="w-full h-11 rounded-xl border border-gray-200 bg-surface px-3 text-sm text-text-primary outline-none focus:border-brand-navy placeholder:text-text-muted"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
              Security Password <span className="text-rose-500">*</span>
            </label>
            <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
              <LockKeyhole className="mr-2 h-4 w-4 text-text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white transition-all hover:bg-brand-navy-deep disabled:opacity-50"
          >
            {submitting ? 'Creating Lecturer Account...' : 'Complete Lecturer Registration →'}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-text-secondary">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-brand-navy hover:underline">
              Sign In Here →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
