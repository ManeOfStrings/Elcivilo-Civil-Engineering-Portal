import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ElciviloLayout } from './components/layout/ElciviloLayout';

// Core Navigation Flow Pages
import { HomePage } from './components/pages/HomePage';
import { SemesterPage } from './components/pages/SemesterPage';
import { SubjectPage } from './components/pages/SubjectPage';
import { SavedResourcesPage } from './components/pages/SavedResourcesPage';

// The 8 Primary Functional Modules (Specified in Prompt)
import { SyllabusSection } from './components/sections/SyllabusSection';
import { ClassNotesSection } from './components/sections/ClassNotesSection';
import { QuestionPapersSection } from './components/sections/QuestionPapersSection';
import { SupplyNotesSection } from './components/sections/SupplyNotesSection';
import { NotificationsSection } from './components/sections/NotificationsSection';
import { AssignmentSection } from './components/sections/AssignmentSection';
import { SgpaCalculatorSection } from './components/sections/SgpaCalculatorSection';
import { IsCodesSection } from './components/sections/IsCodesSection';

// Admin Views
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminAuthGuard } from './components/admin/AdminAuthGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUpload } from './components/admin/AdminUpload';
import { AdminManage } from './components/admin/AdminManage';
import { StudentRoster } from './components/admin/StudentRoster';
import { AuditLogsPage } from './components/pages/AuditLogsPage';
import { usePortal } from './context/PortalContext';

// Helper component for direct /subject/:subjectId route
const SubjectRedirectWrapper: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { getSubjectById } = usePortal();
  const sub = getSubjectById(subjectId || '');

  if (sub) {
    return <Navigate to={`/semester/${sub.semester}/subject/${sub.id}`} replace />;
  }
  return <Navigate to="/" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ELCIVILO STUDENT ROUTES (Strictly No Login Required) */}
        <Route element={<ElciviloLayout />}>
          {/* Main Architecture & Flow */}
          {/* 1. Homepage: Clean grid of Semesters (Semester 1 through Semester 8) */}
          <Route path="/" element={<HomePage />} />

          {/* 2. Semester View: Organized list of Subjects taught in that semester */}
          <Route path="/semester/:semId" element={<SemesterPage />} />

          {/* 3. Subject View: Resource hub (Notes, Textbooks, Assignments, PYQs, Syllabus) */}
          <Route path="/semester/:semId/subject/:subjectId" element={<SubjectPage />} />
          <Route path="/subject/:subjectId" element={<SubjectRedirectWrapper />} />

          {/* The Exactly 8 Primary Navigation Sections */}
          {/* 1. Syllabus */}
          <Route path="/syllabus" element={<SyllabusSection />} />

          {/* 2. Class Notes */}
          <Route path="/notes" element={<ClassNotesSection />} />

          {/* 3. Question Papers */}
          <Route path="/papers" element={<QuestionPapersSection />} />

          {/* 4. Supply Special Notes */}
          <Route path="/supply" element={<SupplyNotesSection />} />

          {/* 5. Notifications */}
          <Route path="/notifications" element={<NotificationsSection />} />
          <Route path="/last-date" element={<Navigate to="/notifications" replace />} />

          {/* 6. Assignment */}
          <Route path="/assignments" element={<AssignmentSection />} />

          {/* 7. SGPA Calculator */}
          <Route path="/sgpa" element={<SgpaCalculatorSection />} />

          {/* 8. IS Codes & Reference Tables */}
          <Route path="/is-codes" element={<IsCodesSection />} />

          {/* Pinned Quick Access */}
          <Route path="/saved" element={<SavedResourcesPage />} />
          <Route path="/favorites" element={<Navigate to="/saved" replace />} />
          <Route path="/attendance" element={<Navigate to="/" replace />} />
        </Route>

        {/* ADMIN AUTHENTICATION GATEWAY */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* SECURE ADMIN ROUTES (Protected with AdminAuthGuard) */}
        <Route element={<AdminAuthGuard />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/upload" element={<AdminUpload />} />
            <Route path="/admin/manage" element={<AdminManage />} />
            <Route path="/admin/roster" element={<StudentRoster />} />
            <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Route>

        {/* CATCH-ALL ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
