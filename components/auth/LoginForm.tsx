'use client';

import { FormEvent, useEffect, useState } from 'react';
import { AtSign, Eye, EyeOff, LockKeyhole, User, School2, BookOpen, UserPlus, LogIn, KeyRound, ArrowLeft, RefreshCw, MapPin, Phone, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { User as UserType } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { adminApiRequest } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register' | 'register-school' | 'otp' | 'forgot' | 'reset'>('login');

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  // OTP states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  // Lecturer Registration states
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSchoolId, setRegSchoolId] = useState('');
  const [regDepartmentId, setRegDepartmentId] = useState('');
  const [regCourseInput, setRegCourseInput] = useState('');
  const [regSelectedCourseIds, setRegSelectedCourseIds] = useState<string[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [submittingReg, setSubmittingReg] = useState(false);

  // University Registration states
  const [schName, setSchName] = useState('');
  const [schAcronym, setSchAcronym] = useState('');
  const [schEmail, setSchEmail] = useState('');
  const [schPhone, setSchPhone] = useState('');
  const [schAddress, setSchAddress] = useState('');
  const [schAdminName, setSchAdminName] = useState('');
  const [schPassword, setSchPassword] = useState('');
  const [submittingSchoolReg, setSubmittingSchoolReg] = useState(false);

  // Forgot / Reset states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  const { login } = useAuth();
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
    if (!regSchoolId) {
      setDepartments([]);
      setRegDepartmentId('');
      return;
    }
    const endpoint = `/courses/public?schoolId=${regSchoolId}`;
    adminApiRequest(endpoint)
      .then((data) => {
        if (Array.isArray(data)) setAvailableCourses(data);
      })
      .catch((err) => console.warn('Failed to load public courses:', err));

    adminApiRequest(`/schools/public/${regSchoolId}/departments`)
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      })
      .catch((err) => console.warn('Failed to load departments for campus:', err));
  }, [regSchoolId]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const ok = await login(email, password);
      if (ok) return;
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('UNVERIFIED_EMAIL:')) {
        const unverifiedEmail = msg.split('UNVERIFIED_EMAIL:')[1];
        setOtpEmail(unverifiedEmail);
        setMode('otp');
        showToast('Email not verified. An OTP code has been sent to your email.', 'error');
        return;
      }
      showToast(msg || 'Login failed. Please check your credentials.', 'error');
    }
  };

  const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regPassword || !regSchoolId) {
      showToast('Please fill in all required registration fields', 'error');
      return;
    }

    setSubmittingReg(true);
    try {
      await adminApiRequest('/auth/register-lecturer', {
        method: 'POST',
        body: JSON.stringify({
          firstName: regFirstName,
          lastName: regLastName,
          email: regEmail,
          password: regPassword,
          schoolId: regSchoolId,
          departmentId: regDepartmentId || undefined,
          courseIds: regSelectedCourseIds.length > 0 ? regSelectedCourseIds : undefined,
          customCourse: regCourseInput || undefined,
        }),
      });

      setOtpEmail(regEmail);
      setMode('otp');
      showToast('Lecturer registered successfully! Please enter the OTP sent to your email.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Registration failed', 'error');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleSchoolRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!schName.trim() || !schEmail.trim() || !schAdminName.trim() || !schPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmittingSchoolReg(true);
    try {
      const res = await adminApiRequest('/auth/register-school', {
        method: 'POST',
        body: JSON.stringify({
          schoolName: schName.trim(),
          acronym: schAcronym.trim() || undefined,
          contactEmail: schEmail.trim().toLowerCase(),
          phone: schPhone.trim() || undefined,
          address: schAddress.trim() || undefined,
          adminName: schAdminName.trim(),
          password: schPassword,
        }),
      });

      const { accessToken, user } = res;
      if (accessToken) {
        const loggedUser: UserType = {
          id: user.id,
          email: user.email,
          name: user.fullName || user.email,
          title: user.fullName || user.email,
          school: user.school?.name || schName,
          schoolId: user.schoolId || user.school?.id,
          role: 'school_admin' as any,
          avatar: null,
          password: '',
        };
        window.localStorage.setItem('rft_admin_token', accessToken);
        window.localStorage.setItem('rft_user', JSON.stringify(loggedUser));
        document.cookie = `rft_token=${encodeURIComponent(accessToken)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_user=${encodeURIComponent(JSON.stringify(loggedUser))}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_role=school_admin; path=/; max-age=2592000; SameSite=Lax`;
      }

      showToast('University registered successfully! Redirecting to dashboard...', 'success');
      router.push('/dashboard/school');
    } catch (err: any) {
      showToast(err?.message || 'University registration failed', 'error');
    } finally {
      setSubmittingSchoolReg(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      showToast('Please enter the valid OTP code', 'error');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await adminApiRequest('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          email: otpEmail,
          otp: otpCode,
        }),
      });

      const { accessToken, user } = res;
      const loggedUser: UserType = {
        id: user.id,
        email: user.email,
        name: user.fullName || user.email,
        title: user.fullName || user.email,
        school: user.school?.name || 'Academic Faculty',
        schoolId: user.schoolId || user.school?.id,
        departmentId: user.departmentId || user.department?.id,
        department: user.department,
        role: (user.role || '').toLowerCase() as any,
        avatar: null,
        password: '',
      };

      if (accessToken) {
        window.localStorage.setItem('rft_admin_token', accessToken);
        window.localStorage.setItem('rft_user', JSON.stringify(loggedUser));
        document.cookie = `rft_token=${encodeURIComponent(accessToken)}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_user=${encodeURIComponent(JSON.stringify(loggedUser))}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `rft_role=${loggedUser.role}; path=/; max-age=2592000; SameSite=Lax`;
      }

      showToast('Email verified successfully! Accessing dashboard...', 'success');
      router.push(loggedUser.role === 'super_admin' ? '/dashboard/super' : loggedUser.role === 'school_admin' ? '/dashboard/school' : '/dashboard/lecturer');
    } catch (err: any) {
      showToast(err?.message || 'OTP verification failed', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpEmail) return;
    setResendingOtp(true);
    try {
      await adminApiRequest('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: otpEmail }),
      });
      showToast(`A new OTP has been dispatched to ${otpEmail}`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend OTP', 'error');
    } finally {
      setResendingOtp(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your registered email address', 'error');
      return;
    }

    setSubmittingForgot(true);
    try {
      await adminApiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      });
      showToast('Password reset OTP code sent to your email address!', 'success');
      setMode('reset');
    } catch (err: any) {
      showToast(err?.message || 'Failed to send password reset OTP', 'error');
    } finally {
      setSubmittingForgot(false);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resetOtp || !resetNewPassword) {
      showToast('Please enter the OTP code and new password', 'error');
      return;
    }

    setSubmittingReset(true);
    try {
      await adminApiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: forgotEmail,
          otp: resetOtp,
          newPassword: resetNewPassword,
        }),
      });

      showToast('Password reset successful! Please sign in with your new password.', 'success');
      setEmail(forgotEmail);
      setPassword(resetNewPassword);
      setMode('login');
    } catch (err: any) {
      showToast(err?.message || 'Password reset failed', 'error');
    } finally {
      setSubmittingReset(false);
    }
  };

  return (
    <div className="flex w-full max-w-[560px] flex-col justify-center px-2 py-8 md:px-6">
      {/* Tab Bar */}
      {(mode === 'login' || mode === 'register' || mode === 'register-school') && (
        <div className="mb-6 flex flex-col sm:flex-row gap-1.5 rounded-2xl bg-surface p-1.5 border border-gray-200">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
              mode === 'login' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setMode('register-school')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
              mode === 'register-school' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <School2 className="h-3.5 w-3.5 text-brand-primary" />
            University Reg.
          </button>

          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold transition-all ${
              mode === 'register' ? 'bg-white text-brand-navy shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Lecturer Reg.
          </button>
        </div>
      )}

      {/* Mode 1: Login */}
      {mode === 'login' && (
        <>
          <div className="mb-4 inline-flex items-center rounded-full bg-brand-gold-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-navy">
            School Management Portal
          </div>
          <div className="mb-8">
            <h1 className="font-display text-[32px] font-bold text-text-primary">Sign In</h1>
            <p className="mt-1.5 text-sm text-text-secondary">
              Access your institutional admin or lecturer dashboard.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Institutional Email
              </label>
              <div className="flex h-12 items-center rounded-lg border border-transparent bg-surface px-4 transition-all duration-200 ease-in-out focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
                <AtSign className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                  Security Key / Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-brand-navy hover:underline"
                  onClick={() => {
                    setForgotEmail(email);
                    setMode('forgot');
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex h-12 items-center rounded-lg border border-transparent bg-surface px-4 transition-all duration-200 ease-in-out focus-within:border-brand-navy focus-within:ring-2 focus-within:ring-brand-navy">
                <LockKeyhole className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-text-muted">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember((prev) => !prev)}
                className="h-4 w-4 rounded-[4px] border-gray-300 text-brand-navy focus:ring-2 focus:ring-brand-navy"
              />
              Keep me authenticated for 30 days
            </label>

            <button
              type="submit"
              className="flex h-14 w-full items-center justify-center rounded-lg bg-brand-navy text-base font-semibold text-white transition-all duration-200 ease-in-out hover:bg-brand-navy-deep focus:outline-none focus:ring-2 focus:ring-brand-navy"
            >
              Access Dashboard →
            </button>
          </form>
        </>
      )}

      {/* Mode 2: University Registration */}
      {mode === 'register-school' && (
        <>
          <div className="mb-4 inline-flex items-center rounded-full bg-brand-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-primary">
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            University Self-Registration
          </div>
          <div className="mb-6">
            <h1 className="font-display text-[28px] font-bold text-text-primary">Register Institution</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Onboard your University/College onto the RFT Academic Platform.
            </p>
          </div>

          <form onSubmit={handleSchoolRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Institution Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <Building2 className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={schName}
                  onChange={(e) => setSchName(e.target.value)}
                  placeholder="e.g. Covenant University"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Acronym / Code
                </label>
                <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                  <input
                    type="text"
                    value={schAcronym}
                    onChange={(e) => setSchAcronym(e.target.value)}
                    placeholder="CU"
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Contact Phone
                </label>
                <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                  <Phone className="mr-2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={schPhone}
                    onChange={(e) => setSchPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Admin Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <User className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  required
                  value={schAdminName}
                  onChange={(e) => setSchAdminName(e.target.value)}
                  placeholder="Prof. David Oye"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Admin Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <AtSign className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={schEmail}
                  onChange={(e) => setSchEmail(e.target.value)}
                  placeholder="admin@covenant.edu.ng"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <LockKeyhole className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={schPassword}
                  onChange={(e) => setSchPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingSchoolReg}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white transition-all hover:bg-brand-navy-deep disabled:opacity-50"
            >
              {submittingSchoolReg ? 'Registering University...' : 'Complete University Registration →'}
            </button>
          </form>
        </>
      )}

      {/* Mode 3: Lecturer Registration */}
      {mode === 'register' && (
        <>
          <div className="mb-4 inline-flex items-center rounded-full bg-brand-gold-light px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-navy">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            Lecturer Self-Registration
          </div>
          <div className="mb-6">
            <h1 className="font-display text-[28px] font-bold text-text-primary">Lecturer Account Sign Up</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Register your academic profile and select your campus institution.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                  <User className="mr-2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                  <User className="mr-2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Institutional Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <AtSign className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="lecturer@university.edu.ng"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Select Institution / Campus <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <School2 className="mr-2 h-4 w-4 text-text-muted" />
                <select
                  required
                  value={regSchoolId}
                  onChange={(e) => setRegSchoolId(e.target.value)}
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                >
                  <option value="">Choose campus...</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.acronym})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {regSchoolId && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                  Academic Department <span className="text-rose-500">*</span>
                </label>
                <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                  <BookOpen className="mr-2 h-4 w-4 text-text-muted" />
                  <select
                    value={regDepartmentId}
                    onChange={(e) => setRegDepartmentId(e.target.value)}
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
              <label className="block text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                Security Password <span className="text-rose-500">*</span>
              </label>
              <div className="mt-1 flex h-11 items-center rounded-xl border border-gray-200 bg-surface px-3 focus-within:border-brand-navy">
                <LockKeyhole className="mr-2 h-4 w-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-transparent text-sm text-text-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReg}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white transition-all hover:bg-brand-navy-deep disabled:opacity-50"
            >
              {submittingReg ? 'Creating Account...' : 'Complete Lecturer Registration →'}
            </button>
          </form>
        </>
      )}

      {/* OTP Verification Screen */}
      {mode === 'otp' && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>

          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <KeyRound className="h-3.5 w-3.5" />
              Email OTP Verification
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Verify Your Email Address</h1>
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
              We dispatched a 6-digit verification OTP code to <strong>{otpEmail}</strong>. Please enter the code below to activate your account.
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Enter 6-Digit OTP Code
              </label>
              <div className="mt-1.5 flex h-12 items-center rounded-xl border border-gray-200 bg-surface px-4 focus-within:border-brand-navy">
                <KeyRound className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-transparent text-lg font-mono tracking-widest font-bold text-brand-navy outline-none placeholder:text-text-muted placeholder:font-normal placeholder:tracking-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
            >
              {verifyingOtp ? 'Verifying OTP Code...' : 'Verify OTP & Activate Account →'}
            </button>
          </form>
        </div>
      )}

      {/* Forgot Password Screen */}
      {mode === 'forgot' && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>

          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Forgot Password?</h1>
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
              Enter your registered email address below. We will send a 6-digit OTP code to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                Registered Email Address
              </label>
              <div className="mt-1.5 flex h-12 items-center rounded-xl border border-gray-200 bg-surface px-4 focus-within:border-brand-navy">
                <AtSign className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="user@university.edu.ng"
                  className="w-full bg-transparent text-sm text-text-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingForgot}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
            >
              {submittingForgot ? 'Sending Reset OTP...' : 'Send Password Reset OTP →'}
            </button>
          </form>
        </div>
      )}

      {/* Reset Password Screen */}
      {mode === 'reset' && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </button>

          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary">Set New Password</h1>
            <p className="mt-1.5 text-xs text-text-secondary leading-relaxed">
              Enter the reset OTP sent to <strong>{forgotEmail}</strong> and specify your new password.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                6-Digit Reset OTP Code
              </label>
              <div className="mt-1.5 flex h-12 items-center rounded-xl border border-gray-200 bg-surface px-4 focus-within:border-brand-navy">
                <KeyRound className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full bg-transparent text-lg font-mono font-bold tracking-widest text-brand-navy outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                New Password
              </label>
              <div className="mt-1.5 flex h-12 items-center rounded-xl border border-gray-200 bg-surface px-4 focus-within:border-brand-navy">
                <LockKeyhole className="mr-3 h-4 w-4 text-text-muted" />
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-transparent text-sm text-text-primary outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingReset}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-navy text-sm font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
            >
              {submittingReset ? 'Updating Password...' : 'Reset Password & Sign In →'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
