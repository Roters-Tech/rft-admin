'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, RefreshCw, X, CheckCircle2, Trash2, Calendar, Building2, User, Pencil, ImageIcon, AlertCircle, Globe } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { adminApiRequest, resolveMediaUrl, FALLBACK_ANNOUNCEMENT_IMAGE } from '@/lib/apiClient';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type?: string;
  imageUrl?: string | null;
  audienceType?: string;
  schoolId?: string | null;
  school?: { id: string; name: string; code?: string };
  createdAt: string;
  author?: { fullName: string; role?: string };
}

interface School {
  id: string;
  name: string;
  code?: string;
}

export default function SuperAdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [filterSchoolId, setFilterSchoolId] = useState('ALL');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetSchoolId, setTargetSchoolId] = useState('');
  const [type, setType] = useState('NEWS');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editTargetSchoolId, setEditTargetSchoolId] = useState('');
  const [editType, setEditType] = useState('NEWS');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Announcement | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [annsData, schoolsData] = await Promise.all([
        adminApiRequest('/announcements').catch(() => []),
        adminApiRequest('/schools').catch(() => []),
      ]);

      if (Array.isArray(annsData)) {
        setAnnouncements(annsData);
      }
      if (Array.isArray(schoolsData)) {
        setSchools(schoolsData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('message', message.trim());
      formData.append('audienceType', targetSchoolId ? 'SCHOOL' : 'ALL');
      formData.append('type', type);
      if (targetSchoolId) {
        formData.append('schoolId', targetSchoolId);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await adminApiRequest('/announcements', {
        method: 'POST',
        body: formData,
      });

      setSuccess('Platform announcement broadcasted successfully!');
      setTitle('');
      setMessage('');
      setTargetSchoolId('');
      setType('NEWS');
      setImageFile(null);
      setIsModalOpen(false);
      fetchData();
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
    setEditTargetSchoolId(ann.schoolId || '');
    setEditType(ann.type || 'NEWS');
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
      formData.append('schoolId', editTargetSchoolId || '');
      formData.append('audienceType', editTargetSchoolId ? 'SCHOOL' : 'ALL');
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await adminApiRequest(`/announcements/${editingAnnouncement.id}`, {
        method: 'PATCH',
        body: formData,
      });

      setSuccess('Announcement updated successfully!');
      setEditingAnnouncement(null);
      fetchData();
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
      setSuccess('Announcement deleted.');
      setDeleteConfirmItem(null);
      fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete announcement');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSchool =
      filterSchoolId === 'ALL'
        ? true
        : filterSchoolId === 'GLOBAL'
        ? !a.schoolId
        : a.schoolId === filterSchoolId;

    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.message.toLowerCase().includes(search.toLowerCase()) ||
      (a.school?.name && a.school.name.toLowerCase().includes(search.toLowerCase())) ||
      (a.author?.fullName && a.author.fullName.toLowerCase().includes(search.toLowerCase()));

    return matchesSchool && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Announcements"
        subtitle="Manage global bulletins and school-specific notices across the entire RFT network."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Search announcements by title, message, or school..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md rounded-xl border border-gray-200 px-4 py-2 text-xs outline-none focus:border-brand-primary"
        />

        <div className="flex items-center gap-3">
          <select
            value={filterSchoolId}
            onChange={(e) => setFilterSchoolId(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-brand-primary bg-white text-gray-700 font-medium"
          >
            <option value="ALL">All Schools & Global</option>
            <option value="GLOBAL">Global Only (No School Target)</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
            Total: <strong className="text-brand-navy">{filteredAnnouncements.length}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex py-12 justify-center items-center text-sm text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading Announcements...
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-brand-navy">No Announcements Found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
            Broadcast platform updates, maintenance alerts, or institution notices across the network.
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
        <div className="space-y-4">
          {filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-slate-100/50">
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
                    className="h-52 sm:h-64 w-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-gray-100 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Megaphone className="h-5 w-5 text-brand-primary" />
                      <h3 className="text-base font-bold text-brand-navy">{ann.title}</h3>
                      {ann.school ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                          <Building2 className="h-3 w-3" />
                          {ann.school.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          <Globe className="h-3 w-3" />
                          Global Platform
                        </span>
                      )}
                      {ann.type && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {ann.type}
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {ann.author?.fullName || 'Platform Administrator'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(ann.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => openEditModal(ann)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Edit Announcement"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmItem(ann)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-xs sm:text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{ann.message}</p>
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
              Are you sure you want to delete <strong className="text-slate-900">"{deleteConfirmItem.title}"</strong>? This action cannot be undone.
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

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-base font-bold text-brand-navy">Broadcast Platform Announcement</h3>
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
                  placeholder="e.g. Scheduled System Maintenance Notice"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target School (Optional - Leave blank for Global)
                </label>
                <select
                  value={targetSchoolId}
                  onChange={(e) => setTargetSchoolId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">Global (All Schools & Students)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                  <option value="NEWS">General News & Updates</option>
                  <option value="MATERIAL">Platform / System Notice</option>
                  <option value="EXAM">Urgent / Important Notice</option>
                </select>
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
                  Announcement Content *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type the announcement content..."
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
                  className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-semibold text-white hover:bg-brand-navy/90 disabled:opacity-50"
                >
                  {submitting ? 'Broadcasting...' : 'Broadcast Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
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
                  placeholder="e.g. Scheduled System Maintenance Notice"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Target School (Optional - Leave blank for Global)
                </label>
                <select
                  value={editTargetSchoolId}
                  onChange={(e) => setEditTargetSchoolId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-brand-primary bg-white"
                >
                  <option value="">Global (All Schools & Students)</option>
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
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
                  <option value="NEWS">General News & Updates</option>
                  <option value="MATERIAL">Platform / System Notice</option>
                  <option value="EXAM">Urgent / Important Notice</option>
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
                  Announcement Content *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type the announcement content..."
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
