import sys
from fpdf import FPDF

class RFT_Student_PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        # Background rectangle for header in student deep blue (#0B2B65)
        self.set_fill_color(11, 43, 101)
        self.rect(0, 0, 210, 24, 'F')
        
        # Header Text
        self.set_text_color(255, 255, 255)
        self.set_font('helvetica', 'B', 10)
        self.set_xy(15, 7)
        self.cell(0, 5, 'RFT PLATFORM - STUDENT MOBILE APPLICATION', align='L')
        
        self.set_font('helvetica', 'I', 8)
        self.set_xy(15, 13)
        self.cell(0, 5, 'Mobile Client Technical Documentation & Architecture', align='L')
        
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
        self.cell(0, 10, 'CONFIDENTIAL - RFT STUDENT MOBILE APP DOCUMENTATION', align='L')

def add_heading_1(pdf, text):
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 15)
    pdf.set_text_color(11, 43, 101) # Deep blue for main headings
    pdf.cell(0, 8, text, ln=True)
    pdf.set_draw_color(11, 43, 101)
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
    pdf = RFT_Student_PDF(orientation='P', unit='mm', format='A4')
    pdf.set_margins(left=15, top=30, right=15)
    pdf.set_auto_page_break(auto=True, margin=20)
    
    # ------------------ COVER PAGE (Page 1) ------------------
    pdf.add_page()
    
    # Top Border Banner in Student Deep Blue
    pdf.set_fill_color(11, 43, 101)
    pdf.rect(0, 0, 210, 15, 'F')
    
    # Decorative line in Gold accent
    pdf.set_fill_color(245, 158, 11)
    pdf.rect(0, 15, 210, 2, 'F')
    
    # Cover Content
    pdf.set_xy(15, 55)
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, 'MOBILE APPLICATION TECHNICAL DOCUMENTATION', ln=True)
    
    pdf.ln(4)
    pdf.set_font('helvetica', 'B', 26)
    pdf.set_text_color(11, 43, 101)
    pdf.multi_cell(0, 11, 'RFT Student Portal\nMobile Application')
    
    pdf.ln(6)
    # Divider line
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 120, pdf.get_y())
    pdf.ln(6)
    
    pdf.set_font('helvetica', '', 11)
    pdf.set_text_color(55, 65, 81)
    desc = ("A comprehensive technical guide outlining the filesystem structure, "
            "implemented modules, role-based navigation contexts, and components "
            "of the Expo / React Native mobile application client. Includes details "
            "on implemented screens, state stores, and the future development roadmap.")
    pdf.multi_cell(140, 6, desc)
    
    # Navigation scope indicators
    pdf.set_xy(15, 140)
    pdf.set_font('helvetica', 'B', 10)
    pdf.set_text_color(11, 43, 101)
    pdf.cell(0, 5, 'MOBILE SYSTEMS IMPLEMENTATION SCOPE:', ln=True)
    pdf.ln(2)
    
    pdf.set_font('helvetica', '', 9.5)
    pdf.set_text_color(55, 65, 81)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Unified React Native Navigation - Stack + Bottom Tabs', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Zustand Session State Store - Local Storage Cache Synchronization', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Student Tools - Course View, Past Questions Repository & Mock Payments', ln=True)
    pdf.set_x(20)
    pdf.cell(0, 5, '* Class Representative Tools - Announcements Feed & Audience Targeting', ln=True)
    
    # Metadata Footer block
    pdf.set_xy(15, 230)
    pdf.set_draw_color(229, 231, 235)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(5)
    
    # Left Block
    pdf.set_font('helvetica', 'B', 9)
    pdf.set_text_color(75, 85, 99)
    pdf.cell(90, 5, 'DOCUMENT METADATA', ln=False)
    pdf.cell(90, 5, 'MOBILE CLIENT SPECIFICATIONS', ln=True)
    
    pdf.set_font('helvetica', '', 8.5)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(90, 4, 'Author: Core Architecture Team', ln=False)
    pdf.cell(90, 4, 'Framework: React Native / Expo Managed Workflow', ln=True)
    
    pdf.cell(90, 4, 'Version: 1.0.0 (Release-Ready)', ln=False)
    pdf.cell(90, 4, 'State Management: Zustand Store Sync', ln=True)
    
    pdf.cell(90, 4, 'Date: June 2026', ln=False)
    pdf.cell(90, 4, 'Target OS: iOS & Android (EAS Compatible)', ln=True)
    
    # ------------------ PAGE 2: EXECUTIVE SUMMARY & ARCHITECTURE ------------------
    pdf.add_page()
    add_heading_1(pdf, '1. Executive Summary & Mobile Stack')
    
    add_heading_2(pdf, 'Executive Summary')
    summary_text = (
        "The RFT Student Mobile Application serves as the primary gateway for students and course "
        "representatives in the RFT ecosystem. Developed with React Native and Expo, the mobile app provides "
        "a cross-platform experience that supports student tools, registration details, interactive course portals, "
        "past question materials libraries, and communication channels.\n\n"
        "The app supports two key profiles: standard Students and Class Representatives. While Students have read "
        "and purchase permissions for materials, Class Representatives are granted publishing capabilities to disseminate "
        "announcements, manage review modules, and update courses directly from their mobile devices.\n\n"
        "This document details the file structure of the mobile repository, outlines the implemented components, and "
        "defines the steps remaining to transition from static mock data to a production-ready API integration."
    )
    add_paragraph(pdf, summary_text)
    
    add_heading_2(pdf, 'Core Mobile Stack')
    tech_text = (
        "The client application is built with modern, performant cross-platform technologies:"
    )
    add_paragraph(pdf, tech_text)
    
    add_bullet(pdf, 'React Native & Expo', 'Allows code-sharing across iOS and Android with hot-reloading capability.')
    add_bullet(pdf, 'React Navigation', 'Uses a combination of bottom-tab wrappers (TabNavigator) and native layout stacks (StackNavigator) for fluid transition states.')
    add_bullet(pdf, 'Zustand State Store', 'A lightweight, fast client state engine containing active session parameters, credentials, and cache states.')
    add_bullet(pdf, 'AsyncStorage', 'Provides non-volatile key-value storage to persist user sessions and caching across app reboots.')
    add_bullet(pdf, 'TypeScript & Babel Resolver', 'Ensures static code correctness and permits path aliasing for clean codebase navigation.')

    # ------------------ PAGE 3: CODEBASE DIRECTORY STRUCTURE ------------------
    pdf.add_page()
    add_heading_1(pdf, '2. Codebase Architecture & Filesystem')
    
    arch_text = (
        "The mobile project uses a standard Expo filesystem separating screen components, service layers, "
        "global navigation configs, and atomic UI items under the src/ folder. The directory layout is structured as follows:"
    )
    add_paragraph(pdf, arch_text)
    
    dir_structure = [
        ['/src/app', 'Contains route directories and core app initialization hooks.'],
        ['/src/screens/auth', 'Screens handling user registration (SignupScreen) and login (LoginScreen).'],
        ['/src/screens/main', 'Functional screen layouts: Home, Courses, past questions Library, Details, Alerts, Rep Tools, Profile.'],
        ['/src/components', 'Atomic visual items: Button, Input, Select dropdowns, SearchBar, Card shells, Modal wrappers, PDFViewer.'],
        ['/src/services', 'Isolated business logic: authService (Zustand state engine) and dataService (mock API data endpoints).'],
        ['/src/navigation', 'Central navigator configurations (RootNavigator, AuthNavigator, MainNavigator).'],
        ['/src/styles', 'Global styling variables, palette coordinates, and sizing grids.'],
        ['/src/lib', 'Shared utility functions and common mock database contents.'],
        ['/package.json', 'Project dependencies, dev scripts, and Expo configuration configurations.'],
        ['/app.json / eas.json', 'EAS build profiles, app metadata identifiers, icons, and asset configs.']
    ]
    
    add_table(pdf, ['Path / Directory', 'Role & Technical Purpose'], dir_structure, [55, 125])
    
    add_heading_2(pdf, 'Navigation and Layout Hierarchy')
    state_text = (
        "The entry configuration is mapped inside RootNavigator.tsx which reads the Zustand active session cookie. "
        "If a user is not authenticated, the app renders the AuthNavigator stack (Login and Signup). "
        "Once authenticated, the app transitions dynamically to the MainNavigator stack which hosts a persistent "
        "Bottom Tab Navigator. Certain sub-pages (such as PastQuestionDetailScreen) are pushed onto the native navigation "
        "stack for screen depth and standard platform transitions."
    )
    add_paragraph(pdf, state_text)

    # ------------------ PAGE 4: IMPLEMENTED MODULES (PART 1) ------------------
    pdf.add_page()
    add_heading_1(pdf, '3. Implemented Modules: Auth & Student Core')
    
    intro_p = (
        "The following student modules have been fully implemented with clean mobile styling (deep-blue/gold/gray), "
        "TypeScript interfaces, and mock APIs:"
    )
    add_paragraph(pdf, intro_p)
    
    add_heading_2(pdf, 'Authentication & Sign Up Flow')
    add_paragraph(pdf, 
        "The login sequence verifies user credentials against mock entries, loading active sessions. "
        "The signup process (SignupScreen.tsx) implements an interactive, multi-stage layout featuring:\n"
        "  - E-mail format verification and password confirmation.\n"
        "  - Localized fields including Matric Number.\n"
        "  - Dynamic school dropdown containing three universities (Lagos, Ibadan, Ahmadu Bello) and corresponding departments.\n"
        "  - Dynamic level classification (100L - 400L).\n"
        "Sessions are stored in AsyncStorage so users remain logged in across app restarts."
    )
    
    add_heading_2(pdf, 'Student Dashboard & Enrolled Courses')
    add_paragraph(pdf, 
        "The primary dashboard (HomeScreen.tsx) provides personal greeting modules, current semester indicators, "
        "active notification counters, announcement feeds, and quick links. "
        "The Courses module (CoursesScreen.tsx) allows users to browse enrolled courses, search by course code, "
        "filter by department, and open study materials inside an in-app viewer layout."
    )
    
    add_heading_2(pdf, 'Past Questions Library & Checkout Flow')
    add_paragraph(pdf, 
        "The Library screen (/main/LibraryScreen.tsx) serves as the learning archive repository. Users can search and "
        "filter past exams by level, department, and course code. Each item displays metadata, description, and pricing "
        "(ranging from 500 to 2000 NGN). Clicking an item loads PastQuestionDetailScreen which features:\n"
        "  - Interactive material summary.\n"
        "  - Integrated PDF preview components.\n"
        "  - A payment constructor modal that simulates transactions, clears the item, and persists access status."
    )

    # ------------------ PAGE 5: IMPLEMENTED MODULES (PART 2) ------------------
    pdf.add_page()
    add_heading_1(pdf, '4. Implemented Modules: Class Rep & Profile')
    
    add_heading_2(pdf, 'Class Representative Tools & Communication Portal')
    add_paragraph(pdf, 
        "The Representative section (RepScreen.tsx) handles communication leadership tasks. "
        "It supports dual user contexts: standard Students can find representative rosters (phone/WhatsApp, email), "
        "while Class Representatives are granted access to publishing tools. Key features include:"
    )
    
    add_bullet(pdf, 'Announcements Feed', 'Real-time announcement list supporting standard social features including like registers, comment drawers, and distribution shares.')
    add_bullet(pdf, 'Publish Announcement Portal', 'Class Reps can open a creation dialog to input titles, messages, and define targeted audiences (e.g. particular departments or levels) before publishing.')
    add_bullet(pdf, 'Reps Directory', 'A structured contact registry list connecting student profiles with local class representatives.')
    
    add_heading_2(pdf, 'User Profile, Settings, & Real-Time Alerts')
    profile_p = (
        "The User Profile module (ProfileScreen.tsx) displays personal details, school credentials, and manages "
        "session states. Sub-modules include:"
    )
    add_paragraph(pdf, profile_p)
    
    add_bullet(pdf, 'Account Specifications', 'Displays active name, email, matriculation, department, and level parameters.')
    add_bullet(pdf, 'Password Manager', 'A form verifying new password parameters with security policy checks.')
    add_bullet(pdf, 'Real-Time Alert Center', 'The alerts tab (/main/AlertsScreen.tsx) performs polling checks (every 30 seconds) for incoming announcements or system alerts, updating badge counts and support flags.')
    add_bullet(pdf, 'Logout Gate', 'Clears session data from Zustand stores and AsyncStorage, returning the user to the login screen.')

    # ------------------ PAGE 6: TECHNICAL GAPS & PRODUCTION ROADMAP ------------------
    pdf.add_page()
    add_heading_1(pdf, '5. Technical Gaps & Future Roadmap')
    
    roadmap_intro = (
        "To transform the React Native prototype into a secure client application ready for App Store "
        "and Google Play publishing, the following architectural gaps must be addressed:"
    )
    add_paragraph(pdf, roadmap_intro)
    
    add_heading_2(pdf, '1. Live API Gateway Hookup')
    add_paragraph(pdf, 
        "The mobile app currently retrieves local variables from dataService.ts. The application must be "
        "reconfigured to send network HTTP/REST requests (or GraphQL operations) to a remote API server "
        "to fetch active universities, departments, courses, past questions, and rep lists dynamically."
    )
    
    add_heading_2(pdf, '2. Secure JWT Authentication & Access Tokens')
    add_paragraph(pdf, 
        "The current user session is stored in plain text inside AsyncStorage. For production, the system must "
        "implement a secure JWT authentication flow. Access tokens must be stored in secure storage compartments "
        "(such as Expo SecureStore) to prevent local compromise, and interceptors must be written to attach bearer tokens "
        "to outgoing API requests."
    )
    
    add_heading_2(pdf, '3. Real Payment Gateway SDK Integration')
    add_paragraph(pdf, 
        "Past question purchases use a mock checkout handler. The next stage requires integrating a mobile "
        "payment processor SDK (like Paystack Mobile SDK or Flutterwave Mobile) to process real transactions, "
        "handle card or mobile money payments securely, and receive webhook success tokens."
    )
    
    add_heading_2(pdf, '4. WebSockets for Instant Notifications')
    add_paragraph(pdf, 
        "The system relies on client-side polling every 30 seconds for alerts, which is inefficient. "
        "Integrating native Push Notifications (Expo Notifications / Firebase Cloud Messaging) and WebSockets "
        "is necessary to push class cancellations, schedules, and representative announcements instantly."
    )
    
    add_heading_2(pdf, '5. Native PDF and File Download Manager')
    add_paragraph(pdf, 
        "In-app PDF viewing uses simulated data structures. For production, integrate file download handlers "
        "with caching (e.g. expo-file-system) to support offline material viewing while restricting file "
        "distribution to unauthorized users."
    )

    # ------------------ PAGE 7: VERIFICATION & RUNNING INSTRUCTIONS ------------------
    pdf.add_page()
    add_heading_1(pdf, '6. Verification & Run Instructions')
    
    setup_intro = (
        "The mobile codebase is fully compiled. To initialize and verify the mobile application, follow "
        "these instructions in your terminal:"
    )
    add_paragraph(pdf, setup_intro)
    
    add_heading_2(pdf, 'Installation & Run Steps')
    setup_commands = (
        "Execute these commands in the RFT-student root directory:\n\n"
        "  # Install required package dependencies\n"
        "  pnpm install\n\n"
        "  # Run the Expo development bundler\n"
        "  pnpm dev\n\n"
        "  # Open the Metro interface on your browser at http://localhost:8081\n"
        "  # Press 'a' for Android emulator, 'i' for iOS simulator, or scan the QR code in Expo Go."
    )
    add_paragraph(pdf, setup_commands)
    
    add_heading_2(pdf, 'Development Accounts Checklist')
    chk_text = (
        "Log in with the following accounts to verify client behaviors:\n"
        "  - Student User:\n"
        "    Email: 'student@example.com' | Password: 'password123'\n"
        "    Verifies courses search, mock checkout libraries, and alerts list.\n"
        "  - Class Representative:\n"
        "    Email: 'rep@example.com' | Password: 'password123'\n"
        "    Verifies identical student views with the addition of the 'Post Announcement' module."
    )
    add_paragraph(pdf, chk_text)
    
    add_heading_2(pdf, 'Visual & Palette Consistency')
    visual_text = (
        "All visual parameters follow the designated student theme styling:\n"
        "  - Theme Color: Deep Professional Blue RGB(11, 43, 101) / #0B2B65.\n"
        "  - Primary Background: Neutral light gray (#F8F9FA) with stark white cards.\n"
        "  - The PDF document follows styling parameters (pure black, white, and grey body text, "
        "with deep blue used exclusively in the standard page headers)."
    )
    add_paragraph(pdf, visual_text)
    
    # Save PDF in both Desktop and RFT-student directory
    pdf.output('/Users/libertyelec/Desktop/RFT_Student_Mobile_Technical_Documentation.pdf', 'F')
    pdf.output('/Users/libertyelec/Desktop/RFT-edutech/RFT-student/RFT_Student_Mobile_Technical_Documentation.pdf', 'F')
    print('Student Mobile PDF Technical Documentation generated successfully.')

if __name__ == '__main__':
    generate_pdf()
