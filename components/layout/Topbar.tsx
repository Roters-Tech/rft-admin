'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react';
import { Role } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { RFTMark } from '@/components/layout/RFTMark';
import { lecturerTopTabs } from '@/lib/navigation';

interface TopbarProps {
  role: Role;
  school: string;
  userName: string;
  userTitle: string;
  onMenuOpen: () => void;
  onLogout: () => void;
}

const searchPlaceholder = {
  super_admin: 'Search schools, metrics, resources...',
  school_admin: 'Search faculties, lecturers, students...',
  lecturer: 'Search courses, students, content...',
};

export function Topbar({ role, school, userName, userTitle, onMenuOpen, onLogout }: TopbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const schoolName = typeof school === 'object' ? (school as any)?.name || 'Academic Faculty' : (school || 'Academic Faculty');


  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);



  const isSuperAdmin = role === 'super_admin';

  return (
    <header className={`sticky top-0 z-50 flex h-16 items-center justify-between border-b px-4 backdrop-blur md:px-6 ${
      isSuperAdmin ? 'border-[#edf0fb] bg-white' : 'border-gray-100 bg-white/95'
    }`}>
      <div className="flex items-center gap-4">
        <button type="button" onClick={onMenuOpen} className="rounded-lg p-2 text-text-secondary md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        {isSuperAdmin ? (
          <div className="hidden md:block">
            <p className="font-display text-[15px] font-bold text-brand-navy">{schoolName}</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block">
              <RFTMark compact dark />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-text-primary">{schoolName}</p>
              <p className="text-xs text-text-secondary">{userTitle}</p>
            </div>
          </>
        )}
      </div>

      {role !== 'lecturer' && (
        <div className={`hidden flex-1 items-center rounded-full px-4 py-2 lg:flex ${isSuperAdmin ? 'mx-8 max-w-xs bg-[#f5f6fb]' : 'max-w-sm bg-surface'}`}>
          <Search className="mr-3 h-4 w-4 text-text-muted" />
          <input
            placeholder={isSuperAdmin ? 'Global system search...' : searchPlaceholder[role]}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        {role !== 'lecturer' && (
          <>
            <div className="relative">
              <Bell className="h-5 w-5 text-text-secondary" />
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">
                3
              </span>
            </div>
            <Settings className="h-5 w-5 text-text-secondary" />
            <div className="hidden h-8 w-px bg-gray-200 sm:block" />
          </>
        )}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full transition-all duration-200 ease-in-out"
          >
            {isSuperAdmin ? (
              <div className="hidden text-right sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-navy">Super Admin</p>
                <p className="text-[10px] text-text-secondary">Global Controller</p>
              </div>
            ) : (
              <div className="hidden text-right sm:block">
                <p className="text-[13px] font-bold text-text-primary">{userName}</p>
                <p className="text-[11px] text-text-secondary">{userTitle}</p>
              </div>
            )}
            <Avatar name={userName} className="h-9 w-9 text-xs" />
            <ChevronDown className="hidden h-4 w-4 text-text-muted sm:block" />
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-gray-100 bg-white p-2 shadow-card">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-500 transition-all duration-200 ease-in-out hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
