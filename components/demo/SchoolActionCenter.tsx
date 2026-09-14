'use client';

import { useMemo, useState } from 'react';
import { CircleAlert, Eye, Power, School2 } from 'lucide-react';
import { School } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/providers/ToastProvider';

interface SchoolActionCenterProps {
  schools: School[];
  schoolId: string;
  showViewTrigger?: boolean;
}

export function SchoolActionCenter({ schools, schoolId, showViewTrigger = true }: SchoolActionCenterProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [reason, setReason] = useState('');
  const { showToast } = useToast();

  const selectedSchool = useMemo(
    () => schools.find((school) => school.id === schoolId) ?? null,
    [schoolId, schools],
  );


  if (!selectedSchool) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        {showViewTrigger ? (
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-navy transition-all duration-200 ease-in-out hover:bg-brand-navy-light"
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setDeactivateOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-status-critical transition-all duration-200 ease-in-out hover:bg-status-critical-bg"
        >
          <Power className="h-3.5 w-3.5" />
          Deactivate
        </button>
      </div>

      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="School Profile">
        <div className="space-y-5">
          <div className="rounded-2xl bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white">
                  <School2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-text-primary">{selectedSchool.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{selectedSchool.location}</p>
                </div>
              </div>
              <StatusBadge status={selectedSchool.status} />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Students</p>
              <p className="mt-2 text-xl font-bold text-text-primary">{((selectedSchool as any)._count?.users ?? selectedSchool.students ?? 0).toLocaleString()}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Lecturers</p>
              <p className="mt-2 text-xl font-bold text-text-primary">{(selectedSchool as any)._count?.users ?? selectedSchool.lecturers ?? 0}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Courses</p>
              <p className="mt-2 text-xl font-bold text-text-primary">{(selectedSchool as any)._count?.courses ?? selectedSchool.courses ?? 0}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <AppButton href={`/dashboard/super/schools/${selectedSchool.id}`}>Open Full Profile</AppButton>
            <AppButton variant="secondary" toastMessage={`${selectedSchool.name} profile exported.`}>Export Profile</AppButton>
          </div>
        </div>
      </Modal>

      <Modal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} title="Deactivate School">
        <div className="space-y-5">
          <div className="flex gap-3 rounded-2xl bg-status-critical-bg p-4 text-status-critical">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="text-sm font-bold">You are about to deactivate {selectedSchool.name}.</p>
              <p className="mt-1 text-sm">
                This simulates restricting access for admins, lecturers, and students attached to the school.
              </p>
            </div>
          </div>
          <label className="block space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary">Reason</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="State why the school is being deactivated..."
              className="min-h-28 w-full rounded-2xl border border-transparent bg-surface px-4 py-3 text-sm text-text-primary transition-all duration-200 ease-in-out focus:border-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                showToast(`${selectedSchool.name} deactivated${reason ? `: ${reason}` : ''}.`, 'success');
                setDeactivateOpen(false);
                setReason('');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-status-critical px-5 py-3 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:brightness-95"
            >
              <Power className="h-4 w-4" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => {
                setDeactivateOpen(false);
                setReason('');
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-text-primary transition-all duration-200 ease-in-out hover:border-brand-navy hover:text-brand-navy"
            >
              No
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
