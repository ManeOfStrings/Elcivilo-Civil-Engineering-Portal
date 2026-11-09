# CIVIL ENGINEERING ACADEMIC PORTAL
**Complete Vibe Coding Project Specification**

**Project Type:** Student Academic Management Web Application  
**Theme:** Civil Engineering / Construction / Blueprint Aesthetic  
**Design Style:** Modern, Minimal, Professional and Responsive  

---

## 1. PROJECT OVERVIEW

Build a modern, responsive Civil Engineering Academic Portal that allows students to access academic resources, manage attendance, download study materials, view notifications, track assignments and stay updated with important academic dates.

The application should have exactly **7 primary navigation sections**:
1. Syllabus
2. Class Notes
3. Question Papers
4. Attendance Marker
5. Supply Special Notes
6. Last Dates & Notifications
7. Assignment

The platform should function as a centralized academic hub for civil engineering students.

### Main Objectives
* Provide a centralized location for academic resources.
* Allow uploading and downloading of PDF documents and other study materials.
* Help students monitor their attendance.
* Keep students informed about deadlines and notifications.
* Organize assignments and academic tasks.
* Provide an easy-to-use and visually attractive interface.

---

## 2. DESIGN SYSTEM AND COLOR PALETTE

Use a Civil Engineering-inspired visual identity.

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
* Use blueprint-inspired blue for navigation and primary buttons.
* Use concrete grey for cards, dividers and backgrounds.
* Use safety yellow for important dates, alerts and highlights.
* Use dark charcoal for headings and readable text.
* Use subtle shadows and rounded corners.
* Incorporate engineering blueprint grid patterns in selected backgrounds.
* Use technical line illustrations and construction-related icons.

### Typography
Recommended fonts:
* **Headings:** Space Grotesk
* **Body:** Inter
* **Technical labels:** IBM Plex Mono

### Visual Elements
Use icons related to:
* Buildings & Bridges
* Construction helmets
* Structural engineering
* Drawings and blueprints
* Measuring instruments
* Documents & Calendars
* Concrete structures

---

## 3. APPLICATION LAYOUT

### Desktop Layout
Create a sidebar navigation on the left and a main content area on the right.

**Sidebar:**
* Civil Engineering Portal logo
* Dashboard
* Syllabus
* Class Notes
* Question Papers
* Attendance Marker
* Supply Special Notes
* Last Dates & Notifications
* Assignment
* Settings
* Profile

**Top Navigation Bar:**
* Search bar
* Notification icon
* Current semester indicator
* Student profile
* Profile settings

**Main Dashboard:**
* Welcome message
* Current semester
* Quick access cards
* Recent uploads
* Upcoming deadlines
* Attendance overview
* Latest announcements

### Mobile Layout
* Responsive sidebar converted into a hamburger menu.
* Cards arranged vertically.
* Mobile-friendly upload interface.
* Easy document preview and downloading.
* Bottom navigation or collapsible navigation where appropriate.

---

## 4. THE SEVEN MAIN FUNCTIONALITIES

### SECTION 1: SYLLABUS
Create a complete syllabus management section.

**Features:**
* Upload syllabus documents.
* Support PDF, DOCX and image files.
* Organize syllabuses by semester.
* Organize subjects by subject code and subject name.
* Display subject details.
* Preview uploaded PDF files.
* Download syllabus documents.
* Replace or delete existing files (authorized users only).
* Search syllabus by subject name or code.

**Suggested Layout:**
Each subject should appear as a card containing:
* Subject name, Subject code, Semester, Credits (optional)
* Uploaded syllabus file, Upload date
* Preview button & Download button

**Upload Form:**
* Subject name, Subject code, Semester, Syllabus file, Description

### SECTION 2: CLASS NOTES
Create a centralized class notes repository.

**Features:**
* Upload class notes.
* Support PDF, DOCX, PPTX and image formats.
* Organize notes by semester and subject.
* Allow multiple files per subject.
* Categorize notes by unit or module.
* Search and filter notes.
* Preview and download documents.
* Display recently uploaded notes.

**Note Categories:**
* Unit 1, Unit 2, Unit 3, Unit 4, Unit 5
* Additional Notes, Important Topics, Reference Materials

**Upload Form:**
* Subject name, Subject code, Semester, Unit number, Topic name, Description, Upload file
*(Include an upload progress indicator and success/error messages.)*

### SECTION 3: QUESTION PAPERS
Create a question paper archive for exam preparation.

**Features:**
* Upload previous year question papers.
* Organize papers by semester.
* Filter by subject, examination year, and examination type.
* Support PDF uploads.
* Preview and download question papers.
* Display recently uploaded papers.

**Examination Categories:**
* Previous Year Examination, Semester Examination, Internal Examination, Model Examination, Supply Examination

**Upload Form:**
* Subject name, Subject code, Semester, Examination type, Examination year, Upload question paper, Description

**Additional Feature:**
* Create a Previous Year Question Paper Archive with year-wise browsing.

### SECTION 4: ATTENDANCE MARKER
Build an interactive attendance tracking system.

