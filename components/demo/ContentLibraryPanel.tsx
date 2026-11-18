'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import {
  Download,
  Upload,
  Plus,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Settings,
  Trash2,
  Edit,
  CloudDownload,
  Search,
  Loader2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { Panel } from '@/components/ui/Panel';
import { adminApiRequest, resolveMediaUrl, API_BASE_URL, getAdminToken } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/providers/ToastProvider';
import { compressUploadFile, formatBytes, CompressionResult } from '@/lib/pdfCompressor';

export function ContentLibraryPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const userRole = (user as any)?.role?.toUpperCase() || '';
  const isLecturer = userRole === 'LECTURER' || userRole === 'TEACHER';

  const [contentList, setContentList] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'past_question' | 'resource' | 'slides'>('all');

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMode, setUploadMode] = useState<'local' | 'drive'>('local');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileCompressionStats, setFileCompressionStats] = useState<Record<string, CompressionResult>>({});
  const [compressingFiles, setCompressingFiles] = useState(false);
  const [compressingProgress, setCompressingProgress] = useState('');

  // Google Drive state in upload modal
  const [driveInputUrl, setDriveInputUrl] = useState('');
  const [fetchingDrive, setFetchingDrive] = useState(false);

  // Upload form metadata
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

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'past_question' | 'resource' | 'slides'>('past_question');
  const [editCourseId, setEditCourseId] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editIsPaid, setEditIsPaid] = useState<boolean>(true);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editFileStats, setEditFileStats] = useState<CompressionResult | null>(null);
  const [editFileCompressing, setEditFileCompressing] = useState(false);
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editFetchingDrive, setEditFetchingDrive] = useState(false);
  const [editReplaceMode, setEditReplaceMode] = useState<'keep' | 'local' | 'drive'>('keep');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchContentAndCourses = async () => {
    setLoading(true);
    try {
      const contentEndpoint = isLecturer
        ? `/content?uploaderId=${user?.id}`
        : user?.schoolId
        ? `/content?schoolId=${user.schoolId}`
        : '/content';

      const coursesEndpoint = isLecturer
        ? `/courses?lecturerId=${user?.id}`
        : user?.schoolId
        ? `/courses?schoolId=${user.schoolId}`
        : '/courses';

      const [contentData, coursesData] = await Promise.all([
        adminApiRequest(contentEndpoint).catch(() => []),
        adminApiRequest(coursesEndpoint).catch(() => []),
      ]);

      if (Array.isArray(contentData)) setContentList(contentData);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
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
    const t = file.type ? file.type.toLowerCase() : '';
    return (
      name.endsWith('.pdf') ||
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      name.endsWith('.pptx') ||
      name.endsWith('.ppt') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      t === 'application/pdf' ||
      t.includes('wordprocessingml') ||
      t.includes('msword') ||
      t.includes('presentationml') ||
      t.includes('powerpoint') ||
      t.includes('image/png') ||
      t.includes('image/jpeg')
    );
  };

  const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

  // Handle local file selection with client-side compression
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const invalidTypeFiles = filesArray.filter((f) => !isAllowedFile(f));
    if (invalidTypeFiles.length > 0) {
      showToast(
        `Rejected ${invalidTypeFiles.length} file(s). Only PDF, DOCX, PNG, JPG, and JPEG files are allowed.`,
        'error',
      );
    }

    const oversizedFiles = filesArray.filter((f) => isAllowedFile(f) && f.size > MAX_FILE_SIZE_BYTES);
    if (oversizedFiles.length > 0) {
      showToast(
        `Rejected ${oversizedFiles.length} file(s) exceeding 50 MB limit.`,
        'error',
      );
    }

    const validFiles = filesArray.filter(
      (f) => isAllowedFile(f) && f.size > 0 && f.size <= MAX_FILE_SIZE_BYTES,
    );

    if (validFiles.length === 0) return;

    setCompressingFiles(true);
    setCompressingProgress(`Compressing ${validFiles.length} file(s)...`);

    const processedFiles: File[] = [];
    const stats: Record<string, CompressionResult> = {};

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setCompressingProgress(`Compressing (${i + 1}/${validFiles.length}) ${file.name}...`);
      const compResult = await compressUploadFile(file);
      processedFiles.push(compResult.file);
      stats[compResult.file.name] = compResult;
    }

    setSelectedFiles((prev) => [...prev, ...processedFiles]);
    setFileCompressionStats((prev) => ({ ...prev, ...stats }));
    setCompressingFiles(false);
    setCompressingProgress('');

    if (processedFiles.length > 0 && !title) {
      setTitle(processedFiles[0].name.replace(/\.[^/.]+$/, ''));
    }

    const totalSaved = processedFiles.reduce((acc, f) => {
      const s = stats[f.name];
      return acc + (s && s.isCompressed ? s.originalSize - s.compressedSize : 0);
    }, 0);

    if (totalSaved > 0) {
      showToast(`Files compressed! Saved ${formatBytes(totalSaved)} before server upload.`, 'success');
    }
  };

  // Handle Google Drive Fetch & Compress
  const handleFetchFromGoogleDrive = async (urlToFetch: string, isForEdit = false) => {
    const targetUrl = urlToFetch.trim();
    if (!targetUrl) {
      showToast('Please enter a Google Drive link or file ID.', 'error');
      return;
    }

    if (isForEdit) {
      setEditFetchingDrive(true);
    } else {
      setFetchingDrive(true);
    }

    try {
      const token = getAdminToken();
      const response = await fetch(`${API_BASE_URL}/admin/content/drive-fetch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        let errMessage = 'Failed to download from Google Drive';
        try {
          const errJson = await response.json();
          errMessage = errJson.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const blob = await response.blob();
      const xFilename = response.headers.get('x-filename');
      let filename = 'google_drive_document.pdf';
      if (xFilename) {
        filename = decodeURIComponent(xFilename);
      }

      const rawFile = new File([blob], filename, {
        type: blob.type || 'application/pdf',
        lastModified: Date.now(),
      });

      // Compress client-side before queuing
      const compResult = await compressUploadFile(rawFile);

      if (isForEdit) {
        setEditFile(compResult.file);
        setEditFileStats(compResult);
        setEditDriveUrl('');
        showToast(
          `Imported "${filename}" from Google Drive! ${
            compResult.isCompressed
              ? `Compressed from ${formatBytes(compResult.originalSize)} to ${formatBytes(compResult.compressedSize)} (-${compResult.ratio}%)`
              : `(${formatBytes(compResult.originalSize)})`
          }`,
          'success',
        );
      } else {
        setSelectedFiles((prev) => [...prev, compResult.file]);
        setFileCompressionStats((prev) => ({
          ...prev,
          [compResult.file.name]: compResult,
        }));
        if (!title) {
          setTitle(filename.replace(/\.[^/.]+$/, ''));
        }
        setDriveInputUrl('');
        showToast(
          `Imported "${filename}" from Google Drive! ${
            compResult.isCompressed
              ? `Compressed from ${formatBytes(compResult.originalSize)} to ${formatBytes(compResult.compressedSize)} (-${compResult.ratio}%)`
              : `(${formatBytes(compResult.originalSize)})`
          }`,
          'success',
        );
      }
    } catch (err: any) {
      showToast(err?.message || 'Could not import from Google Drive', 'error');
    } finally {
      if (isForEdit) {
        setEditFetchingDrive(false);
      } else {
        setFetchingDrive(false);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      showToast('Please select or import at least one file to upload', 'error');
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
        showToast(
          `Bulk upload finished: ${response.successCount} succeeded, ${response.failureCount} failed`,
          response.failureCount === 0 ? 'success' : 'error',
        );
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
      prev.map((item) => (item.id === id ? { ...item, isPaid: !currentPaid } : item)),
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
        prev.map((item) => (item.id === id ? { ...item, isPaid: currentPaid } : item)),
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

  // Open Edit Modal for a Past Question or Resource
  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditType((item.type as any) || 'past_question');
    setEditCourseId(item.courseId || item.course?.id || '');
    setEditLevel(item.level || '');
    setEditIsPaid(item.isPaid ?? true);
    setEditPrice(item.price ?? (item.type === 'slides' ? slidePrice : item.type === 'past_question' ? pastQuestionPrice : courseMaterialPrice));
    setEditFile(null);
    setEditFileStats(null);
    setEditDriveUrl('');
    setEditReplaceMode('keep');
    setShowEditModal(true);
  };

  // Handle Edit local file select
  const handleEditFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!isAllowedFile(file)) {
      showToast('Only PDF, DOCX, PNG, JPG, and JPEG files are allowed.', 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast('File exceeds 50 MB limit.', 'error');
      return;
    }

    setEditFileCompressing(true);
    try {
      const compResult = await compressUploadFile(file);
      setEditFile(compResult.file);
      setEditFileStats(compResult);
      if (compResult.isCompressed) {
        showToast(
          `Compressed from ${formatBytes(compResult.originalSize)} to ${formatBytes(compResult.compressedSize)} (-${compResult.ratio}%)`,
          'success',
        );
      }
    } finally {
      setEditFileCompressing(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editTitle.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setEditSubmitting(true);
    try {
      let updated: any;
      if (editFile) {
        const formData = new FormData();
        formData.append('file', editFile);
        formData.append('title', editTitle.trim());
        formData.append('type', editType);
        if (editCourseId) formData.append('courseId', editCourseId);
        if (editLevel) formData.append('level', editLevel);
        formData.append('isPaid', String(editIsPaid));
        formData.append('price', String(editPrice));

        updated = await adminApiRequest(`/admin/content/${editingItem.id}`, {
          method: 'PATCH',
          body: formData,
        });
      } else {
        updated = await adminApiRequest(`/admin/content/${editingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: editTitle.trim(),
            type: editType,
            courseId: editCourseId || null,
            level: editLevel || null,
            isPaid: editIsPaid,
            price: Number(editPrice) || 0,
          }),
        });
      }

      showToast(`"${editTitle}" updated successfully!`, 'success');
      setContentList((prev) =>
        prev.map((c) => (c.id === editingItem.id ? { ...c, ...updated } : c)),
      );
      setShowEditModal(false);
      setEditingItem(null);
      setEditFile(null);
      setEditFileStats(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update resource', 'error');
    } finally {
      setEditSubmitting(false);
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
    if (!url) {
      const apiHost = API_BASE_URL.replace(/\/v1\/?$/, '');
      return `${apiHost}/uploads/sample_past_question.pdf`;
    }
    return resolveMediaUrl(url);
  };

  // Filtered Content List
  const filteredContent = useMemo(() => {
    return contentList.filter((item) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.title?.toLowerCase().includes(q) ||
        item.course?.code?.toLowerCase().includes(q) ||
        item.course?.name?.toLowerCase().includes(q) ||
        item.uploader?.fullName?.toLowerCase().includes(q);

      const matchesType =
        selectedTypeFilter === 'all' || item.type === selectedTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [contentList, searchQuery, selectedTypeFilter]);

  return (
    <Panel
      title="Content Library & Past Questions"
      subtitle="Institutional past exam papers, lecture notes, course packs, and study guides for students."
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
              setFileCompressionStats({});
              setTitle('');
              setSelectedLevel('');
              setUploadMode('drive');
              setDriveInputUrl('');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
          >
            <CloudDownload className="h-4 w-4 text-emerald-600" />
            Upload from Google Drive
          </button>
          <button
            onClick={() => {
              setShowUploadModal(true);
              setUploadResults(null);
              setSelectedFiles([]);
              setFileCompressionStats({});
              setTitle('');
              setSelectedLevel('');
              setUploadMode('local');
              setDriveInputUrl('');
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-card"
          >
            <Plus className="h-4 w-4" />
            + Upload Content / Material(s)
          </button>
        </div>
      }
    >
      {/* Search and Filters Bar */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search past questions, notes, or course codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-brand-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-navy"
          >
            <option value="all">All Material Types</option>
            <option value="past_question">Past Questions</option>
            <option value="resource">Course Materials</option>
            <option value="slides">Lecture Slides</option>
          </select>
        </div>
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-brand-navy" />
          Loading resources...
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="py-12 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          <p>
            {contentList.length === 0
              ? 'No course materials, slides, or past questions uploaded yet.'
              : 'No resources match your search or filter.'}
          </p>
          {contentList.length === 0 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadMode('drive');
                  setDriveInputUrl('');
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm"
              >
                <CloudDownload className="h-4 w-4 text-emerald-600" />
                Upload from Google Drive
              </button>
              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setUploadMode('local');
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all shadow-card"
              >
                <Upload className="h-4 w-4" />
                Upload from Device
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3.5">Resource Title</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Course</th>
                <th className="px-4 py-3.5">Level</th>
                <th className="px-4 py-3.5">Uploader</th>
                <th className="px-4 py-3.5">Pricing Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredContent.map((item) => {
                const itemPriceDefault =
                  item.type === 'slides'
                    ? slidePrice
                    : item.type === 'past_question'
                    ? pastQuestionPrice
                    : courseMaterialPrice;
                return (
                  <tr key={item.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-brand-navy dark:text-sky-400 flex-shrink-0" />
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm max-w-xs break-words leading-snug">
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
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {item.course?.code || 'General'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {item.level ? `${item.level}L` : 'All'}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {item.uploader?.fullName || 'Admin'}
                    </td>
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
                    <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300 text-xs">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.downloadUrl && (
                          <a
                            href={getSafeDownloadUrl(item.downloadUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-extrabold text-brand-navy dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="View / Download file"
                          >
                            <Download className="h-3.5 w-3.5" />
                            View
                          </a>
                        )}

                        {/* Edit Button for Superadmin, Admin, and Lecturer */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                          title="Edit past question / resource"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem({ id: item.id, title: item.title })}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center rounded-lg p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50"
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

      {/* Edit Past Question / Resource Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-brand-navy" />
                Edit Past Question / Resource
              </h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. CSC 201 2023 First Semester Exam Past Question"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Category</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-brand-navy focus:outline-none"
                  >
                    <option value="past_question">Past Question</option>
                    <option value="resource">Course Material</option>
                    <option value="slides">Lecture Slides</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">Course</label>
                  <select
                    value={editCourseId}
                    onChange={(e) => setEditCourseId(e.target.value)}
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
                  <label className="block text-xs font-bold text-slate-900 mb-1">Level</label>
                  <select
                    value={editLevel}
                    onChange={(e) => setEditLevel(e.target.value)}
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

              {/* Pricing section */}
              <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Pricing Access</span>
                    <span className="text-[11px] text-slate-600 font-semibold">
                      {editIsPaid ? 'Students pay to unlock this material' : 'Available for free to all students'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${!editIsPaid ? 'text-slate-900 font-extrabold' : 'text-slate-400'}`}>Free</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={editIsPaid}
                      onClick={() => setEditIsPaid(!editIsPaid)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-navy ${
                        editIsPaid ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          editIsPaid ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-bold ${editIsPaid ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}`}>Paid</span>
                  </div>
                </div>

                {editIsPaid && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Price (₦)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      min={0}
                      className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-bold text-right"
                    />
                  </div>
                )}
              </div>

              {/* Replace File (Optional) with Compression */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Replace Attached File (Optional)</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setEditReplaceMode('keep')}
                      className={`px-2 py-0.5 rounded-md ${editReplaceMode === 'keep' ? 'bg-slate-700 text-white' : 'text-slate-600'}`}
                    >
                      Keep Current
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditReplaceMode('local')}
                      className={`px-2 py-0.5 rounded-md ${editReplaceMode === 'local' ? 'bg-brand-navy text-white' : 'text-slate-600'}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditReplaceMode('drive')}
                      className={`px-2 py-0.5 rounded-md ${editReplaceMode === 'drive' ? 'bg-brand-navy text-white' : 'text-slate-600'}`}
                    >
                      Google Drive
                    </button>
                  </div>
                </div>

                {editReplaceMode === 'local' && (
                  <div className="pt-1">
                    <input
                      ref={editFileInputRef}
                      type="file"
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,application/pdf"
                      onChange={handleEditFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={editFileCompressing}
                      className="w-full border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:bg-slate-100 transition-colors"
                    >
                      {editFileCompressing ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-brand-navy">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Compressing PDF...
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-slate-700">Click to choose replacement file (Auto-compressed)</p>
                      )}
                    </button>
                  </div>
                )}

                {editReplaceMode === 'drive' && (
                  <div className="pt-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste Google Drive share link..."
                      value={editDriveUrl}
                      onChange={(e) => setEditDriveUrl(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleFetchFromGoogleDrive(editDriveUrl, true)}
                      disabled={editFetchingDrive}
                      className="rounded-xl bg-brand-navy px-3 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {editFetchingDrive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CloudDownload className="h-3.5 w-3.5" />}
                      Import
                    </button>
                  </div>
                )}

                {editFile && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-950 font-bold">
                    <div className="truncate max-w-xs flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{editFile.name}</span>
                    </div>
                    {editFileStats?.isCompressed && (
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        -{editFileStats.ratio}% ({formatBytes(editFileStats.compressedSize)})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal (Local Files + Google Drive with Client-Side Compression) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-navy" />
                Upload Course Material / Past Question
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
                {/* Mode Selector Tabs: Local File vs Google Drive */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
                  <button
                    type="button"
                    onClick={() => setUploadMode('local')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      uploadMode === 'local'
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('drive')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      uploadMode === 'drive'
                        ? 'bg-brand-navy text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <CloudDownload className="h-3.5 w-3.5" />
                    Import from Google Drive
                  </button>
                </div>

                {/* Local File Dropzone */}
                {uploadMode === 'local' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-900">
                        Select File(s) <span className="text-red-600 font-extrabold">* (PDF, DOCX, PNG, JPG)</span>
                      </label>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Auto-Compressed
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
                      disabled={compressingFiles}
                      className="w-full border-2 border-dashed border-slate-300 bg-slate-50 hover:border-brand-navy hover:bg-slate-100 rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      {compressingFiles ? (
                        <div className="py-2 flex flex-col items-center gap-2">
                          <Loader2 className="h-6 w-6 text-brand-navy animate-spin" />
                          <p className="text-xs font-bold text-brand-navy">{compressingProgress}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Compressing PDF client-side before upload...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-brand-navy mx-auto mb-1" />
                          <p className="text-xs font-bold text-slate-900">Click to select files (Bulk multi-selection supported)</p>
                          <p className="text-[11px] text-slate-600 font-bold mt-1">
                            PDFs & images are automatically compressed before uploading.
                          </p>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Google Drive Import Tab */}
                {uploadMode === 'drive' && (
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5 text-brand-navy" />
                        Google Drive File or Document Link
                      </label>
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Auto-Compressed
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... or Docs link"
                        value={driveInputUrl}
                        onChange={(e) => setDriveInputUrl(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-brand-navy outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleFetchFromGoogleDrive(driveInputUrl, false)}
                        disabled={fetchingDrive || !driveInputUrl.trim()}
                        className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {fetchingDrive ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Fetching...
                          </>
                        ) : (
                          <>
                            <CloudDownload className="h-3.5 w-3.5" />
                            Fetch & Compress
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Paste a Google Drive share link (set to &quot;Anyone with the link can view&quot;), Google Doc, or Google Slide. The PDF is downloaded and compressed in your browser before upload.
                    </p>
                  </div>
                )}

                {/* Selected & Compressed Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Ready for Upload ({selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''})
                    </p>
                    {selectedFiles.map((file, idx) => {
                      const stat = fileCompressionStats[file.name];
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-100 p-2.5 rounded-lg text-xs border border-slate-200"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="h-4 w-4 text-brand-navy flex-shrink-0" />
                            <span className="truncate font-bold text-slate-900">{file.name}</span>
                            {stat && stat.isCompressed ? (
                              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                -{stat.ratio}% ({formatBytes(stat.originalSize)} → {formatBytes(stat.compressedSize)})
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500">
                                ({formatBytes(file.size)})
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-500 hover:text-red-600 ml-2"
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedFiles.length === 1 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1">Material Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. CSC 201 Past Questions 2023 - First Semester"
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
                    disabled={submitting || selectedFiles.length === 0}
                    className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy-deep disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      `Upload ${selectedFiles.length} File(s)`
                    )}
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
