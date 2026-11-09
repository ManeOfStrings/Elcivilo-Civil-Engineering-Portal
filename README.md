# Civil Engineering Academic Portal 🏛️📐

A modern, responsive, production-ready Student Academic Management Web Application built specifically for Civil Engineering departments. Designed with a Blueprint Blue, Cool Concrete, and Construction Safety Yellow aesthetic inspired by technical drafting and structural engineering.

---

## 🏗️ 7 Primary Core Modules

1. **Syllabus (`Module 01`)**:
   - Accredited course syllabi across Semesters 1 to 8.
   - Course credit allocations, lecture schemes, and IS code references.
   - Built-in PDF preview modal and one-click downloads.
   - Upload & delete capabilities with role verification.

2. **Class Notes (`Module 02`)**:
   - Centralized lecture repository categorized by **Unit 1 through Unit 5**, Additional Notes, and Reference Materials.
   - Multi-file subject attachments with topic subheadings.
   - Search by topic, subject code, or semester.

3. **Question Papers (`Module 03`)**:
   - Archive organized by examination year (2020 to 2026).
   - Filter by examination category: **Semester Examination**, **Previous Year**, **Internal Tests**, **Model Examination**, and **Supplementary Examination**.
   - Solved hint sheets and marking schemes.

4. **Attendance Marker (`Module 04`)**:
   - Quick `+1 Present` and `+1 Absent` ledger marking.
   - **Smart Bunk Calculator**: Accurately computes how many classes you can safely miss while maintaining your configured target percentage (e.g. 75%).
   - Reverse recovery calculator: Calculates consecutive classes needed if below threshold.
   - Color indicators: Green (>75%), Yellow (65%-75%), Red (<65%).
   - Export attendance ledger as CSV.

5. **Supply Special Notes (`Module 05`)**:
   - Dedicated high-yield revision hub accented with safety-yellow highlights.
   - Master IS 456 / IRC Formula sheets, guaranteed structural derivations with sketches, solved 5-year question papers, and FAQ banks.

6. **Last Dates & Notifications (`Module 06`)**:
   - Real-time countdown timers for urgent deadlines.
   - Categorized by Exam Notifications, Assignment Due Dates, Supply Registration, and College Circulars.
   - Priority alerts: Red (Urgent), Yellow (Upcoming), Blue (Info).
   - Mark as read/unread state tracking.

7. **Assignment Hub (`Module 07`)**:
   - Download problem statements and assignment briefs.
   - Student solution file submission with file size checking and notes.
   - Professor grading and feedback review.

---

## 🎨 Design System & Color Palette

- **Primary Blue (Blueprint Blue):** `#164B78`
- **Secondary Blue (Steel Blue):** `#2878A8`
- **Concrete Grey (Cool Concrete):** `#D5D9DC`
- **Dark Grey (Structural Charcoal):** `#252C32`
- **Safety Yellow (Construction Yellow):** `#FFD43B`
- **Background (Light Concrete):** `#F4F6F7`
- **Typography:** Headings: *Space Grotesk*, Body: *Inter*, Technical Labels: *IBM Plex Mono*.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn or pnpm

### Installation & Run

1. Clone or navigate to the repository directory:
   ```bash
   cd "d:\Pk  Learning APP"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3000`.

### Production Build & Verification

```bash
npm run build
npm run preview
```

---

## 💾 Architecture & Storage

- **Standalone Offline-First Persistence**: Powered by `localStorage` service that preserves uploaded documents, assignment submissions, attendance counts, and bookmarks even after browser refreshes.
- **Supabase Relational Database Support**: Includes `supabase-schema.sql` with full table schemas, foreign keys, RLS security policies, and performance indexes.
- **Role-Based Access Control**: Instant toggle between **Student Mode** (Civil Engineering Scholar) and **Admin Mode** (Dr. Robert Vance) via the header pill or settings.

