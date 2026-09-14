'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, CheckCircle2, Trash2, Mail, RefreshCw, Filter, School } from 'lucide-react';
import { adminApiRequest } from '@/lib/apiClient';
import { useToast } from '@/components/providers/ToastProvider';

interface AnonymousMessage {
  id: string;
  message: string;
  isRead: boolean;
  schoolId?: string;
  school?: {
    id: string;
    name: string;
    acronym?: string;
  };
  createdAt: string;
}

export function AnonymousMessagesView() {
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminApiRequest('/admin/anonymous-messages');
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch anonymous messages:', err);
      showToast(err?.message || 'Failed to load anonymous messages', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await adminApiRequest(`/admin/anonymous-messages/${id}/read`, { method: 'PATCH' });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, isRead: true } : msg))
      );
      showToast('Message marked as read', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update message', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this anonymous message?')) return;
    try {
      await adminApiRequest(`/admin/anonymous-messages/${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      showToast('Anonymous message deleted', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete message', 'error');
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === 'unread' && msg.isRead) return false;
    if (filter === 'read' && !msg.isRead) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const textMatch = msg.message.toLowerCase().includes(term);
      const schoolMatch = msg.school?.name?.toLowerCase().includes(term);
      return textMatch || schoolMatch;
    }
    return true;
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-brand-navy dark:text-white">
            Anonymous Student Messages
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            View direct feedback and confidential inquiries submitted by students across your institution.
          </p>
        </div>
        <button
          type="button"
          onClick={loadMessages}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-white px-4 py-2.5 text-xs font-semibold text-brand-navy shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-card-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Submissions</p>
            <MessageSquare className="h-5 w-5 text-brand-navy" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-navy">{messages.length}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Unread Messages</p>
            <Mail className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-700">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border border-card-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Read / Processed</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-brand-navy">{messages.length - unreadCount}</p>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-brand-navy text-white'
                : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
            }`}
          >
            All Messages ({messages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === 'unread'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('read')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              filter === 'read'
                ? 'bg-brand-navy text-white'
                : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="w-full rounded-xl border border-card-border px-3.5 py-2 text-xs text-brand-navy placeholder:text-text-muted focus:border-brand-navy focus:outline-none sm:w-64"
        />
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-card-border bg-white">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-brand-navy" />
            <p className="text-xs text-text-secondary">Loading messages from server...</p>
          </div>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-card-border bg-white p-6 text-center">
          <MessageSquare className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-brand-navy">No Anonymous Messages Found</p>
          <p className="mt-1 text-xs text-text-secondary">
            {searchTerm ? 'No messages match your search criteria.' : 'Student submissions will automatically appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`group relative rounded-2xl border p-5 transition ${
                !msg.isRead
                  ? 'border-amber-300 bg-amber-50/20 shadow-sm'
                  : 'border-card-border bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        !msg.isRead
                          ? 'bg-amber-500/15 text-amber-700 border border-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${!msg.isRead ? 'bg-amber-600' : 'bg-slate-400'}`} />
                      {!msg.isRead ? 'UNREAD SUBMISSION' : 'READ'}
                    </span>

                    {msg.school && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        <School className="h-3 w-3 text-slate-500" />
                        {msg.school.acronym || msg.school.name}
                      </span>
                    )}

                    <span className="text-[11px] text-text-muted">
                      {new Date(msg.createdAt).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-brand-navy whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  {!msg.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(msg.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                      title="Mark as Read"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
                    title="Delete Message"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
