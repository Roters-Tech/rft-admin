import sys
from fpdf import FPDF

class RFT_PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        # Background rectangle for header in deep blue (#0F1E5A)
        self.set_fill_color(15, 30, 90)
        self.rect(0, 0, 210, 24, 'F')
        
        # Header Text
        self.set_text_color(255, 255, 255)
        self.set_font('helvetica', 'B', 10)
        self.set_xy(15, 7)
        self.cell(0, 5, 'RFT PLATFORM - ACADEMIC ADMINISTRATION SUITE', align='L')
        
        self.set_font('helvetica', 'I', 8)
        self.set_xy(15, 13)
        self.cell(0, 5, 'Technical System Implementation & Roadmap Documentation', align='L')
        
        self.set_font('helvetica', '', 8)
        self.set_xy(-55, 10)
        self.cell(40, 5, 'Version 1.0.0 | June 2026', align='R')
        
        # Bottom thin grey border below header
        self.set_fill_color(229, 231, 235)
        self.rect(0, 24, 210, 1, 'F')
        
        # Restore text color and positions
        self.set_text_color(0, 0, 0)
        self.set_xy(15, 32)
        
    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-18)
        # Top line for footer
        self.set_draw_color(229, 231, 235)
        self.line(15, self.get_y(), 195, self.get_y())
        
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(107, 114, 128)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', align='C')
        
        self.set_x(15)
        self.cell(0, 10, 'CONFIDENTIAL - RFT ADMIN PORTAL DOCUMENTATION', align='L')

def add_heading_1(pdf, text):
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 15)
    pdf.set_text_color(15, 30, 90) # Heading in deep blue (header color)
    pdf.cell(0, 8, text, ln=True)
    pdf.set_draw_color(15, 30, 90)
    pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 180, pdf.get_y())
    pdf.ln(4)
    pdf.set_text_color(0, 0, 0)

def add_heading_2(pdf, text):
    pdf.ln(3)
    pdf.set_font('helvetica', 'B', 11)
    pdf.set_text_color(55, 65, 81) # Dark gray heading
    pdf.cell(0, 6, text, ln=True)
    pdf.ln(1)
    pdf.set_text_color(0, 0, 0)

def add_paragraph(pdf, text):
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(31, 41, 55) # Off-black text
    pdf.multi_cell(0, 5, text)
    pdf.ln(2.5)

def add_bullet(pdf, title, text):
    pdf.set_font('helvetica', 'B', 9.5)
    pdf.set_text_color(31, 41, 55)
    pdf.set_x(20)
    pdf.cell(4, 5, '-', border=0)
    pdf.cell(pdf.get_string_width(title + ': '), 5, title + ': ', border=0)
    pdf.set_font('helvetica', '', 9.5)
    
    # Calculate width of title so we can adjust indent
    title_w = pdf.get_string_width(title + ': ')
    pdf.set_x(24 + title_w)
    pdf.multi_cell(0, 5, text)
    pdf.ln(1.5)

def add_table(pdf, headers, rows, col_widths):
    pdf.ln(2)
    pdf.set_font('helvetica', 'B', 9)
    pdf.set_fill_color(243, 244, 246)
    pdf.set_text_color(31, 41, 55)
    pdf.set_draw_color(209, 213, 219)
    
    # Header
    for header, width in zip(headers, col_widths):
        pdf.cell(width, 7, header, border=1, fill=True, align='L')
    pdf.ln()
    
    # Rows
    pdf.set_font('helvetica', '', 8.5)
    pdf.set_text_color(55, 65, 81)
    for row in rows:
        for cell, width in zip(row, col_widths):
            pdf.cell(width, 6.5, str(cell), border=1, align='L')
        pdf.ln()
    pdf.ln(3)