**Features:**
* Add subjects and enter total conducted classes.
* Mark attendance as Present or Absent.
* Automatically calculate attendance percentage: `(Present Classes / Total Conducted Classes) × 100`
* Display subject-wise and overall attendance.
* Track attendance history and edit records.
* Show attendance warnings.
* Calculate the number of additional classes needed to reach a target attendance percentage.

**Visual Indicators:**
* **Green:** Attendance above 75%.
* **Yellow:** Attendance between 65% and 75%.
* **Red:** Attendance below 65%.
*(Make the threshold configurable.)*

**Dashboard Display:**
* Overall attendance percentage, total classes conducted/attended/absences.
* Subject-wise attendance cards and progress bars.

**Important Additional Feature (Class Bunk Calculator):**
* Tell students how many classes they can safely miss while maintaining their selected attendance target.
* Include a reverse calculator to show how many consecutive classes they must attend to reach the target.

### SECTION 5: SUPPLY SPECIAL NOTES
Create a dedicated section for supplementary examination preparation materials.

**Features:**
* Upload supplementary examination notes, important topics, special preparation materials, and solved question papers.
* Organize documents by subject, semester, and unit.
* Search, filter, preview, and download documents.

**Categories:**
* Supply Exam Notes, Important Questions, Frequently Asked Questions, Solved Question Papers, Important Derivations, Last-Minute Revision Notes, Formula Sheets, Exam Preparation Materials

**Upload Form:**
* Subject name, Subject code, Semester, Material category, Unit, Description, Upload file
*(Use a distinctive safety-yellow highlight for important supplementary resources.)*

### SECTION 6: LAST DATES & NOTIFICATIONS
Create an academic notification and deadline management center.

**Features:**
* Display upcoming submission dates, examination dates, registration deadlines, internal assessment dates, assignment deadlines, and supplementary examination dates.
* Publish important academic announcements.
* Show notification history and mark notifications as read.
* Highlight urgent notifications.

**Notification Categories:**
* Exam Notification, Assignment Deadline, Registration Deadline, Supply Examination, Academic Announcement, College Notice, Other Important Updates

**Deadline Management (Each deadline contains):**
* Title, Description, Category, Due date, Due time, Priority, Attachment (optional)

**Visual Indicators:**
* Red (Urgent), Yellow (Upcoming), Blue (General information), Green (Completed)

**Additional Features:**
* Countdown timer for important deadlines, calendar view, upcoming deadlines list, overdue notification indicator, search and filter.

### SECTION 7: ASSIGNMENT
Create an assignment management section.

**Features:**
* Display all assignments organized by subject.
* Display assignment descriptions, assigned date, submission deadline, and assignment status.
* Allow students to upload completed assignments (PDF, DOCX, image).
* Allow students to download assignment questions.
* Track submission history and display confirmation.

**Assignment Status:**
* Not Started, In Progress, Submitted, Overdue, Reviewed

**Assignment Information:**
* Title, Subject name, Subject code, Semester, Description, Assigned date, Last submission date, Question attachment, Student submission attachment

**Additional Features:**
* Deadline countdown, completion progress, filter by subject/status, submission history, resubmission (when enabled by admin).

---

## 5. DASHBOARD

The dashboard should be the first page after login.

**Welcome Section:**
* Display: "Welcome Back, Student!"
* Show: Student name, Current semester, Department, Academic year

**Quick Statistics Cards:**
1. Total Subjects
2. Overall Attendance
3. Available Study Materials
4. Pending Assignments

**Dashboard Widgets:**
* **Recent Uploads:** Syllabus, class notes, question papers, supplementary notes.
* **Upcoming Deadlines:** Next assignment, upcoming examination, registration dates.
* **Attendance Overview:** Overall and subject-wise summary.
* **Latest Notifications:** College notices and academic announcements.
* **Quick Actions:** Browse Syllabus, Open Class Notes, View Question Papers, Mark Attendance, View Assignments.

---

## 6. USER AUTHENTICATION AND ROLES

Implement secure authentication with role-based access control.

**Student Account:**
* View and download academic resources.
* Track attendance, view deadlines, notifications, and assignments.
* Update profile.

**Admin Account:**
* Upload and manage all academic resources.
* Add, edit, and delete subjects.
* Publish announcements, create/manage assignments and deadlines.
* Manage users and view/manage uploaded files.

**Security:**
* Secure login/logout and protected admin dashboard.
* Secure file storage.
* Validate uploaded file types and sizes.
* Restrict unauthorized file deletion.
* Protect student records.

---

## 7. DOCUMENT UPLOAD AND STORAGE SYSTEM

Document uploads are a core requirement for: Syllabus, Class Notes, Question Papers, Supply Special Notes, Assignment attachments, and submissions.

**Supported Formats:**
* PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG

**Upload Functionality:**
* Drag-and-drop file upload & Browse files from device.
* Upload progress bar.
* File size & format validation.
* Success/failure notifications.
* Preview & download documents.
* Delete and replace files (with permissions).

**Document Management:**
Every document must have:
* Unique document ID, File name, File URL, File type, Subject, Semester, Category, Upload date, Uploaded by, Description.
*(Store files in secure cloud storage, not directly inside the database.)*

