import sys
from fpdf import FPDF

class RFT_Backend_PDF(FPDF):
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
        self.cell(0, 5, 'RFT PLATFORM - CENTRAL BACKEND SERVICES', align='L')
        
        self.set_font('helvetica', 'I', 8)
        self.set_xy(15, 13)
        self.cell(0, 5, 'Backend Core Architecture & Detailed API Endpoint Roadmap', align='L')
        
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
        self.cell(0, 10, 'CONFIDENTIAL - RFT BACKEND SYSTEM DOCUMENTATION', align='L')

def add_heading_1(pdf, text):
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 15)
    pdf.set_text_color(15, 30, 90) # Heading in deep blue
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
    pdf = RFT_Backend_PDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(left=15, top=30, right=15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ------------------ COVER PAGE (Page 1) ------------------
    pdf.add_page()
    
    # Top Border Banner in Blue
    pdf.set_fill_color(15, 30, 90)
    pdf.rect(0, 0, 210, 15, 'F')
    
    # Decorative line in gold accent
    pdf.set_fill_color(245, 158, 11)
    pdf.rect(0, 15, 210, 2, 'F')
    
    # Cover Content
    pdf.set_xy(15, 55)
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, 'BACKEND Core Architecture & API Endpoint Map', ln=True)
    
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 26)
    pdf.set_text_color(15, 30, 90)
    pdf.multi_cell(0, 11, 'RFT Platform\nNestJS Backend API')
    
    pdf.ln(6)
    # Divider line
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 120, pdf.get_y())
    pdf.ln(6)
    
    pdf.set_font('helvetica', '', 11)
    pdf.set_text_color(55, 65, 81)
    desc = ("A detailed systems architecture documentation mapping database entities, "
            "implemented authentication services, university records modules, and listing "
            "the precise REST API endpoint maps required to integrate both the "
            "Administrator Portal and Student Mobile Client repositories.")
    pdf.multi_cell(140, 6, desc)
    
    # Scope Indicators
    pdf.set_xy(15, 140)
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_text_color(15, 30, 90)
    pdf.cell(0, 5, 'BACKEND ARCHITECTURE SCOPE:', ln=True)
    pdf.ln(2)
    
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(55, 65, 81)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Database Schema - Prisma ORM, PostgreSQL Models & Enums', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Live Auth Modules - JWT Bearer Session Tokens, Revocation & OTP Validators', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Live Universities API - CRUD mappings with Super Admin clearance gates', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Mobile Client Endpoint Roadmap - Courses, Library & Representative Feeds', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Administrator Endpoint Roadmap - Super/School metrics & Intake queues', ln=True)
    
    # Metadata Footer block
    pdf.set_xy(15, 230)
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    
    # Left Block
    pdf.set_font('helvetica', 'B', 9)
    pdf.set_text_color(75, 85, 99)
    pdf.cell(90, 5, 'DOCUMENT METADATA', ln=False)
    pdf.cell(90, 5, 'NESTJS BACKEND SYSTEM STACK', ln=True)
    
    pdf.set_font('helvetica', '', 8.5)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(90, 4, 'Author: Core Backend Team', ln=False)
    pdf.cell(90, 4, 'Backend Framework: NestJS 11.0.1 (Express-based)', ln=True)
    
    pdf.cell(90, 4, 'Version: 1.0.0 (API Guide)', ln=False)
    pdf.cell(90, 4, 'Database Layer: Prisma Client 7.5.0 / PostgreSQL', ln=True)
    
    pdf.cell(90, 4, 'Date: June 2026', ln=False)
    pdf.cell(90, 4, 'Access Security: Passport JWT / Bcrypt Encryption', ln=True)
    
    # ------------------ PAGE 2: EXECUTIVE SUMMARY & ARCHITECTURE ------------------
    pdf.add_page()
    add_heading_1(pdf, '1. Executive Summary & Architecture')
    
    add_heading_2(pdf, 'Executive Summary')
    summary_text = (
        "The RFT Backend System acts as the single source of truth for the RFT edutech ecosystem, serving both "
        "the Next.js Administrator Portal and the Expo Mobile Client. Built on the NestJS framework, "
        "it implements structured REST API endpoints, secure JSON Web Token (JWT) credentials mapping, "
        "revocation registers, and automated one-time password (OTP) queues for email validation and recovery.\n\n"
        "Data access is managed through the Prisma Object-Relational Mapper (ORM), communicating with a PostgreSQL "
        "relational database. The database entities map institutional roles (Students, Class Representatives, Lecturers, "
        "and Administrators) under a single inherited User structure, allowing immediate role transformations and "
        "unified access validation checks."
    )
    add_paragraph(pdf, summary_text)
    
    add_heading_2(pdf, 'Directory Structure Overview')
    dir_text = (
        "The repository uses NestJS modular filesystems to group resource modules, controllers, DTO schemas, and services:"
    )
    add_paragraph(pdf, dir_text)
    
    dir_layout = [
        ['/src/main.ts', 'Application bootstrapper registering validation pipes, global filters, and CORS configs.'],
        ['/src/app.module.ts', 'Root module loading configuration files, Prisma service nodes, and active modules.'],
        ['/src/prisma', 'Service wrapper for the active database connection (PrismaService.ts).'],
        ['/src/auth', 'Authentication controllers, password guards, JWT strategies, and sign-up/login DTOs.'],
        ['/src/universities', 'Management controller mapping university CRUD fields and administration endpoints.'],
        ['/prisma/schema.prisma', 'Prisma DB schemas defining Enums (Role, OtpPurpose) and Models.'],
        ['/prisma/seed.ts', 'Initial seeder script generating 15 universities and a default SUPER_ADMIN user.'],
        ['/postman.json', 'Standard Postman Collection mapping implemented routes for developers to test local requests.']
    ]
    
    add_table(pdf, ['Path / File', 'Technical Purpose & Responsibility'], dir_layout, [55, 125])

    # ------------------ PAGE 3: CURRENT DATABASE SCHEMAS ------------------
    pdf.add_page()
    add_heading_1(pdf, '2. Database Schema & Live Endpoints')
    
    schema_intro = (
        "The database models are designed to represent university frameworks and manage "
        "security sessions. The schema contains the following main models:"
    )
    add_paragraph(pdf, schema_intro)
    
    add_bullet(pdf, 'University', 'Stores campus records. Fields: id (Int PK), name (String Unique), country (String), courseRepAccessCodeHash (String for rep elevation), createdAt, and updatedAt.')
    add_bullet(pdf, 'User (Mapped to "Student")', 'Unified table housing all system profiles (Student, Course Rep, Lecturer, Admin, Super Admin). Fields: id, name details, email (Unique), phone, passwordHash, role, matricNumber (Unique), universityId (FK), and timestamps.')
    add_bullet(pdf, 'Otp', 'Handles one-time verification tokens. Fields: id, purpose (VERIFY_EMAIL, RESET_PASSWORD), codeHash, expiresAt, consumedAt, and userId (FK referencing User).')
    add_bullet(pdf, 'RevokedToken', 'Revocation registry for invalidating JWTs (e.g. during user logouts) by checking token identifiers (jti).')
    
    add_heading_2(pdf, 'Live Implemented Endpoints')
    live_text = (
        "The following routes are implemented, integrated with the PostgreSQL database, and ready for connection:"
    )
    add_paragraph(pdf, live_text)
    
    endpoints = [
        ['POST', '/auth/register', 'Register standard Student or Class Representative account.', 'Public'],
        ['POST', '/auth/login', 'Authenticate credentials and return JWT bearer access token.', 'Public'],
        ['POST', '/auth/verify-email', 'Verify account email using Otp code check.', 'Public'],
        ['POST', '/auth/forgot-password/request', 'Request OTP token reset link via recovery email.', 'Public'],
        ['POST', '/auth/forgot-password/reset', 'Reset password using valid OTP check.', 'Public'],
        ['GET', '/auth/me', 'Fetch active profile data (role, details). Guarded by JWT/Revocation.', 'Guarded'],
        ['POST', '/auth/register/lecturer', 'Provision new lecturer credentials. Restricted to ADMIN.', 'Admin Guard'],
        ['POST', '/auth/super-admin/create-univ-admin', 'Create university admin profiles. Restricted to SUPER_ADMIN.', 'Super Guard'],
        ['POST', '/auth/logout', 'Revoke JWT bearer token using JTI cache registries.', 'Guarded'],
        ['GET', '/universities', 'List all onboarded universities. Supports country query filter.', 'Public'],
        ['POST', '/universities', 'Create a new university record. Restricted to SUPER_ADMIN.', 'Super Guard'],
        ['PATCH', '/universities/:id', 'Update university metadata fields. Restricted to SUPER_ADMIN.', 'Super Guard'],
        ['DELETE', '/universities/:id', 'Delete university node. Restricted to SUPER_ADMIN.', 'Super Guard']
    ]
    
    add_table(pdf, ['Verb', 'Endpoint Path', 'Action / Role', 'Access'], endpoints, [12, 53, 90, 25])

    # ------------------ PAGE 4: DETAILED GAPS - STUDENT MOBILE APP ------------------
    pdf.add_page()
    add_heading_1(pdf, '3. API Endpoint Roadmap: Student Mobile Client')
    
    mobile_intro = (
        "To replace the static mock data in the mobile app, the backend must "
        "implement the following endpoints. Each endpoint maps directly to student and class rep screens:"
    )
    add_paragraph(pdf, mobile_intro)
    
    add_heading_2(pdf, '1. Courses & Study Materials (CoursesScreen.tsx)')
    add_paragraph(pdf, 
        "  - GET /courses : Returns all courses enrolled by the active student (derived from their universityId). "
        "Supports query parameters for text search (?q=) and department filtering.\n"
        "  - GET /courses/:id : Returns comprehensive syllabus structures, scheduling summaries, and assigned lecturer details.\n"
        "  - GET /courses/:id/materials : Lists syllabus documents, video recordings, and study packs. "
        "Returns secure file URLs (e.g. presigned S3 links) with read-only indicators."
    )
    
    add_heading_2(pdf, '2. Past Questions Library & Simulated Purchases (LibraryScreen.tsx)')
    add_paragraph(pdf, 
        "  - GET /past-questions : Retrieves past exam papers. Supports query filters: ?courseId=, ?level=, ?departmentId=.\n"
        "  - GET /past-questions/:id : Detailed past question layout including document preview fragments, pricing parameters, and download stats.\n"
        "  - POST /past-questions/:id/checkout : Triggers the mock payment process. Wire it to payment SDK tokens "
        "(Paystack/Flutterwave). Upon verification, saves a purchase transaction model, unlocking the file."
    )
    
    add_heading_2(pdf, '3. Announcements & Representative Feeds (RepScreen.tsx)')
    add_paragraph(pdf, 
        "  - GET /announcements : Returns active announcements feed targeted at the student's department/level. "
        "Includes likes count, author title, and list of comments.\n"
        "  - POST /announcements : Creates a new communication notification. Restricted to COURSE_REP role. "
        "Allows choosing title, body, and audience criteria (universityId, department, level).\n"
        "  - POST /announcements/:id/like : Likes/unlikes an announcement.\n"
        "  - POST /announcements/:id/comments : Appends comments to the announcement thread."
    )
    
    add_heading_2(pdf, '4. Account Profile Settings & Alerts Center')
    add_paragraph(pdf, 
        "  - PATCH /users/profile : Updates student information (phone number, edit fields).\n"
        "  - POST /users/change-password : Changes security password with current validation requirements.\n"
        "  - GET /alerts : Returns notifications for the student (cancellations, reminders), integrated with polling or sockets."
    )

    # ------------------ PAGE 5: DETAILED GAPS - ADMIN PORTAL (SUPER & SCHOOL) ------------------
    pdf.add_page()
    add_heading_1(pdf, '4. API Endpoint Roadmap: Admin Portal (Super & School)')
    
    admin_intro = (
        "The Next.js Administrator Portal requires comprehensive administration control paths. "
        "The following endpoints must be exposed to support Super Admin and School Admin screens:"
    )
    add_paragraph(pdf, admin_intro)
    
    add_heading_2(pdf, '1. Super Admin Administration Endpoints')
    add_paragraph(pdf, 
        "  - GET /super/dashboard-stats : Retrieves general platform KPIs (Total Universities, Lecturers count, Student Base, Revenue).\n"
        "  - GET /super/schools : Lists directories of onboarded institutions, showing location details, active plans, and statuses.\n"
        "  - POST /super/schools/onboard : multi-step intake handler for provisioning campus records, setup fees, and primary admins.\n"
        "  - GET /super/subscriptions : Retrieves available plans (Free, Premium, Enterprise) and recent transaction records.\n"
        "  - POST /super/subscriptions/plan : Configures billing parameters, prices, and allowed administrative accounts limits."
    )
    
    add_heading_2(pdf, '2. School Admin Operations Endpoints')
    add_paragraph(pdf, 
        "  - GET /school/dashboard-stats : Returns campus statistics (Students, verified Lecturers, Course roster counts).\n"
        "  - GET /school/faculties : Retrieves capacities, load ratios, and level metrics for local campus faculties.\n"
        "  - GET /school/levels : Local student counts segmented from 100L up to 500L.\n"
        "  - GET /school/courses : Campus course list. POST /school/courses plans and publishes new course items.\n"
        "  - GET /school/lecturers : Lists active lecturers. POST /school/lecturers upgrades a lecturer user or adds new verified listings.\n"
        "  - GET /school/class-reps : Lists designated course communication representatives. POST /school/class-reps/assign upgrades "
        "a student to COURSE_REP role after validating their university access code."
    )
    
    add_heading_2(pdf, '3. School Intake Admissions Queue')
    add_paragraph(pdf, 
        "  - GET /school/admissions-queue : Lists student applications awaiting registrar review.\n"
        "  - POST /school/admissions-queue/:id/review : Verifies documentation credentials, processes intakes, "
        "sets role verification codes, and triggers email notices."
    )
    
    add_heading_2(pdf, '4. Lecturer Operations Endpoints')
    add_paragraph(pdf, 
        "  - GET /lecturer/dashboard-stats : Active teaching loads, notifications, and review logs.\n"
        "  - POST /lecturer/schedule : Adds a new class session (dates, times, physical Hall, hybrid parameters).\n"
        "  - POST /lecturer/assessments : Constructs quizzes and assignment packages (Timed CBT, Portal Upload)."
    )

    # ------------------ PAGE 6: SECURITY POLICIES & DATABASE OPTIMIZATIONS ------------------
    pdf.add_page()
    add_heading_1(pdf, '5. Security Policies & DB Optimizations')
    
    sec_intro = (
        "Security, scalability, and performance are primary goals of the backend client. "
        "The system architecture integrates the following core policies and design patterns:"
    )
    add_paragraph(pdf, sec_intro)
    
    add_heading_2(pdf, '1. Token Revocation Logic (revoked-token.guard.ts)')
    add_paragraph(pdf, 
        "To prevent compromised JWT access tokens from remaining valid, the logout sequence invalidates "
        "token identifiers. When a user requests /auth/logout, the JTI (unique identifier encoded inside the JWT payload) "
        "is logged in the RevokedToken table alongside its expiration timestamp. The TokenNotRevokedGuard interceptor "
        "compares incoming JWT JTIs against this list on every protected request, blocking invalid connections immediately."
    )
    
    add_heading_2(pdf, '2. Password Encryption Standard')
    add_paragraph(pdf, 
        "User credentials are encrypted using the bcryptjs algorithm. During signup, the server hashes "
        "passwords with 10 salt rounds (customizable via BCRYPT_SALT_ROUNDS inside variables.env). Plaintext credentials "
        "are never logged or saved in DB columns."
    )
    
    add_heading_2(pdf, '3. Database Query Optimizations & Indexing')
    add_paragraph(pdf, 
        "Prisma schemas are indexed to handle intensive query loads as the platform grows. "
        "For example, the Otp table implements an index on [userId, purpose]:\n"
        "  @@index([userId, purpose])\n"
        "This speeds up recovery and validation checks, reducing database lookup costs during signups."
    )
    
    add_heading_2(pdf, '4. OTP Lifetime & Validity Management')
    add_paragraph(pdf, 
        "One-time passwords carry a strict 15-minute validity lifecycle (expiresAt). When an OTP verification is request, "
        "the server checks if consumedAt is null and expiresAt is greater than the current timestamp. "
        "Upon successful verification, consumedAt is set to the current date/time to prevent reuse attacks."
    )

    # ------------------ PAGE 7: LOCAL SETUP & VERIFICATION ------------------
    pdf.add_page()
    add_heading_1(pdf, '6. Local Verification & Running Instructions')
    
    setup_p = (
        "Follow these steps to configure your local database connection and execute "
        "the NestJS development environment for verification:"
    )
    add_paragraph(pdf, setup_p)
    
    add_heading_2(pdf, '1. Environment Configuration')
    add_paragraph(pdf, 
        "Create a .env file in the RFT-Students-backend root directory and configure the database URL:\n\n"
        "  DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/rft_db?schema=public\"\n"
        "  JWT_SECRET=\"rft_jwt_secret_key_2026\"\n"
        "  BCRYPT_SALT_ROUNDS=10"
    )
    
    add_heading_2(pdf, '2. Dependency Setup & Database Migration')
    add_paragraph(pdf, 
        "Run these commands in your shell to fetch libraries, construct tables, and seed records:\n\n"
        "  # Install NestJS package dependencies\n"
        "  npm install\n\n"
        "  # Generate Prisma client and apply database migrations\n"
        "  npx prisma migrate dev\n\n"
        "  # Seed the database (Generates 15 Nigerian Universities & Super Admin account)\n"
        "  npx prisma db seed"
    )
    
    add_heading_2(pdf, '3. Run Development Server')
    add_paragraph(pdf, 
        "Spin up the server on watch mode:\n\n"
        "  npm run start:dev\n\n"
        "The server initializes at http://localhost:3000. You can test authorization requests immediately "
        "by loading the postman.json collection in your Postman desktop client."
    )
    
    add_heading_2(pdf, '4. Seed Account Credentials')
    add_paragraph(pdf, 
        "Default seeded super administrator credentials:\n"
        "  - Email: 'superadmin@example.com'\n"
        "  - Password: 'SuperAdmin123!'\n"
        "Use this login combination to request your first JWT and test administrator endpoints."
    )
    
    # Save PDF in both Desktop and RFT-Students-backend directory
    pdf.output('/Users/libertyelec/Desktop/RFT_Backend_Technical_Documentation.pdf', 'F')
    pdf.output('/Users/libertyelec/Desktop/RFT-edutech/RFT-Students-backend/RFT_Backend_Technical_Documentation.pdf', 'F')
    print('Backend System PDF Technical Documentation generated successfully.')

if __name__ == '__main__':
    generate_pdf()
