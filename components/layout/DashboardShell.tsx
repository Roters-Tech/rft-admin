'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { dashboardNav, getNavItems } from '@/lib/navigation';
import { Loader2 } from 'lucide-react';

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { isCollapsed, isMobileOpen, openMobile, closeMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!mounted || !user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-surface p-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white shadow-card">
          <Loader2 className="h-6 w-6 animate-spin text-brand-gold" />
        </div>
        <p className="mt-4 text-sm font-bold text-text-primary">Loading Dashboard Session...</p>
        <p className="mt-1 text-xs text-text-secondary mb-4">Verifying user permissions and settings</p>
        <button
          onClick={() => { window.location.href = '/login'; }}
          className="rounded-xl bg-brand-navy px-4 py-2 text-xs font-bold text-white hover:bg-brand-navy-deep transition-all"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const sidebarWidth = 'md:ml-[72px] lg:ml-[220px]';

  const schoolName = typeof user.school === 'object' ? (user.school as any)?.name || 'Academic Faculty' : (user.school || 'Academic Faculty');
  const userNameStr = typeof user.name === 'string' && user.name ? user.name : (user as any).fullName || user.email || 'User';
  const userTitleStr = typeof user.title === 'string' && user.title ? user.title : (user as any).fullName || 'Faculty Lead';

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8faff_0%,#f0f4ff_100%)]">
      <Sidebar
        role={user.role}
        collapsed={isCollapsed}
        onLogout={logout}
        userName={userNameStr}
        userTitle={userTitleStr}
      />
      <MobileSidebar items={getNavItems(user.role)} open={isMobileOpen} onClose={closeMobile} onLogout={logout} role={user.role} />
      <div className={sidebarWidth}>
        <Topbar
          role={user.role}
          school={schoolName}
          userName={userNameStr}
          userTitle={userTitleStr}
          onMenuOpen={openMobile}
          onLogout={logout}
        />
        <main className="animate-fade-in p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
