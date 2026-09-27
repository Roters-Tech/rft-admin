'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  Command,
  Building2,
  BookOpen,
  Users,
  Megaphone,
  Upload,
  CreditCard,
  UserRoundCog,
  MessageSquare,
  LineChart,
  FileText,
  GraduationCap,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Role } from '@/types';
import { adminApiRequest } from '@/lib/apiClient';

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  category: 'Navigation' | 'Actions' | 'Live Data';
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
}

interface GlobalSearchBarProps {
  role: Role;
  isSuperAdmin?: boolean;
}

export function GlobalSearchBar({ role, isSuperAdmin }: GlobalSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [liveSchools, setLiveSchools] = useState<any[]>([]);
  const [liveCourses, setLiveCourses] = useState<any[]>([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mobileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch dynamic search items on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchEntities() {
      try {
        if (role === 'super_admin') {
          const schools = await adminApiRequest('/schools/public').catch(() => []);
          if (isMounted && Array.isArray(schools)) {
            setLiveSchools(schools);
          }
        } else {
          const courses = await adminApiRequest('/courses/public').catch(() => []);
          if (isMounted && Array.isArray(courses)) {
            setLiveCourses(courses);
          }
        }
      } catch (e) {
        // fail silently for offline/cached states
      }
    }
    fetchEntities();
    return () => {
      isMounted = false;
    };
  }, [role]);

  // Base static items per role
  const staticItems: SearchItem[] = useMemo(() => {
    if (role === 'super_admin') {
      return [
        {
          id: 'super-overview',
          title: 'System Overview Dashboard',
          subtitle: 'Global metrics, active institutions, and platform health',
          href: '/dashboard/super',
          category: 'Navigation',
          icon: LayoutDashboard,
          keywords: ['home', 'kpi', 'revenue', 'overview', 'stats', 'admin'],
        },
        {
          id: 'super-schools',
          title: 'Schools & Institutions',
          subtitle: 'Manage registered universities, polytechnics, and colleges',
          href: '/dashboard/super/schools',
          category: 'Navigation',
          icon: Building2,
          keywords: ['institutions', 'colleges', 'university', 'campus', 'schools'],
        },
        {
          id: 'super-fees',
          title: 'Subscriptions & Billing Tiers',
          subtitle: 'Institutional fee structure, billing tiers, and payment status',
          href: '/dashboard/super/fees',
          category: 'Navigation',
          icon: CreditCard,
          keywords: ['pricing', 'plans', 'subscriptions', 'fees', 'paystack', 'billing'],
        },
        {
          id: 'super-roles',
          title: 'User Roles & Permissions',
          subtitle: 'Super admins, institutional managers, and access levels',
          href: '/dashboard/super/roles',
          category: 'Navigation',
          icon: UserRoundCog,
          keywords: ['users', 'roles', 'permissions', 'staff', 'admins', 'security'],
        },
        {
          id: 'super-messages',
          title: 'Anonymous Feedback & Messages',
          subtitle: 'Cross-institutional student submissions and safety inquiries',
          href: '/dashboard/super/messages',
          category: 'Navigation',
          icon: MessageSquare,
          keywords: ['anonymous', 'inbox', 'student messages', 'reports', 'feedback'],
        },
        {
          id: 'super-announcements',
          title: 'Platform Announcements',
          subtitle: 'Broadcast platform notices and school-specific bulletins',
          href: '/dashboard/super/announcements',
          category: 'Navigation',
          icon: Megaphone,
          keywords: ['announcements', 'broadcast', 'bulletin', 'news', 'notice', 'edit announcement'],
        },
        {
          id: 'super-analytics',
          title: 'Global Analytics & Growth',
          subtitle: 'Platform usage trends, engagement metrics, and growth reports',
          href: '/dashboard/super/analytics',
          category: 'Navigation',
          icon: LineChart,
          keywords: ['charts', 'growth', 'usage', 'metrics', 'analytics', 'reports'],
        },
        // Super Admin Quick Actions
        {
          id: 'act-new-school',
          title: 'Register New Institution',
          subtitle: 'Add a new university or college to the RFT platform',
          href: '/dashboard/super/schools',
          category: 'Actions',
          icon: Building2,
          keywords: ['create school', 'add school', 'new institution', 'onboard'],
        },
        {
          id: 'act-view-fees',
          title: 'Audit Subscription Revenue',
          subtitle: 'Review institutional revenue and invoice settlements',
          href: '/dashboard/super/fees',
          category: 'Actions',
          icon: Sparkles,
          keywords: ['revenue', 'audit', 'money', 'payments', 'earnings'],
        },
      ];
    }

    if (role === 'school_admin') {
      return [
        {
          id: 'school-overview',
          title: 'Campus Overview Dashboard',
          subtitle: 'Department metrics, active students, and faculty activity',
          href: '/dashboard/school',
          category: 'Navigation',
          icon: LayoutDashboard,
          keywords: ['home', 'overview', 'kpi', 'dashboard', 'campus'],
        },
        {
          id: 'school-faculties',
          title: 'Faculties & Departments',
          subtitle: 'Manage academic faculties, departments, and course curricula',
          href: '/dashboard/school/faculties',
          category: 'Navigation',
          icon: Building2,
          keywords: ['faculties', 'departments', 'curriculum', 'degrees', 'units'],
        },
        {
          id: 'school-lecturers',
          title: 'Lecturers Directory',
          subtitle: 'Faculty staff, assigned courses, and lecturer onboarding',
          href: '/dashboard/school/lecturers',
          category: 'Navigation',
          icon: GraduationCap,
          keywords: ['teachers', 'staff', 'professors', 'instructors', 'lecturers'],
        },
        {
          id: 'school-students',
          title: 'Student Registry',
          subtitle: 'Enrolled students, matric numbers, and academic levels',
          href: '/dashboard/school/students',
          category: 'Navigation',
          icon: Users,
          keywords: ['students', 'matric', 'cohorts', 'enrollment', 'users'],
        },
        {
          id: 'school-announcements',
          title: 'Campus Announcements',
          subtitle: 'Official broadcast notices, updates, and news bulletins',
          href: '/dashboard/school/announcements',
          category: 'Navigation',
          icon: Megaphone,
          keywords: ['news', 'broadcasts', 'notices', 'alerts', 'announcements'],
        },
        /*
        {
          id: 'school-messages',
          title: 'Anonymous Student Messages',
          subtitle: 'Review and address confidential student inquiries',
          href: '/dashboard/school/messages',
          category: 'Navigation',
          icon: MessageSquare,
          keywords: ['inbox', 'anonymous', 'feedback', 'student inquiries', 'complaints'],
        },
        */
        {
          id: 'school-content',
          title: 'Academic Content & Past Questions',
          subtitle: 'Course materials, teaching slides, and past papers',
          href: '/dashboard/school/content',
          category: 'Navigation',
          icon: FileText,
          keywords: ['materials', 'slides', 'past questions', 'documents', 'library'],
        },
        {
          id: 'school-billing',
          title: 'Billing & License Subscriptions',
          subtitle: 'Manage institutional tier, invoices, and payment renewals',
          href: '/dashboard/school/billing',
          category: 'Navigation',
          icon: CreditCard,
          keywords: ['subscription', 'paystack', 'license', 'billing', 'plan'],
        },
        // Quick Actions
        {
          id: 'act-broadcast',
          title: 'Broadcast Announcement',
          subtitle: 'Send an instant campus-wide or faculty alert',
          href: '/dashboard/school/announcements',
          category: 'Actions',
          icon: Megaphone,
          keywords: ['new announcement', 'post notice', 'broadcast', 'send alert'],
        },
        {
          id: 'act-upload-content',
          title: 'Upload Study Material / Past Question',
          subtitle: 'Publish academic PDF, docx, or slides for students',
          href: '/dashboard/school/content',
          category: 'Actions',
          icon: Upload,
          keywords: ['upload', 'add material', 'new document', 'add past question'],
        },
      ];
    }

    // Lecturer Role
    return [
      {
        id: 'lec-courses',
        title: 'My Teaching Courses',
        subtitle: 'Assigned courses, syllabi, and active student cohorts',
        href: '/dashboard/lecturer',
        category: 'Navigation',
        icon: BookOpen,
        keywords: ['courses', 'classes', 'teaching', 'lectures', 'subjects'],
      },
      {
        id: 'lec-profile',
        title: 'My Profile & Portfolio',
        subtitle: 'Academic bio, certifications, achievements, and upload stats',
        href: '/dashboard/lecturer/profile',
        category: 'Navigation',
        icon: UserRoundCog,
        keywords: ['profile', 'bio', 'certifications', 'achievements', 'portfolio', 'cv', 'experience', 'my profile'],
      },
      {
        id: 'lec-announcements',
        title: 'Course Announcements',
        subtitle: 'Post updates, assignment notices, and schedule changes',
        href: '/dashboard/lecturer/announcements',
        category: 'Navigation',
        icon: Megaphone,
        keywords: ['announcements', 'notices', 'alerts', 'reminders', 'broadcasts'],
      },
      {
        id: 'lec-class-reps',
        title: 'Departments & Class Representatives',
        subtitle: 'Designate class reps and monitor student cohorts',
        href: '/dashboard/lecturer/class-reps',
        category: 'Navigation',
        icon: Users,
        keywords: ['class reps', 'representatives', 'cohorts', 'students', 'departments'],
      },
      {
        id: 'lec-content',
        title: 'Upload Course Materials',
        subtitle: 'Upload lecture slides, tutorial notes, and past exams',
        href: '/dashboard/lecturer/content',
        category: 'Navigation',
        icon: Upload,
        keywords: ['upload', 'slides', 'past questions', 'notes', 'resources', 'pdf'],
      },
      {
        id: 'lec-settings',
        title: 'Lecturer Settings',
        subtitle: 'Profile details, credentials, and notification preferences',
        href: '/dashboard/lecturer/settings',
        category: 'Navigation',
        icon: Settings,
        keywords: ['settings', 'profile', 'password', 'notifications', 'account'],
      },
      {
        id: 'lec-help',
        title: 'Help & Lecturer Guide',
        subtitle: 'Platform tutorials, FAQs, and support channels',
        href: '/dashboard/lecturer/help',
        category: 'Navigation',
        icon: HelpCircle,
        keywords: ['help', 'support', 'documentation', 'guide', 'faqs'],
      },
      // Quick Actions
      {
        id: 'act-lec-upload',
        title: 'Upload Lecture Slides / Notes',
        subtitle: 'Publish new academic document or past question',
        href: '/dashboard/lecturer/content',
        category: 'Actions',
        icon: Upload,
        keywords: ['upload note', 'add slides', 'new past question'],
      },
      {
        id: 'act-lec-announcement',
        title: 'Post New Course Notice',
        subtitle: 'Notify all enrolled students immediately',
        href: '/dashboard/lecturer/announcements',
        category: 'Actions',
        icon: Megaphone,
        keywords: ['new announcement', 'post notice', 'alert students'],
      },
    ];
  }, [role]);

  // Combine static items with live data entities
  const allSearchableItems: SearchItem[] = useMemo(() => {
    const items = [...staticItems];

    if (role === 'super_admin' && liveSchools.length > 0) {
      liveSchools.forEach((s) => {
        items.push({
          id: `school-${s.id}`,
          title: s.name,
          subtitle: `Institutional Code: ${s.code || 'INST'} • Type: ${s.type || 'University'}`,
          href: `/dashboard/super/schools`,
          category: 'Live Data',
          icon: Building2,
          keywords: [s.name, s.code || '', s.type || '', 'school'],
        });
      });
    } else if (liveCourses.length > 0) {
      liveCourses.forEach((c) => {
        items.push({
          id: `course-${c.id}`,
          title: `${c.code ? `${c.code}: ` : ''}${c.name}`,
          subtitle: `Level: ${c.level || '100'} • Units: ${c.units || c.creditUnits || 3}`,
          href: role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/school/faculties',
          category: 'Live Data',
          icon: BookOpen,
          keywords: [c.name, c.code || '', c.department?.name || '', 'course'],
        });
      });
    }

    return items;
  }, [staticItems, role, liveSchools, liveCourses]);

  // Filtered search results
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      // Default recommended quick items
      return allSearchableItems.slice(0, 8);
    }

    return allSearchableItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(trimmed);
      const matchSub = item.subtitle?.toLowerCase().includes(trimmed);
      const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(trimmed));
      return matchTitle || matchSub || matchKeywords;
    });
  }, [query, allSearchableItems]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K / slash)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (item: SearchItem) => {
    setIsOpen(false);
    setIsMobileOpen(false);
    setQuery('');
    router.push(item.href);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected) {
        handleSelect(selected);
      }
    }
  };

  const placeholderText = isSuperAdmin
    ? 'Search schools, fees, metrics, users... (⌘K)'
    : role === 'school_admin'
    ? 'Search departments, lecturers, content... (⌘K)'
    : 'Search my courses, slides, announcements... (⌘K)';

  return (
    <>
      {/* Desktop Search Bar */}
      <div ref={containerRef} className="relative hidden flex-1 max-w-md lg:block mx-4">
        <div
          className={`flex items-center rounded-xl border px-3.5 py-2 transition-all duration-200 ${
            isOpen
              ? 'border-brand-navy/40 bg-white ring-2 ring-brand-navy/10 shadow-sm'
              : isSuperAdmin
              ? 'border-[#edf0fb] bg-[#f5f6fb] hover:bg-white hover:border-gray-200'
              : 'border-gray-200/80 bg-gray-50 hover:bg-white hover:border-gray-300'
          }`}
        >
          <Search className="mr-2.5 h-4 w-4 text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholderText}
            className="w-full bg-transparent text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
          />

          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-text-muted hover:bg-gray-200/60 hover:text-text-primary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-text-muted shadow-xs">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          )}
        </div>

        {/* Desktop Search Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in">
            {filteredResults.length === 0 ? (
              <div className="py-8 text-center">
                <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-text-primary">No matching results</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Try searching for a course code, school name, or page title
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {query.trim() ? (
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    Search Results ({filteredResults.length})
                  </div>
                ) : (
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                    <span>Quick Navigation & Actions</span>
                    <span className="text-[10px] font-normal normal-case">Use ↑↓ to navigate</span>
                  </div>
                )}

                {filteredResults.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                        isSelected
                          ? 'bg-brand-navy/5 text-brand-navy'
                          : 'text-text-primary hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isSelected
                              ? 'bg-brand-navy text-white shadow-xs'
                              : 'bg-gray-100 text-text-secondary'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? 'text-brand-navy font-bold' : ''}`}>
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-[11px] text-text-secondary truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            item.category === 'Actions'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : item.category === 'Live Data'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {item.category}
                        </span>
                        <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? 'translate-x-0.5 text-brand-navy' : 'text-gray-300'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Search Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsMobileOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        }}
        className="rounded-lg p-2 text-text-secondary hover:bg-gray-100 lg:hidden"
        title="Search dashboard"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile Fullscreen Search Modal */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs lg:hidden animate-fade-in">
          <div className="min-h-screen bg-white p-4 pt-6">
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <Search className="h-5 w-5 text-text-muted" />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isSuperAdmin ? 'Global search...' : 'Search dashboard...'}
                className="flex-1 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileOpen(false);
                  setQuery('');
                }}
                className="rounded-lg bg-gray-100 p-2 text-text-secondary hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 max-h-[calc(100vh-120px)] overflow-y-auto space-y-2 pb-10">
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm font-semibold text-text-primary">No results found</p>
                  <p className="text-xs text-text-secondary mt-1">Try another search keyword</p>
                </div>
              ) : (
                filteredResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-left shadow-xs active:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
                          {item.subtitle && (
                            <p className="text-xs text-text-secondary truncate mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                      </div>
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 shrink-0 ml-2">
                        {item.category}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
