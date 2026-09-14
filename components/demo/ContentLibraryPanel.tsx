'use client';

import { useEffect, useState, useRef } from 'react';
import { Download, Upload, Plus, FileText, X, CheckCircle2, AlertCircle, DollarSign, Settings, Trash2 } from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';

export function ContentLibraryPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRole = (user as any)?.role?.toUpperCase() || '';
  const isLecturer = userRole === 'LECTURER' || userRole === 'TEACHER';

  const [contentList, setContentList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'past_question' | 'resource' | 'slides'>('past_question');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[] | null>(null);

  // Global settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [courseMaterialPrice, setCourseMaterialPrice] = useState(500);
  const [pastQuestionPrice, setPastQuestionPrice] = useState(500);
  const [slidePrice, setSlidePrice] = useState(500);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchContentAndCourses = async () => {
    setLoading(true);
    try {
      const contentEndpoint = isLecturer 
        ? `/content?uploaderId=${user?.id}` 
        : (user?.schoolId ? `/content?schoolId=${user.schoolId}` : '/content');
        
      const coursesEndpoint = isLecturer 
        ? `/courses?lecturerId=${user?.id}` 
        : (user?.schoolId ? `/courses?schoolId=${user.schoolId}` : '/courses');

      const [contentData, coursesData] = await Promise.all([
        adminApiRequest(contentEndpoint).catch(() => []),
        adminApiRequest(coursesEndpoint).catch(() => []),
      ]);

      if (Array.isArray(contentData)) setContentList(contentData);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        // Do not default to the first course, let user explicitly select or fallback to General
      }
    } catch (err) {
      console.warn('Failed to load content library:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const data = await adminApiRequest('/admin/settings/pricing');
      if (data?.courseMaterialPrice !== undefined) setCourseMaterialPrice(data.courseMaterialPrice);
      if (data?.pastQuestionPrice !== undefined) setPastQuestionPrice(data.pastQuestionPrice);
      if (data?.slidePrice !== undefined) setSlidePrice(data.slidePrice);
    } catch (err) {
      console.warn('Failed to load global pricing settings:', err);
    }
  };

  useEffect(() => {
    fetchContentAndCourses();
    fetchGlobalSettings();
  }, [user?.id]);

  const isAllowedFile = (file: File) => {
    const name = file.name.toLowerCase();
    const t = file.type.toLowerCase();
    return (
      name.endsWith('.pdf') ||
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      t === 'application/pdf' ||
      t.includes('wordprocessingml') ||
      t.includes('msword') ||
      t.includes('image/png') ||
      t.includes('image/jpeg')
    );
  };

  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const invalidTypeFiles = filesArray.filter((f) => !isAllowedFile(f));
    if (invalidTypeFiles.length > 0) {
      showToast(
        `Rejected ${invalidTypeFiles.length} file(s). Only PDF, DOCX, PNG, JPG, and JPEG files are allowed.`,
        'error'
      );
    }

    const oversizedFiles = filesArray.filter((f) => isAllowedFile(f) && f.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      showToast(
        `Rejected ${oversizedFiles.length} file(s) exceeding 50 MB limit: ${oversizedFiles.map((f) => f.name).join(', ')}`,
        'error'
      );
    }

    const emptyFiles = filesArray.filter((f) => isAllowedFile(f) && f.size === 0);
    if (emptyFiles.length > 0) {
      showToast(`Rejected ${emptyFiles.length} empty file(s) (0 KB).`, 'error');
    }

    const validFiles = filesArray.filter(
      (f) => isAllowedFile(f) && f.size > 0 && f.size <= MAX_FILE_SIZE_BYTES
    );
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    if (validFiles.length > 0 && !title) {
      setTitle(validFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Please select at least one valid file (PDF, DOCX, PNG, JPG, JPEG) to upload', 'error');
      return;
    }

    setSubmitting(true);
    setUploadResults(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const items = selectedFiles.map((file) => ({
        title: selectedFiles.length === 1 ? title || file.name.replace(/\.[^/.]+$/, '') : file.name.replace(/\.[^/.]+$/, ''),
        type,
        courseId: selectedCourseId || undefined,
        level: selectedLevel || undefined,
        schoolId: user?.schoolId || undefined,
        isPaid: isPaid,
      }));

      formData.append('items', JSON.stringify(items));

      const response = await adminApiRequest('/admin/content/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (response?.results) {
        setUploadResults(response.results);
        showToast(`Bulk upload finished: ${response.successCount} succeeded, ${response.failureCount} failed`, response.failureCount === 0 ? 'success' : 'error');
        fetchContentAndCourses();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to upload files', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePricing = async (id: string, currentPaid: boolean) => {
    // Optimistic UI update
    setContentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPaid: !currentPaid } : item))
    );

    try {
      await adminApiRequest(`/admin/content/${id}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify({ isPaid: !currentPaid }),
      });
      showToast(`Resource updated to ${!currentPaid ? 'Paid' : 'Free'}`, 'success');
    } catch (err: any) {
      // Revert optimistic update on failure
      setContentList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isPaid: currentPaid } : item))
      );
      showToast(err?.message || 'Failed to update pricing status', 'error');
    }
  };

  const executeDeleteContent = async (id: string, itemTitle: string) => {
    setDeletingId(id);
    try {
      await adminApiRequest(`/admin/content/${id}`, {
        method: 'DELETE',
      });
      showToast(`"${itemTitle}" deleted successfully`, 'success');
      setContentList((prev) => prev.filter((item) => item.id !== id));
      setDeleteConfirmItem(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete resource', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveGlobalPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await adminApiRequest('/admin/settings/pricing', {
        method: 'PATCH',
        body: JSON.stringify({
          courseMaterialPrice: Number(courseMaterialPrice),
          pastQuestionPrice: Number(pastQuestionPrice),
          slidePrice: Number(slidePrice),
        }),
      });
      showToast('Global pricing settings saved successfully!', 'success');
      setShowSettingsModal(false);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save pricing settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const getSafeDownloadUrl = (url?: string) => {
    if (!url) return 'http://localhost:3006/uploads/sample_past_question.pdf';
    if (url.includes('supabase.co')) {
      const filename = url.split('/').pop() || 'sample_past_question.pdf';
      return `http://localhost:3006/uploads/${filename}`;
    }
    return url;
  };

  return (
    <Panel
      title="Content Library & Past Questions"
      subtitle="Institutional past exam papers, lecture notes, course packs, and study guides for your students."
      action={
        <div className="flex items-center gap-2">
          {!isLecturer && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all"
            >
              <Settings className="h-4 w-4" />
              Global Pricing
            </button>
          )}
          <button
            onClick={() => {
              setShowUploadModal(true);
              setUploadResults(null);
              setSelectedFiles([]);
              setTitle('');
              setSelectedLevel('');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-card"
          >
            <Plus className="h-4 w-4" />
            + Upload Content / Material(s)
          </button>
        </div>
      }
    >
      {/* Content Table */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400">Loading resources...</div>
      ) : contentList.length === 0 ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400">No course materials, slides, or past questions uploaded yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Resource Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Course</th>
                <th className="px-4 py-3.5">Uploader</th>
                <th className="px-4 py-3.5">Pricing Status (Free / Paid)</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {contentList.map((item) => {
                const itemPriceDefault = item.type === 'slides' ? slidePrice : (item.type === 'past_question' ? pastQuestionPrice : courseMaterialPrice);
                return (
                  <tr key={item.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-brand-navy dark:text-sky-400 flex-shrink-0" />
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm max-w-sm break-words leading-snug">
                          {item.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-extrabold border ${
                          item.type === 'slides'
                            ? 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200'
                            : item.type === 'past_question'
                            ? 'bg-purple-100 text-purple-950 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200'
                        }`}
                      >
                        {item.type === 'slides' ? 'Lecture Slides' : item.type === 'past_question' ? 'Past Question' : 'Course Material'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 text-xs">{item.course?.code || 'General'}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 text-xs">{item.uploader?.fullName || 'Admin'}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold border ${
                            item.isPaid
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200'
                              : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.isPaid ? `Paid (₦${item.price || itemPriceDefault})` : 'Free'}
                        </span>
                        {!isLecturer && (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.isPaid}
                            onClick={() => handleTogglePricing(item.id, item.isPaid)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                              item.isPaid ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                            }`}
                            title={item.isPaid ? 'Click to set as Free' : 'Click to set as Paid'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                item.isPaid ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {item.downloadUrl && (
                          <a
                            href={getSafeDownloadUrl(item.downloadUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-navy dark:text-sky-400 hover:underline"
                          >
                            <Download className="h-3.5 w-3.5" />
                            View File
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1 rounded-lg p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50"
                          title="Delete resource"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal (Yes / No) */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6 shadow-2xl border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-extrabold text-slate-900 dark:text-white underline">{deleteConfirmItem.title}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                No, Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmItem.id}
                onClick={() => executeDeleteContent(deleteConfirmItem.id, deleteConfirmItem.title)}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-extrabold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId === deleteConfirmItem.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-navy" />
                Upload Course Material / Slides / Past Question
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadResults ? (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Upload Results Report</h4>
                <div className="divide-y divide-slate-200 max-h-60 overflow-y-auto">
                  {uploadResults.map((res, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-xs">{res.filename}</span>
                      {res.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold">
                          <CheckCircle2 className="h-4 w-4" /> Succeeded
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-extrabold">
                          <AlertCircle className="h-4 w-4" /> {res.error || 'Failed'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-full rounded-xl bg-brand-navy py-2.5 text-xs font-bold text-white hover:bg-brand-navy-deep"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* File Dropzone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-900">
                      Select File(s) <span className="text-red-600 font-extrabold">* (.PDF, .DOCX, .PNG, .JPG, .JPEG)</span>
                    </label>
                    <span className="text-[10px] font-extrabold text-brand-navy bg-brand-navy/10 px-2 py-0.5 rounded-md">
                      Max: 50 MB per file (Min: 1 KB)
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-navy hover:bg-slate-100 rounded-xl p-4 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="h-6 w-6 text-brand-navy mx-auto mb-1" />
                    <p className="text-xs font-bold text-slate-900">Click to select files (Bulk multi-selection supported)</p>
                    <p className="text-[11px] text-slate-600 font-bold mt-1">
                      Formats: PDF, DOCX, PNG, JPG, JPEG • <span className="text-brand-navy">Size Limit: 1 KB to 50 MB</span>
                    </p>
                  </button>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg text-xs border border-slate-200">
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-brand-navy flex-shrink-0" />
                            <span className="truncate font-bold text-slate-900">{file.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button type="button" onClick={() => handleRemoveFile(idx)} className="text-slate-500 hover:text-red-600">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedFiles.length === 1 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Material Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CSC 201 Lecture Slides - Data Structures Week 1"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Category Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    >
                      <option value="past_question">Past Question</option>
                      <option value="resource">Course Material</option>
                      <option value="slides">Lecture Slides</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Associated Course</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                    >
                      <option value="">-- General --</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Level (Optional)</label>
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
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

                {/* Paid / Free Toggle */}
                <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Pricing Model</span>
                      <span className="text-[11px] text-slate-600 font-semibold">
                        {isPaid
                          ? `Paid (Default ₦${type === 'slides' ? slidePrice : type === 'past_question' ? pastQuestionPrice : courseMaterialPrice})`
                          : 'Free for all students'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${!isPaid ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>Free</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPaid}
                        onClick={() => setIsPaid(!isPaid)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                          isPaid ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isPaid ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-bold ${isPaid ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>Paid</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
                  >
                    {submitting ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-brand-navy" />
                Global Material Pricing Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGlobalPricing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Default Course Material Price (₦)
                </label>
                <input
                  type="number"
                  value={courseMaterialPrice}
                  onChange={(e) => setCourseMaterialPrice(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Default Past Question Price (₦)
                </label>
                <input
                  type="number"
                  value={pastQuestionPrice}
                  onChange={(e) => setPastQuestionPrice(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Default Lecture Slides Price (₦)
                </label>
                <input
                  type="number"
                  value={slidePrice}
                  onChange={(e) => setSlidePrice(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="rounded-xl bg-brand-navy px-5 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Panel>
  );
}
