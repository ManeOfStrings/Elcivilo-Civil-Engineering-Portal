# ELCIVILO - CIVIL ENGINEERING ACADEMIC PORTAL
**Complete Vibe Coding Project Specification**

**Project Type:** Student Academic Management Web Application  
**Theme:** Civil Engineering / Construction / Blueprint Aesthetic  
**Design Style:** Modern, Minimal, Professional, and Responsive  

---

## 1. PROJECT OVERVIEW

Build a modern, responsive Civil Engineering Academic Portal named **Elcivilo** that allows students to openly access academic resources, download study materials, view assignments, calculate their SGPA, and stay updated with important academic dates.

The application must strictly avoid cluttered dashboard layouts and junk data, keeping the interface plain and professional.

### Navigation Navbar
The top navigation bar must include exactly these **8 primary navigation sections**:
1. Syllabus
2. Class Notes
3. Question Papers
4. Supply Special Notes
5. Last Date
6. Assignment
7. SGPA Calculator
8. IS Codes & Reference Tables

### Main Architecture & Flow
The application must strictly follow this minimal navigation flow:
*   **Homepage:** A clean, modern grid of Semesters (Semester 1 through Semester 8). These must be displayed as solid buttons with minimal text (e.g., just "Semester 1").
*   **Semester View:** Clicking a specific semester button navigates to a plain, organized list of Subjects taught in that semester.
*   **Subject View:** Clicking a subject opens a resource hub for that specific class, categorized into sections like Notes, Textbooks, Assignments, and Previous Year Questions.

---

## 2. DESIGN SYSTEM AND COLOR PALETTE

Use a strictly Civil Engineering-inspired visual identity. The theme must scream "Civil Engineering" but remain highly professional, structured, and modern.

### Primary Colors

| Element | Color | Hex Code |
| :--- | :--- | :--- |
| Primary Blue | Blueprint Blue | `#164B78` |
| Secondary Blue | Steel Blue | `#2878A8` |
| Concrete Grey | Cool Concrete | `#D5D9DC` |
| Dark Grey | Structural Charcoal | `#252C32` |
| Safety Yellow | Construction Yellow | `#FFD43B` |
| Background | Light Concrete | `#F4F6F7` |
| White | Clean White | `#FFFFFF` |

### Design Guidelines
*   **Color Usage:** Use structural and earthy tones. Blueprint blue for primary actions, concrete grey for cards/backgrounds, and safety yellow sparingly for important deadlines or hover states.
*   **Visual Elements:** Incorporate subtle background patterns like architectural grid lines, blueprint textures, or isometric geometric shapes.
*   **Typography:** Use strong, clean, sans-serif fonts that resemble architectural drafting text. 
    *   **Headings:** Space Grotesk
    *   **Body:** Inter
    *   **Technical labels:** IBM Plex Mono
*   **UI Elements:** UI cards should feel "built" and solid, with sharp edges or structural shadows.

---

## 3. APPLICATION LAYOUT

### Desktop Layout
**Top Navigation Bar:**
*   Elcivilo Logo
*   1. Syllabus
*   2. Class Notes
*   3. Question Papers
*   4. Supply Special Notes
*   5. Last Date
*   6. Assignment
*   7. SGPA Calculator
*   8. IS Codes & Reference Tables
*   Admin Login (Hidden or subtle icon) / Search

**Main View Area:**
*   Focus on a seamless, intuitive user experience with smooth transitions between the Semester, Subject, and Notes views. Use modern UI components like accordions or tabs for note categorization.

### Mobile Layout
*   Fully responsive layout for mobile and tablet devices.
*   Top navigation converted into a clean hamburger menu.
*   Semester buttons stack vertically for easy tapping.

---

## 4. THE EIGHT MAIN FUNCTIONALITIES

### 1. SYLLABUS
*   Display organized syllabus documents (PDF, DOCX).
*   Search and filter by subject.
*   Preview and download files directly from the subject view.

### 2. CLASS NOTES
*   Centralized repository for class notes.
*   Categorized by unit or module using clean UI accordions/tabs.
*   Supports PDF, PPTX, and image formats.

### 3. QUESTION PAPERS
*   Archive for previous year question papers.
*   Filter by subject, examination year, and examination type.

### 4. SUPPLY SPECIAL NOTES
*   Dedicated section for supplementary examination preparation materials.
*   Use a distinctive safety-yellow highlight for important supplementary resources.

### 5. LAST DATE
*   Academic notification and deadline management center.
*   Display upcoming submission dates, examination dates, and clear countdowns.

### 6. ASSIGNMENT
*   Display assignments organized by subject without excess data.
*   Allow students to read assignment details and download question files. *(Note: Students cannot submit files here).*

### 7. SGPA CALCULATOR
*   A clean, plain calculator interface.
*   Students input their obtained grades and subject credits.
*   Automatically computes the Semester Grade Point Average (SGPA).

### 8. IS CODES & REFERENCE TABLES
*   A dedicated global repository for standardized civil engineering design codes (e.g., IS 456, IS 800) and reference tables.
*   Includes digital versions of Steel Tables, Soil Classification charts, and unit conversion cheat sheets.
*   Searchable by code number or category (Structural, Geotechnical, Environmental, etc.).

---

## 5. USER AUTHENTICATION AND ROLES

**Public Access (Students):**
*   **No login or registration is required** for students. 
*   Open access to navigate the semester flow, view/download resources, use the calculators, and check last dates.
*   Students are strictly restricted from uploading any documents to the platform.

**Single Admin Account:**
*   The platform is managed by exactly **one secure Admin account**.
*   Only the Admin has the authority to upload files, publish notifications, manage academic resources, add/edit subjects, and manage assignment deadlines.

---

## 6. DOCUMENT UPLOAD AND STORAGE SYSTEM

*   **Supported Formats:** PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG
*   Secure cloud storage integration for all resource uploads.
*   Only the Admin can trigger uploads.
*   Preview capabilities built into the public resource hub.

---

## 7. DATABASE STRUCTURE

Create a cleanly structured relational database (e.g., PostgreSQL). Avoid junk tables and student data tables.

*   `admin_user`: id, email, password_hash
*   `subjects`: id, subject_name, subject_code, semester, credits
*   `documents`: id, title, file_url, file_type, category, subject_id, semester
*   `assignments`: id, title, subject_id, description, due_date, attachment_url
*   `notifications`: id, title, description, category, due_date
*   `reference_codes`: id, code_number, title, category, file_url

---

## 8. RECOMMENDED TECHNOLOGY STACK

*   **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
*   **Backend:** Supabase
*   **Database:** PostgreSQL
*   **File Storage:** Supabase Storage

---

## 9. FINAL INSTRUCTION TO THE AI CODING TOOL

Build **Elcivilo** as a production-ready, full-stack academic web application. Completely discard any traditional dashboard widgets. The architecture must strictly follow the minimal navigation flow: Homepage (Minimal Semester buttons) -> Subjects List -> Resource Hub. 

Implement all 8 modules (Syllabus, Class Notes, Question Papers, Supply Special Notes, Last Date, Assignment, SGPA Calculator, and IS Codes) with working database operations and secure file storage. Keep the interface plain, avoid junk data, and strictly adhere to the professional blueprint/civil engineering visual identity. **Ensure there is no student authentication or upload capability; all data is managed strictly by a single Admin login.**