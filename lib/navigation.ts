import {
  BookOpen,
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  Diamond,
  FileText,
  GraduationCap,
  LineChart,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  LogOut,
  Settings,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  UserRoundCog,
  MessageSquare,
} from 'lucide-react';
import { NavItem, Role } from '@/types';

export const dashboardNav: Record<Role, NavItem[]> = {
  super_admin: [
    { label: 'DASHBOARD', href: '/dashboard/super', icon: LayoutDashboard, exact: true },
    { label: 'SCHOOLS', href: '/dashboard/super/schools', icon: Building2 },
    { label: 'SUBSCRIPTIONS', href: '/dashboard/super/fees', icon: CreditCard },
    { label: 'USER ROLES', href: '/dashboard/super/roles', icon: UserRoundCog },
    { label: 'ANNOUNCEMENTS', href: '/dashboard/super/announcements', icon: Megaphone },
    { label: 'ANONYMOUS MESSAGES', href: '/dashboard/super/messages', icon: MessageSquare },
    { label: 'GLOBAL ANALYTICS', href: '/dashboard/super/analytics', icon: LineChart },
  ],
  school_admin: [
    { label: 'OVERVIEW', href: '/dashboard/school', icon: LayoutDashboard, exact: true },
    { label: 'FACULTIES & DEPTS', href: '/dashboard/school/faculties', icon: Building2 },
    { label: 'LECTURERS', href: '/dashboard/school/lecturers', icon: GraduationCap },
    { label: 'STUDENTS', href: '/dashboard/school/students', icon: Users },
    { label: 'ANNOUNCEMENTS', href: '/dashboard/school/announcements', icon: Megaphone },
    // { label: 'ANONYMOUS MESSAGES', href: '/dashboard/school/messages', icon: MessageSquare }, // Temporarily disabled
    { label: 'CONTENT', href: '/dashboard/school/content', icon: FileText },
    { label: 'BILLING & SUB', href: '/dashboard/school/billing', icon: CreditCard },
  ],
  lecturer: [
    { label: 'My Courses', href: '/dashboard/lecturer', icon: BookOpen, exact: true },
    { label: 'My Profile', href: '/dashboard/lecturer/profile', icon: UserRoundCog },
    { label: 'Announcements', href: '/dashboard/lecturer/announcements', icon: Megaphone },
    { label: 'Departments & Students', href: '/dashboard/lecturer/class-reps', icon: Users },
    { label: 'Content Upload', href: '/dashboard/lecturer/content', icon: Upload },
    { label: 'Log Out', href: '/login', icon: LogOut, special: 'logout' },
  ],
};

export function getNavItems(role?: string): NavItem[] {
  const r = (role || '').toLowerCase();
  if (r === 'super_admin' || r === 'super') return dashboardNav.super_admin;
  if (r === 'school_admin' || r === 'school') return dashboardNav.school_admin;
  return dashboardNav.lecturer || [];
}


export const lecturerTopTabs = [
  { label: 'Dashboard', href: '/dashboard/lecturer', exact: true },
  { label: 'Profile', href: '/dashboard/lecturer/profile' },
  { label: 'Announcements', href: '/dashboard/lecturer/announcements' },
  { label: 'Class Reps & Students', href: '/dashboard/lecturer/class-reps' },
  { label: 'Content', href: '/dashboard/lecturer/content' },
  { label: 'Settings', href: '/dashboard/lecturer/settings' },
  { label: 'Help', href: '/dashboard/lecturer/help' },
];

export const lecturerQuickLinks = [
  { label: 'My Profile', href: '/dashboard/lecturer/profile', icon: UserRoundCog },
  { label: 'Settings', href: '/dashboard/lecturer/settings', icon: Settings },
  { label: 'Help', href: '/dashboard/lecturer/help', icon: HelpCircle },
];
