'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Scroll,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  Camera,
  GraduationCap,
  Save,
  ExternalLink,
  Sparkles,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE_LABEL = '10 MB';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year?: string;
  credentialUrl?: string;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  year?: string;
  fileUrl?: string;
}

interface LecturerProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  bio?: string;
  profileImageUrl?: string;
  school?: { id: string; name: string; acronym?: string };
  department?: { id: string; name: string; faculty?: { name: string } };
  taughtCourses?: { id: string; code: string; name: string; unit?: number }[];
  pastQuestionsCount?: number;
  materialsCount?: number;
  totalContentCount?: number;
  certifications?: Certification[];
  achievements?: Achievement[];
}

export default function LecturerProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LecturerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable Form State
  const [fullName, setFullName] = useState('');
  const [title, setTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Add Certification Modal State
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certYear, setCertYear] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certFileError, setCertFileError] = useState('');
  const [certUploading, setCertUploading] = useState(false);

  // Add Achievement Modal State
  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achYear, setAchYear] = useState('');
  const [achFile, setAchFile] = useState<File | null>(null);
  const [achFileError, setAchFileError] = useState('');
  const [achUploading, setAchUploading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApiRequest('/users/me');
      if (data && data.id) {
        setProfile(data);
        setFullName(data.fullName || '');
        setTitle(data.title || '');
        setPhoneNumber(data.phoneNumber || '');
        setBio(data.bio || '');
        setCertifications(Array.isArray(data.certifications) ? data.certifications : []);
        setAchievements(Array.isArray(data.achievements) ? data.achievements : []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load lecturer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await adminApiRequest('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: fullName.trim(),
          title: title.trim(),
          phoneNumber: phoneNumber.trim(),
          bio: bio.trim(),
          certifications,
          achievements,
        }),
      });

      if (updated && updated.id) {
        setProfile(updated);
      }
      setSuccess('Profile updated successfully! Changes are immediately visible to your School Admin.');
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCertFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCertFileError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        setCertFileError(`File size exceeds ${MAX_FILE_SIZE_LABEL} limit (${(selected.size / (1024 * 1024)).toFixed(1)} MB). Please choose a smaller file.`);
        setCertFile(null);
        return;
      }
      setCertFile(selected);
    }
  };

  const handleAddCertification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;

    setCertFileError('');
    let uploadedUrl: string | undefined = undefined;

    if (certFile) {
      if (certFile.size > MAX_FILE_SIZE_BYTES) {
        setCertFileError(`File size exceeds ${MAX_FILE_SIZE_LABEL} limit (${(certFile.size / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }
      setCertUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', certFile);
        const uploadRes = await adminApiRequest('/users/upload-document', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes && uploadRes.url) {
          uploadedUrl = uploadRes.url;
        }
      } catch (err: any) {
        setCertFileError(err?.message || 'Failed to upload certificate document.');
        setCertUploading(false);
        return;
      }
      setCertUploading(false);
    }

    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      issuer: certIssuer.trim(),
      year: certYear.trim() || undefined,
      credentialUrl: uploadedUrl,
    };

    setCertifications([...certifications, newCert]);
    setCertName('');
    setCertIssuer('');
    setCertYear('');
    setCertFile(null);
    setCertFileError('');
    setIsCertModalOpen(false);
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const handleAchFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAchFileError('');
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > MAX_FILE_SIZE_BYTES) {
        setAchFileError(`File size exceeds ${MAX_FILE_SIZE_LABEL} limit (${(selected.size / (1024 * 1024)).toFixed(1)} MB). Please choose a smaller file.`);
        setAchFile(null);
        return;
      }
      setAchFile(selected);
    }
  };

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;

    setAchFileError('');
    let uploadedUrl: string | undefined = undefined;

    if (achFile) {
      if (achFile.size > MAX_FILE_SIZE_BYTES) {
        setAchFileError(`File size exceeds ${MAX_FILE_SIZE_LABEL} limit (${(achFile.size / (1024 * 1024)).toFixed(1)} MB).`);
        return;
      }
      setAchUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', achFile);
        const uploadRes = await adminApiRequest('/users/upload-document', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes && uploadRes.url) {
          uploadedUrl = uploadRes.url;
        }
      } catch (err: any) {
        setAchFileError(err?.message || 'Failed to upload achievement proof document.');
        setAchUploading(false);
        return;
      }
      setAchUploading(false);
    }

    const newAch: Achievement = {
      id: `ach-${Date.now()}`,
      title: achTitle.trim(),
      description: achDesc.trim() || undefined,
      year: achYear.trim() || undefined,
      fileUrl: uploadedUrl,
    };

    setAchievements([...achievements, newAch]);
    setAchTitle('');
    setAchDesc('');
    setAchYear('');
    setAchFile(null);
    setAchFileError('');
    setIsAchModalOpen(false);
  };

  const handleRemoveAchievement = (id: string) => {
    setAchievements(achievements.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-gray-500">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading Lecturer Profile...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Lecturer Profile & Portfolio"
        subtitle="Manage your academic biography, credentials, certifications, and track your campus contributions."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProfile}
              disabled={loading || saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => handleSaveProfile()}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-xs font-bold text-white hover:bg-brand-navy/90 shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Profile'}
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

      {/* Profile Overview Card */}
      <div className="relative rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-brand-navy text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-md border-4 border-slate-50">
              {fullName ? fullName.slice(0, 2).toUpperCase() : 'LE'}
            </div>
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-brand-navy">
                {title ? `${title} ` : ''}
                {fullName || 'Lecturer'}
              </h2>
              <span className="rounded-full bg-brand-primary/10 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-primary">
                Faculty Academic
              </span>
            </div>

            <p className="text-xs text-gray-500 font-medium flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                {profile?.department?.name || 'Academic Department'} • {profile?.school?.name || 'Institution'}
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                {profile?.email}
              </span>
            </p>
          </div>
        </div>

        {/* Contribution Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                Course Materials
              </span>
              <span className="text-xl font-black text-brand-navy">
                {profile?.materialsCount || 0}{' '}
                <span className="text-xs text-gray-500 font-semibold">Uploaded</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                Past Questions
              </span>
              <span className="text-xl font-black text-brand-navy">
                {profile?.pastQuestionsCount || 0}{' '}
                <span className="text-xs text-gray-500 font-semibold">Shared</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 block">
                Assigned Courses
              </span>
              <span className="text-xl font-black text-brand-navy">
                {profile?.taughtCourses?.length || 0}{' '}
                <span className="text-xs text-gray-500 font-semibold">Active Classes</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* Personal & Academic Information */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="h-5 w-5 text-brand-primary" />
            <h3 className="text-base font-bold text-brand-navy">Academic & Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Academic Title / Prefix
              </label>
              <input
                type="text"
                placeholder="e.g. Dr., Prof., Engr."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-brand-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-brand-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-xs outline-none focus:border-brand-primary font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
              Biography & Academic Background
            </label>
            <textarea
              rows={4}
              placeholder="Tell students and school administrators about your academic journey, research specializations, and teaching expertise..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-gray-200 p-4 text-xs outline-none focus:border-brand-primary leading-relaxed"
            />
          </div>
        </div>

        {/* Certifications Section */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Scroll className="h-5 w-5 text-brand-primary" />
              <div>
                <h3 className="text-base font-bold text-brand-navy">Certifications & Professional Credentials</h3>
                <p className="text-xs text-gray-500">Add verified certificates, fellowships, and licensing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCertModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-navy/10 px-3.5 py-2 text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
              <Scroll className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">No certifications listed yet.</p>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                className="mt-3 text-xs font-bold text-brand-primary hover:underline"
              >
                + Add your first certification
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 hover:bg-white transition"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-brand-navy">{cert.name}</h4>
                    <p className="text-[11px] text-gray-500">
                      {cert.issuer} {cert.year ? `• ${cert.year}` : ''}
                    </p>
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-navy hover:underline pt-1"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-brand-primary" /> View Uploaded Certificate
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertification(cert.id)}
                    className="text-gray-400 hover:text-red-600 p-1 transition"
                    title="Remove certification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-brand-gold" />
              <div>
                <h3 className="text-base font-bold text-brand-navy">Achievements, Honors & Publications</h3>
                <p className="text-xs text-gray-500">Upload and showcase awards, grants, and research papers</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAchModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gold/20 px-3.5 py-2 text-xs font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Achievement
            </button>
          </div>

          {achievements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
              <Award className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-gray-500 font-medium">No achievements or honors listed yet.</p>
              <button
                type="button"
                onClick={() => setIsAchModalOpen(true)}
                className="mt-3 text-xs font-bold text-brand-primary hover:underline"
              >
                + Add your first academic achievement
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 hover:bg-white transition"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-brand-navy">{ach.title}</h4>
                      {ach.year && (
                        <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {ach.year}
                        </span>
                      )}
                    </div>
                    {ach.description && (
                      <p className="text-xs text-gray-600 leading-relaxed">{ach.description}</p>
                    )}
                    {ach.fileUrl && (
                      <a
                        href={ach.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-brand-navy hover:underline pt-1"
                      >
                        <Paperclip className="h-3.5 w-3.5 text-brand-gold" /> View Uploaded Document / Proof
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAchievement(ach.id)}
                    className="text-gray-400 hover:text-red-600 p-1 transition shrink-0"
                    title="Remove achievement"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Courses Reference */}
        {profile?.taughtCourses && profile.taughtCourses.length > 0 && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="h-5 w-5 text-brand-navy" />
              <h3 className="text-base font-bold text-brand-navy">Currently Assigned Courses</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {profile.taughtCourses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
                  <span className="inline-block rounded-md bg-brand-navy/10 px-2 py-0.5 text-[10px] font-extrabold text-brand-navy">
                    {course.code}
                  </span>
                  <h4 className="mt-1 text-xs font-bold text-slate-800">{course.name}</h4>
                  {course.unit && (
                    <span className="text-[11px] text-gray-500 mt-1 block">{course.unit} Units</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-navy px-8 text-xs font-bold text-white shadow-lg hover:bg-brand-navy/90 active:scale-[0.99] transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving Profile Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* Add Certification Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scroll className="h-5 w-5 text-brand-navy" />
                <h3 className="text-base font-bold text-brand-navy">Upload Professional Certification</h3>
              </div>
              <button onClick={() => setIsCertModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddCertification} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Certification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Data Scientist, COREN Licensure, AWS Solutions Architect"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Issuing Organization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IEEE, IBM, COREN, Coursera"
                    value={certIssuer}
                    onChange={(e) => setCertIssuer(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Year Acquired
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024"
                    value={certYear}
                    onChange={(e) => setCertYear(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Certificate File Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Upload Certificate Document
                  </label>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                    Max size: {MAX_FILE_SIZE_LABEL}
                  </span>
                </div>

                <div className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50/60 p-4 text-center hover:bg-slate-50 transition">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,.doc,.docx"
                    onChange={handleCertFileSelect}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {certFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                      <FileCheck className="h-5 w-5 text-emerald-600" />
                      <span>{certFile.name}</span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        ({(certFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="mx-auto h-7 w-7 text-gray-400" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click or drag & drop certificate file here
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Supports PDF, PNG, JPG, DOCX (Up to {MAX_FILE_SIZE_LABEL})
                      </p>
                    </div>
                  )}
                </div>

                {certFileError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{certFileError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={certUploading}
                  onClick={() => {
                    setIsCertModalOpen(false);
                    setCertFile(null);
                    setCertFileError('');
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certUploading}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {certUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Uploading Certificate...
                    </>
                  ) : (
                    'Add Certification'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {isAchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-brand-navy">Add Academic Achievement / Honor</h3>
              </div>
              <button onClick={() => setIsAchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddAchievement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Achievement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Best Researcher Award 2025, Keynote Speaker, Journal Publication"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Year / Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025"
                  value={achYear}
                  onChange={(e) => setAchYear(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Description / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the honor, project impact, or published research details..."
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              {/* Achievement Proof Upload Area */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Upload Proof / Award Document
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                    Max size: {MAX_FILE_SIZE_LABEL}
                  </span>
                </div>

                <div className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50/60 p-4 text-center hover:bg-slate-50 transition">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,.doc,.docx"
                    onChange={handleAchFileSelect}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  {achFile ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
                      <FileCheck className="h-5 w-5 text-emerald-600" />
                      <span>{achFile.name}</span>
                      <span className="text-[11px] text-gray-500 font-normal">
                        ({(achFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="mx-auto h-7 w-7 text-gray-400" />
                      <p className="text-xs font-semibold text-slate-700">
                        Click or drag & drop proof document here
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Supports PDF, PNG, JPG, DOCX (Up to {MAX_FILE_SIZE_LABEL})
                      </p>
                    </div>
                  )}
                </div>

                {achFileError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>{achFileError}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={achUploading}
                  onClick={() => {
                    setIsAchModalOpen(false);
                    setAchFile(null);
                    setAchFileError('');
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={achUploading}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {achUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Uploading Document...
                    </>
                  ) : (
                    'Add Achievement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
