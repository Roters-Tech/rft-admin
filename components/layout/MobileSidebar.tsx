'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, ScrollText, X } from 'lucide-react';
import { NavItem, Role } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';

interface MobileSidebarProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  role: Role;
}

export function MobileSidebar({ items, open, onClose, onLogout, role }: MobileSidebarProps) {
  const pathname = usePathname();
  const { showToast } = useToast();

  return (
    <div
      className={`fixed inset-0 z-[70] bg-brand-navy/30 transition-all duration-200 ease-in-out md:hidden ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div
        className={`h-full w-[280px] bg-white shadow-sidebar transition-all duration-200 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <span className="font-display text-lg font-bold text-text-primary">Navigation</span>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex h-[calc(100%-73px)] flex-col p-4">
          <div className="flex-1">
          {(items || []).map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const isCta = item.special === 'cta';
            const isLogout = item.special === 'logout';

            if (isLogout) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-500 transition-all duration-200 ease-in-out hover:bg-red-50"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-all duration-200 ease-in-out ${
                  isCta
                    ? 'mx-0 bg-brand-navy font-semibold text-white'
                    : isLogout
                      ? 'text-red-500'
                      : isActive
                        ? 'bg-brand-navy text-white'
                        : 'text-text-secondary hover:bg-brand-navy-light hover:text-brand-navy'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-brand-gold' : ''}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          </div>
          {role === 'super_admin' ? (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <Link href="/dashboard/super/onboarding" onClick={onClose} className="flex w-full items-center justify-center rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white">
                + Add New School
              </Link>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  showToast('System logs are mocked for demo mode.', 'success');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-text-secondary"
              >
                <ScrollText className="h-4 w-4" />
                System Logs
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  showToast('Support panel is mocked for demo mode.', 'success');
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-text-secondary"
              >
                <LifeBuoy className="h-4 w-4" />
                Support
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
