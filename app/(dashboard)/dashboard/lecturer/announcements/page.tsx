'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, RefreshCw, X, CheckCircle2, Trash2, Calendar, BookOpen, AlertCircle, Pencil, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { adminApiRequest, resolveMediaUrl, FALLBACK_ANNOUNCEMENT_IMAGE } from '@/lib/apiClient';
import { useAuth } from '@/hooks/useAuth';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type?: string;
  imageUrl?: string | null;
  audienceType?: string;
  level?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string };
  courseId?: string | null;
  course?: { code: string; name: string };
  createdAt: string;
  authorId?: string;
  authorRole?: string;
  author?: { fullName: string; role: string; id?: string };
}

export default function LecturerAnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [type, setType] = useState('NEWS');
  const [level, setLevel] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editSelectedCourseId, setEditSelectedCourseId] = useState('');
  const [editType, setEditType] = useState('NEWS');
  const [editLevel, setEditLevel] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAnnouncementsAndCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const coursesEndpoint = user?.id ? `/courses?lecturerId=${user.id}` : '/courses';

      const [annsData, coursesData] = await Promise.all([
        adminApiRequest('/announcements').catch(() => []),
        adminApiRequest(coursesEndpoint).catch(() => []),
      ]);

      if (Array.isArray(annsData)) {
        // Requirement 4: Announcements created by class rep shouldn't show in the lecturer and school admin dashboard
        const filtered = annsData.filter(
          (a: any) =>
            a.authorRole !== 'STUDENT' &&
            a.author?.role !== 'STUDENT' &&
            (a.audienceType || '').toUpperCase() !== 'CLASS_REP' &&
            (a.audienceType || '').toUpperCase() !== 'REP'
        );
        setAnnouncements(filtered);
      }
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementsAndCourses();
  }, [user?.id]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      formData.append('audienceType', type === 'LECTURER_UPDATE' ? 'DEPARTMENT_LEVEL' : (selectedCourseId ? 'COURSE' : 'ALL'));
      formData.append('type', type);
      if (level && level.trim() !== '') {
        formData.append('level', level.trim());
      }
      if (user?.departmentId) {
        formData.append('departmentId', user.departmentId);
      }
      if (selectedCourseId) {
        formData.append('courseId', selectedCourseId);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await adminApiRequest('/announcements', {
        method: 'POST',
        body: formData,
      });

      setSuccess('Announcement broadcasted successfully!');
      setTitle('');
      setMessage('');
      setSelectedCourseId('');
      setType('NEWS');
      setLevel('');
      setImageFile(null);
      setIsModalOpen(false);
      fetchAnnouncementsAndCourses();
    } catch (err: any) {
      setError(err?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setEditTitle(ann.title || '');
    setEditMessage(ann.message || '');
    setEditSelectedCourseId(ann.courseId || '');
    setEditType(ann.type || 'NEWS');
    setEditLevel(ann.level || '');
    setEditImageFile(null);
  };

  const handleUpdateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement || !editTitle.trim() || !editMessage.trim()) return;

    setEditSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('message', editMessage.trim());
      formData.append('type', editType);
      if (editLevel !== undefined) {
        formData.append('level', editLevel.trim());
      }
      formData.append('courseId', editSelectedCourseId || '');
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await adminApiRequest(`/announcements/${editingAnnouncement.id}`, {
        method: 'PATCH',
        body: formData,
      });

      setSuccess('Announcement updated successfully!');
      setEditingAnnouncement(null);
      fetchAnnouncementsAndCourses();
    } catch (err: any) {
      setError(err?.message || 'Failed to update announcement');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletingId(id);
    try {
      await adminApiRequest(`/announcements/${id}`, { method: 'DELETE' });
      setSuccess('Announcement removed successfully.');
      setDeleteConfirmItem(null);
      fetchAnnouncementsAndCourses();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete announcement');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      (a.course?.code && a.course.code.toLowerCase().includes(search.toLowerCase())) ||
      (a.author?.fullName && a.author.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Course & Department Announcements"
        subtitle="Broadcast notices, assignment updates, and lecture schedules directly to students."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnnouncementsAndCourses}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-surface"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-4 text-xs font-semibold text-white hover:bg-brand-navy/90 shadow-md"
            >
              <Plus className="h-4 w-4" />
              New Announcement
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

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Search announcements by title, course code, or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-200 px-4 py-2 text-xs outline-none focus:border-brand-primary"
        />
        <span className="text-xs text-gray-500 font-medium">
          Total Broadcasts: <strong className="text-brand-navy">{filteredAnnouncements.length}</strong>
        </span>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="flex py-12 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading Announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Announcements Broadcasted Yet</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Post an announcement to notify students in your courses about lecture schedule changes, assignment deadlines, or test notices.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-navy px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-brand-navy/90"
          >
            <Plus className="h-4 w-4" />
            Post First Announcement
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
            >
              {ann.imageUrl && (
                <div className="w-full bg-slate-50 border-b border-gray-100 overflow-hidden">
                  <img
                    src={resolveMediaUrl(ann.imageUrl)}
                    alt={ann.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src = FALLBACK_ANNOUNCEMENT_IMAGE;
                    }}
                    className="h-48 sm:h-60 w-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-navy/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-brand-navy">
                      <Megaphone className="h-3 w-3" />
                      {ann.audienceType || 'STUDENTS'}
                    </span>
                    {ann.type && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                        {ann.type === 'LECTURER_UPDATE' ? 'Lecturer Update' : ann.type}
                      </span>
                    )}
                    {ann.level && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                        {ann.level} Level
                      </span>
                    )}
                    {ann.course && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-gold/20 px-3 py-1 text-[10px] font-extrabold text-brand-navy border border-brand-gold">
                        <BookOpen className="h-3 w-3" />
                        {ann.course.code}: {ann.course.name}
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ann.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-brand-navy">{ann.title}</h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{ann.message}</p>

                  {ann.author && (
                    <p className="text-[11px] text-gray-400 pt-1 font-medium">
                      Posted by: <strong className="text-gray-700">{ann.author.fullName}</strong>
                    </p>
                  )}
                </div>

                {(() => {
                  const isOwnAnnouncement = Boolean(
                    (ann.authorId && user?.id && ann.authorId === user.id) ||
                    (ann.author && (ann.author as any).id === user?.id) ||
                    (!ann.authorId && user?.name && ann.author?.fullName === user.name)
                  );

                  if (!isOwnAnnouncement) {
                    return (
                      <div className="shrink-0 self-end md:self-start">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600">
                          {ann.authorRole === 'SUPER_ADMIN' || ann.author?.role === 'SUPER_ADMIN'
                            ? 'Platform Broadcast'
                            : 'Campus Notice'}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                      <button
                        type="button"
                        onClick={() => openEditModal(ann)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Edit Announcement"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmItem(ann)}
                        className="inline-flex items-center gap-1 rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Announcement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h3 className="text-base font-bold text-slate-900">Confirm Announcement Deletion</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteConfirmItem.title}"</strong>? This will remove the notice for all students.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                No, Cancel
              </button>
              <button
                type="button"
                disabled={deletingId === deleteConfirmItem.id}
                onClick={() => handleDeleteAnnouncement(deleteConfirmItem.id)}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-50"
              >
                {deletingId === deleteConfirmItem.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-navy">Post New Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePostAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Test Timetable & Submission Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target Course (Optional)
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">All My Enrolled Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="NEWS">Campus News / General</option>
                  <option value="LECTURER_UPDATE">Lecturer Update</option>
                  <option value="MATERIAL">Course Material Update</option>
                  <option value="EXAM">Exam / Timetable Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target Student Level {type === 'LECTURER_UPDATE' ? '*' : '(Optional)'}
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">All Levels (Department-wide)</option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="600">600 Level</option>
                  <option value="700">700 Level</option>
                </select>
                <p className="mt-1 text-[11px] text-gray-400">
                  {type === 'LECTURER_UPDATE'
                    ? 'Only students in your department and the selected level will receive this lecturer update.'
                    : 'Optionally target students at a specific level in your department.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Details / Message Body *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the message body to broadcast to students..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-brand-navy">Edit Announcement</h3>
              </div>
              <button
                onClick={() => setEditingAnnouncement(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAnnouncement} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Semester Test Timetable & Submission Notice"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target Course (Optional)
                </label>
                <select
                  value={editSelectedCourseId}
                  onChange={(e) => setEditSelectedCourseId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">All My Enrolled Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Type *
                </label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="NEWS">Campus News / General</option>
                  <option value="LECTURER_UPDATE">Lecturer Update</option>
                  <option value="MATERIAL">Course Material Update</option>
                  <option value="EXAM">Exam / Timetable Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target Student Level (Optional)
                </label>
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">All Levels (Department-wide)</option>
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                  <option value="600">600 Level</option>
                  <option value="700">700 Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Replace Image (Optional)
                </label>
                {editingAnnouncement.imageUrl && !editImageFile && (
                  <div className="mb-2 flex items-center gap-2 rounded-xl bg-slate-50 p-2 border border-slate-200 text-xs text-slate-600">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <span>Current image attached</span>
                    <a
                      href={editingAnnouncement.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-primary font-semibold hover:underline ml-auto"
                    >
                      View
                    </a>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Announcement Details / Message Body *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the message body to broadcast to students..."
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingAnnouncement(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-brand-navy px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

