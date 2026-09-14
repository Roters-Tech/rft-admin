import { LucideIcon } from 'lucide-react';

export type Role = 'super_admin' | 'school_admin' | 'lecturer';

export interface User {
  id: string;
  email: string;
  password?: string;
  role: Role;
  name: string;
  title: string;
  school: string;
  schoolId?: string;
  departmentId?: string;
  department?: { id: string; name: string } | null;
  avatar: string | null;
}

export interface School {
  id: string;
  name: string;
  dean?: string;
  location?: string;
  students: number;
  lecturers: number;
  courses: number;
  status: 'optimal' | 'growing' | 'critical';
}

export interface Lecturer {
  id: string;
  name: string;
  department: string;
  initials: string;
  title?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  level: string;
  module: string;
  enrollment: number;
  enrollmentTrend: string;
  trendType: 'positive' | 'neutral' | 'negative';
  classRep: string;
  classRepInitials: string;
  performance: number;
  icon: 'code' | 'database' | 'brain' | 'book';
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  special?: 'cta' | 'logout';
  exact?: boolean;
}

export interface ToastItem {
  id: string;
  title: string;
  type: 'success' | 'error';
}