def generate_pdf():
    pdf = RFT_PDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(left=15, top=30, right=15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ------------------ COVER PAGE (Page 1) ------------------
    pdf.add_page()
    
    # Top Border Banner in Blue
    pdf.set_fill_color(15, 30, 90)
    pdf.rect(0, 0, 210, 15, 'F')
    
    # Decorative line
    pdf.set_fill_color(245, 158, 11) # Brand gold color accent
    pdf.rect(0, 15, 210, 2, 'F')
    
    # Cover Content
    pdf.set_xy(15, 55)
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, 'TECHNICAL IMPLEMENTATION REPORT & ROADMAP', ln=True)
    
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 26)
    pdf.set_text_color(15, 30, 90)
    pdf.multi_cell(0, 11, 'RFT Platform\nAdministrator Portal')
    
    pdf.ln(6)
    # Divider line
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 120, pdf.get_y())
    pdf.ln(6)
    
    pdf.set_font('helvetica', '', 11)
    pdf.set_text_color(55, 65, 81)
    desc = ("A comprehensive technical guide outlining the directory structure, "
            "implemented modules, role-based user interfaces, and the core functional "
            "architecture of the Next.js institutional management portal. Contains a "
            "detailed analysis of what is currently live and the future roadmap for production.")
    pdf.multi_cell(140, 6, desc)
    
    # Role scope indicators
    pdf.set_xy(15, 140)
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_text_color(15, 30, 90)
    pdf.cell(0, 5, 'IMPLEMENTATION SCOPE:', ln=True)
    pdf.ln(2)
    
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(55, 65, 81)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Super Administrator Portal - Global Network Control', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* School Administrator Portal - Campus-Level Academic Operations', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Lecturer Workspace - Course, Session, and Assessment Operations', ln=True)
    
    # Metadata Footer block
    pdf.set_xy(15, 230)
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    
    # Left Block
    pdf.set_font('helvetica', 'B', 9)
    pdf.set_text_color(75, 85, 99)
    pdf.cell(90, 5, 'DOCUMENT METADATA', ln=False)
    pdf.cell(90, 5, 'SYSTEM STACK INFO', ln=True)
    
    pdf.set_font('helvetica', '', 8.5)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(90, 4, 'Author: Core Architecture Team', ln=False)
    pdf.cell(90, 4, 'Framework: Next.js 16.2.2 (App Router)', ln=True)
    
    pdf.cell(90, 4, 'Version: 1.0.0 (Release-Ready)', ln=False)
    pdf.cell(90, 4, 'Runtime: React 19.2.4 / TypeScript 5.7', ln=True)
    
    pdf.cell(90, 4, 'Date: June 2026', ln=False)
    pdf.cell(90, 4, 'Styling: Tailwind CSS 3.4.17', ln=True)
    
    # ------------------ PAGE 2: TABLE OF CONTENTS & SUMMARY ------------------
    pdf.add_page()
    add_heading_1(pdf, '1. Executive Summary & Tech Stack')
    
    add_heading_2(pdf, 'Executive Summary')
    summary_text = (
        "The RFT Platform Administrator Portal is a highly customized, web-based management suite "
        "designed to handle the hierarchical academic administration of universities, faculties, and courses. "
        "The portal is structured around three primary roles (Super Administrator, School Administrator, and Lecturer) "
        "allowing granular operations from global multi-campus billing and onboarding down to individual class "
        "scheduling and student representative coordination.\n\n"
        "This document lists the architectural structure of the codebase, details the design systems and modules "
        "currently implemented in the demo environment, and provides a clear technical roadmap outlining the necessary "
        "back-end integrations and security measures left to be implemented for full production deployment."
    )
    add_paragraph(pdf, summary_text)
    
    add_heading_2(pdf, 'Core Technology Stack')
    tech_text = (
        "The application is built using modern, stable web standards to guarantee fast performance, "
        "reusability, and layout stability. The technical stack comprises:"
    )
    add_paragraph(pdf, tech_text)
    
    add_bullet(pdf, 'Next.js 16 (App Router)', 'Used for handling directory-based routing, layout inheritance, and optimized bundle sizes.')
    add_bullet(pdf, 'React 19 & TypeScript 5', 'Ensures strict type-safety across components, custom hooks, and platform schemas.')
    add_bullet(pdf, 'Tailwind CSS 3', 'Powers the visual design system, layout boundaries, responsive breakpoints, and animations.')
    add_bullet(pdf, 'Recharts', 'A composable charting library integrated into the lecturer and administration dashboards to visualize grading trends.')
    add_bullet(pdf, 'Lucide React', 'A standard icon package for visual iconography matching the styling structure.')

    # ------------------ PAGE 3: CODEBASE DIRECTORY STRUCTURE ------------------
    pdf.add_page()
    add_heading_1(pdf, '2. Codebase Architecture & Filesystem')
    
    arch_text = (
        "The repository follows a clean Next.js App Router structure where routes are organized in groups, "
        "and modular logic is isolated in directory containers under components, hooks, lib, and types. "
        "Below is an overview of the directory structure:"
    )
    add_paragraph(pdf, arch_text)
    
    # We write a simplified directory layout inside a preformatted block or list
    dir_structure = [
        ['/app', 'Root directory for routes, layouts, global styles, and page entrypoints.'],
        ['  (auth)/login', 'Authentication page rendering the login interface and user selection.'],
        ['  (dashboard)/layout.tsx', 'Dashboard layout shell inherited by all administrator roles.'],
        ['  (dashboard)/dashboard/super', 'Super Administrator workspaces (schools, onboarding, fees, roles, analytics).'],
        ['  (dashboard)/dashboard/school', 'School Administrator workspaces (faculties, courses, levels, lecturers, students).'],
        ['  (dashboard)/dashboard/lecturer', 'Lecturer workspaces (enrollment, class-reps, content, assessments, schedule).'],
        ['/components', 'Modular UI system, dashboard elements, and layout containers.'],
        ['  /auth', 'LoginForm and MockCredentials listing.'],
        ['  /dashboard', 'Reusable admin elements like FacultyTable, StatsCard, ContentUploadPanel.'],
        ['  /layout', 'Core layout containers: Sidebar, MobileSidebar, Topbar, and Logo markers.'],
        ['  /lecturer', 'Lecturer components: AssignedCoursesTable, PerformanceChart, ClassRepsPanel.'],
        ['  /ui', 'Atomic UI components: MetricCard, SimpleTable, FormField, Modal, AppButton, StatusBadge.'],
        ['  /demo', 'Functional onboarding, queue widgets, and assessment constructor blocks.'],
        ['/hooks', 'Custom client-side hooks: useAuth (session management) and useSidebar.'],
        ['/lib', 'Mock database schemas (mock-users.ts) and platform configuration (navigation.ts).'],
        ['/types', 'Global TypeScript interface files and role enumerations.']
    ]
    
    add_table(pdf, ['Path / Directory', 'Role & Technical Purpose'], dir_structure, [55, 125])
    
    add_heading_2(pdf, 'State Management & Helper Utilities')
    state_text = (
        "All client-side states such as sidebar collapsible behavior, authentication parameters, and visual "
        "toast alerts are handled using React context providers (e.g., ToastProvider.tsx) and local storage "
        "cache updates. Mock database values are imported as static JSON objects to render realistic records "
        "and metrics during demonstrations, maintaining complete separation between the UI and mock layers."
    )
    add_paragraph(pdf, state_text)

    # ------------------ PAGE 4: IMPLEMENTED MODULES (PART 1) ------------------
    pdf.add_page()
    add_heading_1(pdf, '3. Implemented Modules: Auth & Super Admin')
    
    intro_p = (
        "The following modules have been fully implemented, styled with custom styling (dark-blue/gold/glassmorphism), "
        "and populated with functional demo data. They are live and ready for production API integration."
    )
    add_paragraph(pdf, intro_p)
    
    add_heading_2(pdf, 'Authentication & Session Guards')
    add_paragraph(pdf, 
        "The authentication interface (/login) provides credential inputs, mock password toggling, "
        "and a 'Mock Accounts' quick-select panel (LoginForm.tsx). A custom hook (useAuth.ts) reads mock-users.ts "
        "and performs credentials validation. Upon successful authentication, cookies are set ('rft_user', 'rft_role') "
        "and the user is redirected to the role-specific route container. Front-end protection blocks access to dashboard "
        "sub-routes if the user session cookie is missing."
    )
    
    add_heading_2(pdf, 'Super Administrator Portal (/dashboard/super/*)')
    super_p = (
        "The Super Admin role supervises the global network of universities, manages pricing plans, "
        "authorizes accounts, and reviews general metrics. Key sub-modules include:"
    )
    add_paragraph(pdf, super_p)
    
    add_bullet(pdf, 'Global Dashboard', 'Displays overview cards (Total Schools: 24, Lecturers: 1,204, Active Students: 48,921) and school overview tables.')
    add_bullet(pdf, 'School Directory', 'A dynamic list (/super/schools) showing capacity metrics, location pins, and current plans with custom Action Menus.')
    add_bullet(pdf, 'Onboarding Workspace', 'A detailed, multi-section form (/super/onboarding) supporting general details, admin credentials, and tier-specific setup fee calculations.')
    add_bullet(pdf, 'Subscription & Fees Workspace', 'A complete billing workspace (/super/fees) showcasing Tier Cards (Free, Premium, Enterprise), recent transactional tables, and billing stats.')
    add_bullet(pdf, 'User Access & Roles', 'An access provisioning dashboard (/super/roles) for mapping Full Names, Staff IDs, and system roles directly to specific university nodes.')
    add_bullet(pdf, 'Global Analytics', 'Summarizes network metrics and provides visual distribution grids.')

    # ------------------ PAGE 5: IMPLEMENTED MODULES (PART 2) ------------------
    pdf.add_page()
    add_heading_1(pdf, '4. Implemented Modules: School Admin & Lecturer')
    
    add_heading_2(pdf, 'School Administrator Portal (/dashboard/school/*)')
    school_p = (
        "The School Admin role administers campus-level records, manages departmental faculties, "
        "coordinates teaching staff, and oversees student intakes. Main modules include:"
    )
    add_paragraph(pdf, school_p)
    
    add_bullet(pdf, 'Metrics Overview', 'Key KPIs (Students: 12,482, Lecturers: 845, Active Courses: 216) and distribution buttons for academic levels.')
    add_bullet(pdf, 'Faculty Operations', 'A loading grid (/school/faculties) detailing lecturer allocations, student enrollment pressure, and academic health status metrics.')
    add_bullet(pdf, 'Level Management', 'Provides detailed progress summaries from 100L up to 400L.')
    add_bullet(pdf, 'Course Portfolio', 'A structured table (/school/courses) mapping Course Codes, Levels, Type (Core vs Advanced), and Class Rep designations.')
    add_bullet(pdf, 'Lecturer Directory', 'A directory (/school/lecturers) for verifying and adding teaching staff.')
    add_bullet(pdf, 'Students & Class Reps Workspace', 'Combines intake verification queues and communication lead assignment panels.')
    add_bullet(pdf, 'Institutional Content Library', 'A repository (/school/content) for sharing syllabus guidelines, policies, and campus notice packs.')
    
    add_heading_2(pdf, 'Lecturer Workspace (/dashboard/lecturer/*)')
    lect_p = (
        "The Lecturer workspace supports day-to-day academic operations, class scheduling, "
        "and grading assessments. Main modules include:"
    )
    add_paragraph(pdf, lect_p)
    
    add_bullet(pdf, 'Course Dashboard', 'Displays assigned courses (GST101, LAW302, etc.), pending actions, and mid-term performance trends.')
    add_bullet(pdf, 'Recharts Performance Analytics', 'A bar chart displaying average grades across courses, visual ranking, and pending reviews.')
    add_bullet(pdf, 'Class Scheduling Form', 'A constructor (/lecturer/schedule) for creating sessions, setting venue parameters, and configuring audience notifications.')
    add_bullet(pdf, 'Assessment Builder', 'A setup panel (/lecturer/assessments) for configuring quizzes, assignments, and exam formats (Timed CBT, Portal Upload).')
    add_bullet(pdf, 'Student Enrollment & Class Reps', 'Views for class representative coordination and monitoring active registrations.')

    # ------------------ PAGE 6: WHAT IS LEFT (ROADMAP) ------------------
    pdf.add_page()
    add_heading_1(pdf, '5. Technical Gaps & Future Roadmap')
    
    roadmap_intro = (
        "To transform the current front-end portal into a secure, production-grade application, "
        "the following gaps must be addressed in the next phase of development:"
    )
    add_paragraph(pdf, roadmap_intro)
    
    add_heading_2(pdf, '1. Persistent Database Integration')
    db_text = (
        "Currently, all pages read from hardcoded arrays in the lib/ folder. Changes made inside "
        "forms (e.g., creating a course, adding a lecturer, onboarding a school) only show ephemeral toast alerts. "
        "The system requires connection to a relational database (such as PostgreSQL) with Prisma ORM to save, "
        "update, and delete real institutional records."
    )
    add_paragraph(pdf, db_text)
    
    add_heading_2(pdf, '2. Server-Side Authentication & Middleware Route Protection')
    auth_gap = (
        "The present authentication gate (useAuth.ts) operates in React client-side lifecycle hooks. "
        "This allows unauthorized users to temporarily render layout shells before redirects trigger. "
        "A Next.js Server Middleware (middleware.ts) must be written to read secure session tokens, "
        "validate JWTs, and handle server-side redirects before pages reach the browser."
    )
    add_paragraph(pdf, auth_gap)
    
    add_heading_2(pdf, '3. Strict Role-Based Access Controls (RBAC)')
    rbac_gap = (
        "The app router relies on folder paths to separate roles, but does not strictly validate if a user "
        "with lecturer cookies attempts to manually access /dashboard/super. Server-side validation logic or Next.js "
        "Layout guards must be added to verify that the active user's role exactly matches the target path segment."
    )
    add_paragraph(pdf, rbac_gap)
    
    add_heading_2(pdf, '4. File Storage Service Integration')
    upload_gap = (
        "The content upload modules are visual placeholders. The next step is integrating cloud object "
        "storage (AWS S3, Google Cloud Storage, or Vercel Blob) to support syllabus and lecture slide file uploads."
    )
    add_paragraph(pdf, upload_gap)
    
    add_heading_2(pdf, '5. Billing Gateway & Payment Processor Integration')
    payment_gap = (
        "Subscription cards and transactional lists must be backed by a payment gateway API (e.g., Paystack, Flutterwave) "
        "to manage institutional renewal billing, webhook events, and automate Tier adjustments."
    )
    add_paragraph(pdf, payment_gap)

    # ------------------ PAGE 7: VERIFICATION & SETUP ------------------
    pdf.add_page()
    add_heading_1(pdf, '6. Verification & Local Verification')
    
    setup_intro = (
        "The project is ready for local verification. Review the guidelines below to execute "
        "the development server and test user flows:"
    )
    add_paragraph(pdf, setup_intro)
    
    add_heading_2(pdf, 'Local Installation Commands')
    setup_commands = (
        "Execute these commands in the terminal to initialize dependencies and spin up the project:\n\n"
        "  # Install dependencies\n"
        "  npm install\n\n"
        "  # Spin up the development server\n"
        "  npm run dev"
    )
    add_paragraph(pdf, setup_commands)
    
    add_heading_2(pdf, 'Role Verification Checklist')
    chk_text = (
        "Log in as one of the following mock accounts to verify specific dashboard behavior:\n"
        "  - Super Admin: Email 'super@rft.edu' | Password 'super123'\n"
        "    Check if the global university management tables, subscriptions, and roles are visible.\n"
        "  - School Admin: Email 'admin@maincampus.edu' | Password 'admin123'\n"
        "    Check if metrics match 'Main Campus' data, and verify lecturers and student levels are active.\n"
        "  - Lecturer: Email 'lecturer@rft.edu' | Password 'lecturer123'\n"
        "    Check course schedule, create assessment constructor, and check performance chart components."
    )
    add_paragraph(pdf, chk_text)
    
    add_heading_2(pdf, 'Aesthetic & Visual Guidelines')
    visual_text = (
        "All components follow a strict design system defined in tailwind.config.ts and app/globals.css:\n"
        "  - Primary Theme Colors: Deep Navy (#0F1E5A) and Soft Gold (#D4AF37).\n"
        "  - Background: Multi-stage blue-gray gradient background.\n"
        "  - Accent colors are strictly restricted. Text has been kept strictly black, gray, or white "
        "according to design requirements (no red texts are permitted; only neutral color scales are used)."
    )
    add_paragraph(pdf, visual_text)
    
    # Save PDF
    pdf.output('RFT_Admin_Technical_Documentation.pdf', 'F')
    print('PDF Technical Documentation generated successfully.')

if __name__ == '__main__':
    generate_pdf()