---

## 8. SEARCH AND FILTER SYSTEM

**Global Search Bar:**
Allow students to search across Syllabus, Class Notes, Question Papers, Supply Special Notes, Assignments, and Notifications.

**Filters:**
* Semester, Subject, Subject code, Academic year, Document type, Upload date, Examination year
*(Include clear filters and useful empty-state messages.)*

---

## 9. DATABASE STRUCTURE

Create a properly structured relational database (e.g., PostgreSQL). Use appropriate foreign keys, indexes, and constraints.

**Suggested Tables:**

* `users`: id, name, email, password_hash, role, department, semester, created_at
* `subjects`: id, subject_name, subject_code, semester, credits
* `documents`: id, title, file_url, file_type, category, subject_id, semester, unit, description, uploaded_by, uploaded_at
* `attendance`: id, student_id, subject_id, date, status
* `assignments`: id, title, subject_id, description, assigned_date, due_date, attachment_url
* `assignment_submissions`: id, assignment_id, student_id, submission_url, status, submitted_at
* `notifications`: id, title, description, category, priority, due_date, attachment_url, created_at
* `notification_reads`: id, notification_id, user_id, read_at

---

## 10. RECOMMENDED TECHNOLOGY STACK

Use a modern and maintainable web development stack with modular architecture.

* **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
* **Backend:** Supabase
* **Database:** PostgreSQL
* **Authentication:** Supabase Authentication
* **File Storage:** Supabase Storage
* **Additional Libraries:** React Router, React Hook Form, Zod, Recharts, date-fns, PDF.js (or an appropriate PDF viewer)

---

## 11. ADDITIONAL ESSENTIAL FEATURES

* **Favorites / Bookmarks:** Bookmark notes, question papers, syllabus, and special notes.
* **Recently Viewed:** Display recently opened academic documents.
* **Dark Mode:** Light and dark themes using the same civil engineering color identity.
* **Academic Calendar:** Containing exam dates, assignment deadlines, holidays, etc.
* **File Preview:** Preview PDFs and supported images without downloading.
* **Personal Profile:** Update profile picture, name, email, department, semester, academic year.
* **Responsive Design:** Must work on Desktop, Laptop, Tablet, and Mobile.
* **Empty States & Loading States:** Professional animations, error messages, and empty states.
* **Data Export:** Export attendance records and assignment status as PDF or CSV.
* **Audit Logs:** Record administrative actions (uploads, deletions, updates).

---

## 12. USER INTERFACE COMPONENTS

Build reusable components:
* Sidebar & Top navigation bar
* Dashboard statistics cards & Document cards
* Upload modal & File upload dropzone
* PDF preview
* Search bar & Filter dropdown
* Attendance progress bar & Attendance calculator
* Deadline countdown & Notification cards
* Assignment cards & Calendar
* Profile menu, Confirmation dialogs, Toast notifications

---

## 13. IMPORTANT DEVELOPMENT REQUIREMENTS

1. Build a fully functional application, not just a static UI prototype.
2. All seven sections must have working navigation.
3. Document uploads must actually save files to cloud storage.
4. Uploaded documents must remain available after refreshing the page.
5. All uploaded files must be associated with the correct subjects and categories.
6. Students must be able to preview and download authorized files.
7. Attendance calculations must be accurate and update automatically.
8. Admin and student permissions must be enforced on the backend.
9. All forms must include proper validation.
10. Use responsive layouts for every section.
11. Show appropriate success and error messages.
12. Avoid placeholder buttons and non-functional interactions.
13. Include database migrations and setup instructions.
14. Provide an environment variable example file.
15. Include a `README.md` explaining how to run and deploy the application.

---

## 14. FINAL DESIGN DIRECTION

The overall interface should feel like a combination of:
* A modern university student portal
* An engineering project management dashboard
* A civil engineering blueprint workspace

Use clean layouts, blueprint-inspired backgrounds, structural grid patterns, subtle engineering illustrations, and modern cards. The interface should feel professional rather than overly decorative. Use safety yellow sparingly to emphasize important deadlines, alerts, and primary actions. The dashboard should be visually impressive while remaining easy to navigate.

---

## 15. FINAL EXPECTED RESULT

Deliver a complete Civil Engineering Academic Portal with exactly seven primary sections (Syllabus, Class Notes, Question Papers, Attendance Marker, Supply Special Notes, Last Dates & Notifications, Assignment).

The application must include student and admin authentication, functional document upload/download, secure cloud file storage, academic resource organization, attendance tracking, assignment management, notifications, search/filtering, and responsive design, all wrapped in a civil engineering-inspired visual identity.

> **FINAL INSTRUCTION TO THE AI CODING TOOL:**
> Build this project as a production-ready, full-stack academic web application. Prioritize working functionality, clean architecture, reliable file uploads, secure access control and an excellent user experience. Do not stop after creating the dashboard UI. Implement all seven modules with working database operations, forms, storage and navigation. Make the application visually polished using blueprint blue, concrete grey and construction safety yellow throughout.