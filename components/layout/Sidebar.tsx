'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LifeBuoy, LogOut, ScrollText } from 'lucide-react';
import { Role } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { dashboardNav, getNavItems } from '@/lib/navigation';
import { useToast } from '@/components/providers/ToastProvider';

interface SidebarProps {
  role: Role;
  collapsed: boolean;
  onLogout: () => void;
  userName: string;
  userTitle: string;
}

export function Sidebar({ role, collapsed, onLogout, userName, userTitle }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavItems(role);

  const width = 'md:w-[72px] lg:w-[220px]';
  const { showToast } = useToast();

  if (role === 'super_admin') {
    return (
      <aside className={`fixed left-0 top-0 hidden h-screen border-r border-[#edf0fb] bg-[#f8f9ff] md:block ${width}`}>
        <div className="px-4 pb-4 pt-5 lg:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white">
              <span className="font-display text-sm font-bold">R</span>
            </div>
            <div className="hidden lg:block">
              <p className="font-display text-[15px] font-bold text-brand-navy">RFT</p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-text-muted">System Authority</p>
            </div>
          </div>
        </div>

        <div className="border-b border-[#edf0fb] px-4 pb-4 lg:px-5">
          <div className="rounded-2xl bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-navy">System Admin</p>
            <p className="mt-1 text-[10px] text-text-secondary">Global Controller</p>
          </div>
        </div>

        <nav className="flex h-[calc(100%-156px)] flex-col px-3 pt-4">
          <div className="flex-1 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ease-in-out ${isActive ? 'bg-white text-brand-navy shadow-card' : 'text-text-secondary hover:bg-white hover:text-brand-navy'
                    }`}
                  title={item.label}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] lg:block">{item.label}</span>
                  {collapsed ? (
                    <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden -translate-y-1/2 rounded-md bg-brand-navy px-2 py-1 text-xs text-white group-hover:md:block lg:hidden">
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="space-y-2 border-t border-[#edf0fb] pt-4">
            <Link
              href="/dashboard/super/onboarding"
              className="mx-1 flex items-center justify-center rounded-xl bg-brand-navy px-4 py-3 text-sm font-semibold text-white"
            >
              <span className="hidden lg:block">+ Add New School</span>
              <span className="lg:hidden">+</span>
            </Link>
            <button
              type="button"
              onClick={() => showToast('System logs are mocked for demo mode.', 'success')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-all duration-200 ease-in-out hover:bg-white hover:text-brand-navy"
            >
              <ScrollText className="h-4 w-4 shrink-0" />
              <span className="hidden lg:block">System Logs</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Support panel is mocked for demo mode.', 'success')}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-all duration-200 ease-in-out hover:bg-white hover:text-brand-navy"
            >
              <LifeBuoy className="h-4 w-4 shrink-0" />
              <span className="hidden lg:block">Support</span>
            </button>
          </div>
        </nav>
      </aside>
    );
  }

  return (
    <aside className={`fixed left-0 top-0 hidden h-screen border-r border-gray-100 bg-white/95 backdrop-blur md:block ${width}`}>
      {role === 'lecturer' ? (
        <div className="border-b border-gray-100 px-4 py-5 lg:px-5">
          <div className="hidden items-center gap-3 lg:flex">
            <Avatar name={userName} square className="h-12 w-12 text-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-text-primary">{userName}</p>
              <p className="text-xs text-text-secondary">{userTitle}</p>
            </div>
          </div>
          <div className="flex justify-center lg:hidden">
            <Avatar name={userName} square className="h-10 w-10 text-xs" />
          </div>
        </div>
      ) : null}

      <nav className={`flex h-full flex-col ${role === 'lecturer' ? 'pt-4' : 'pt-20'}`}>
        <div className="space-y-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const isCta = item.special === 'cta';
            const isLogout = item.special === 'logout';

            if (isLogout) {
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={onLogout}
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-500 transition-all duration-200 ease-in-out hover:bg-red-50"
                  title={item.label}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden text-sm lg:block">{item.label}</span>
                </button>
              );
            }

            if (isCta) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className="mx-2 mt-4 flex w-[calc(100%-1rem)] items-center justify-center gap-3 rounded-lg bg-brand-navy px-4 py-3 text-white transition-all duration-200 ease-in-out hover:bg-brand-navy-deep"
                  title={item.label}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="hidden text-sm font-semibold lg:block">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ease-in-out ${role === 'lecturer'
                  ? isActive
                    ? 'bg-brand-navy-light font-semibold text-brand-navy'
                    : 'text-text-secondary hover:bg-brand-navy-light hover:text-brand-navy'
                  : isActive
                    ? 'bg-brand-navy font-semibold text-white'
                    : 'text-text-secondary hover:bg-brand-navy-light hover:text-brand-navy'
                  }`}
                title={item.label}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive && role !== 'lecturer' ? 'text-brand-gold' : ''}`} />
                <span
                  className={`hidden ${role === 'lecturer'
                    ? 'text-sm'
                    : 'text-[11px] font-semibold uppercase tracking-[0.24em]'
                    } lg:block`}
                >
                  {item.label}
                </span>
                {collapsed ? (
                  <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden -translate-y-1/2 rounded-md bg-brand-navy px-2 py-1 text-xs text-white group-hover:md:block lg:hidden">
                    {item.label}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
