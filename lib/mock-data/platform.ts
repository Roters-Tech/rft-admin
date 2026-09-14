import { Course, Lecturer, School } from '@/types';

export const platformSchools: School[] = [
  {
    id: '1',
    name: 'University of Lagos (UNILAG)',
    dean: 'Prof. Folasade Ogunsola',
    location: 'Akoka, Lagos, Nigeria',
    students: 12482,
    lecturers: 245,
    courses: 86,
    status: 'optimal',
  },
  {
    id: '2',
    name: 'University of Ibadan (UI)',
    dean: 'Prof. Kayode Adebowale',
    location: 'Ibadan, Oyo State',
    students: 14150,
    lecturers: 310,
    courses: 112,
    status: 'optimal',
  },
  {
    id: '3',
    name: 'Obafemi Awolowo University (OAU)',
    dean: 'Prof. Simeon Bamire',
    location: 'Ile-Ife, Osun State',
    students: 11890,
    lecturers: 267,
    courses: 94,
    status: 'growing',
  },
  {
    id: '4',
    name: 'Ahmadu Bello University (ABU)',
    dean: 'Prof. Kabiru Bala',
    location: 'Zaria, Kaduna State',
    students: 15200,
    lecturers: 340,
    courses: 128,
    status: 'optimal',
  },
];


export const roleAssignments = [
  {
    name: 'Dr. James Okafor',
    email: 'admin@maincampus.edu',
    phone: '+234 801 110 2200',
    staffId: 'RFT-ADM-001',
    role: 'School Admin',
    school: 'Main Campus',
  },
  {
    name: 'Dr. Helena Vance',
    email: 'hvance@lawcampus.edu',
    phone: '+234 809 440 8801',
    staffId: 'RFT-LEC-118',
    role: 'Lecturer',
    school: 'Faculty of Law',
  },
  {
    name: 'Prof. Marcus Thorne',
    email: 'mthorne@lawcampus.edu',
    phone: '+234 817 500 9001',
    staffId: 'RFT-ADM-042',
    role: 'School Admin',
    school: 'Faculty of Law',
  },
];

export const subscriptionTiers = [
  {
    name: 'Free',
    price: '₦0 / month',
    access: ['School onboarding', 'Basic dashboard metrics', 'Up to 2 admin users'],
  },
  {
    name: 'Premium',
    price: '₦499,000 / month',
    access: ['Unlimited admins & lecturers', 'Advanced analytics', 'Assessment workflows', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: '₦1,499,000 / month',
    access: ['Multi-campus structure', 'Custom integrations', 'Dedicated success manager', 'White-label reporting'],
  },
];

export const platformLecturers: Lecturer[] = [
  { id: 'lec-001', name: 'Dr. Helena Vance', department: 'Applied Physics', initials: 'HV', title: 'Head of Department' },
  { id: 'lec-002', name: 'Prof. Marcus Thorne', department: 'International Law', initials: 'MT', title: 'Dean of Law' },
  { id: 'lec-003', name: 'Dr. Sophia Adebayo', department: 'Clinical Sciences', initials: 'SA', title: 'Course Coordinator' },
  { id: 'lec-004', name: 'Dr. Daniel Scott', department: 'Mechanical Engineering', initials: 'DS', title: 'Assessment Lead' },
];

export const platformCourses: Course[] = [
  {
    id: 'cou-001',
    code: 'GST101',
    name: 'Communication in English',
    level: 'Level 100',
    module: 'Core Module',
    enrollment: 680,
    enrollmentTrend: '+6%',
    trendType: 'positive',
    classRep: 'Mercy Cole',
    classRepInitials: 'MC',
    performance: 88,
    icon: 'book',
  },
  {
    id: 'cou-002',
    code: 'LAW302',
    name: 'Constitutional Practice',
    level: 'Level 300',
    module: 'Core Module',
    enrollment: 210,
    enrollmentTrend: 'Stable',
    trendType: 'neutral',
    classRep: 'Ayo Thomas',
    classRepInitials: 'AT',
    performance: 74,
    icon: 'code',
  },
  {
    id: 'cou-003',
    code: 'MED401',
    name: 'Clinical Diagnostics',
    level: 'Level 400',
    module: 'Advanced Module',
    enrollment: 145,
    enrollmentTrend: '-3%',
    trendType: 'negative',
    classRep: 'Lina Khan',
    classRepInitials: 'LK',
    performance: 59,
    icon: 'brain',
  },
];

export const onboardingSteps = [
  { title: 'Institution Profile', description: 'Create the school record, campus metadata, and branding settings.' },
  { title: 'Faculty & Levels', description: 'Map faculties, admission levels, and departmental capacity plans.' },
  { title: 'Lecturer Access', description: 'Assign admin roles, lecturer permissions, and verification states.' },
  { title: 'Student Launch', description: 'Import students, assign class reps, and enable course registration.' },
];

export const classRepAssignments = [
  { course: 'CS101', rep: 'Jane Smith', engagement: 'High', channel: 'Telegram Broadcast' },
  { course: 'DB105', rep: 'Alex Miller', engagement: 'Moderate', channel: 'Email List' },
  { course: 'AL302', rep: 'Lina Khan', engagement: 'High', channel: 'Class Portal' },
  { course: 'DS204', rep: 'Ruth Owen', engagement: 'High', channel: 'Telegram Broadcast' },
];

export const admissionQueue = [
  { id: 'ad-001', student: 'Esther Johnson', program: 'Computer Science', level: '100L', status: 'Documents Verified' },
  { id: 'ad-002', student: 'Tobi Mensah', program: 'Political Science', level: '200L', status: 'Pending Fee Clearance' },
  { id: 'ad-003', student: 'Abigail Dean', program: 'Nursing', level: '100L', status: 'Ready For Approval' },
];

export const contentLibrary = [
  { title: 'Faculty Orientation Pack', owner: 'Academic Affairs', updated: '2 hours ago', visibility: 'Platform' },
  { title: 'Assessment Policy 2026', owner: 'Quality Assurance', updated: 'Yesterday', visibility: 'Main Campus' },
  { title: 'Lecture Capture Standards', owner: 'Digital Learning', updated: '3 days ago', visibility: 'Faculty' },
];
