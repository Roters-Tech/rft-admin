'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MOCK_USERS } from '@/lib/mock-users';
import { Role, User } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { adminApiRequest } from '@/lib/apiClient';

const STORAGE_KEY = 'rft_user';

const roleRoutes: Record<Role, string> = {
  super_admin: '/dashboard/super',
  school_admin: '/dashboard/school',
  lecturer: '/dashboard/lecturer',
};

function setCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 30) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getCookieUser(): User | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )rft_user=([^;]+)'));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedUser = window.localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    return getCookieUser();
  });
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await adminApiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const { accessToken, user: apiUser } = res;
        const apiRole = String(apiUser.role || '').toUpperCase();

        if (apiRole === 'STUDENT') {
          showToast('Access denied. Students must sign in via the Student Mobile App.', 'error');
          return false;
        }

        let role: Role = 'super_admin';
        if (apiRole === 'SUPER_ADMIN') role = 'super_admin';
        else if (apiRole === 'SCHOOL_ADMIN') role = 'school_admin';
        else if (apiRole === 'LECTURER') role = 'lecturer';

        const loggedUser: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.fullName,
          title: apiUser.fullName,
          school: apiUser.school?.name || 'Academic Faculty',
          schoolId: apiUser.schoolId || apiUser.school?.id,
          departmentId: apiUser.departmentId || apiUser.department?.id,
          department: apiUser.department,
          role,
          avatar: null,
          password,
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
        window.localStorage.setItem('rft_admin_token', accessToken);
        setCookie('rft_token', accessToken);
        setCookie('rft_user', JSON.stringify(loggedUser));
        setCookie('rft_role', role);
        setUser(loggedUser);
        showToast(`Signed in as ${loggedUser.title}`, 'success');
        router.push(roleRoutes[role] || '/dashboard/super');
        return true;
      } catch (err: any) {
        showToast(err?.message || 'Login failed. Please check your credentials.', 'error');
        return false;
      }
    },
    [router, showToast],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    clearCookie('rft_user');
    clearCookie('rft_role');
    setUser(null);
    showToast('Signed out successfully', 'success');
    window.location.href = '/login';
  }, [showToast]);

  const requireAuth = useCallback(() => {
    if (!user && typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard/')) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  return useMemo(
    () => ({
      user,
      login,
      logout,
      roleRoute: user ? roleRoutes[user.role] : '/login',
    }),
    [login, logout, user],
  );
}
