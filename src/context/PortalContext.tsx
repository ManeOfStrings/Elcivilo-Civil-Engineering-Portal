import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicDocument,
  AcademicNotification,
  Assignment,
  AuditLog,
  DocumentCategory,
  ReferenceCode,
  Subject,
} from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface PortalContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Active Semester Filter
  selectedSemester: number;
  setSelectedSemester: (sem: number) => void;
  semesters: number[];

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  deleteSubject: (id: string) => boolean;
  updateSubject: (subject: Subject) => void;
  getSubjectById: (id: string) => Subject | undefined;
  getSubjectsBySemester: (sem: number) => Subject[];

  // Documents
  documents: AcademicDocument[];
  addDocument: (doc: Omit<AcademicDocument, 'id' | 'uploadedAt' | 'downloadCount'>) => void;
  deleteDocument: (id: string) => boolean;
  downloadDocument: (doc: { title: string; fileName?: string; fileUrl: string; fileSize?: string; category?: string; subjectCode?: string }) => void;
  getDocumentsBySubject: (subjectId: string, category?: DocumentCategory) => AcademicDocument[];
  toggleBookmark: (docId: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id'>) => void;
  createAssignment: (asg: Omit<Assignment, 'id'>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentsBySubject: (subjectId: string) => Assignment[];
  gradeAssignment: (assignmentId: string, submissionId: string, score: number, feedback?: string) => void;

  // Notifications
  notifications: AcademicNotification[];
  addNotification: (notif: Omit<AcademicNotification, 'id' | 'createdAt'>) => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // IS Codes & Reference Tables
  referenceCodes: ReferenceCode[];
  addReferenceCode: (code: Omit<ReferenceCode, 'id'>) => void;
  deleteReferenceCode: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];

  // Document Preview Modal
  previewDoc: AcademicDocument | null;
  openPreview: (doc: AcademicDocument) => void;
  closePreview: () => void;

  // Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Admin Upload Modal
  isUploadModalOpen: boolean;
  uploadCategory: DocumentCategory;
  uploadSubjectId?: string;
  openUploadModal: (category?: DocumentCategory, subjectId?: string) => void;
  closeUploadModal: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Reset
  resetPortalData: () => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('elcivilo_theme') === 'dark';
  });

  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const [subjects, setSubjects] = useState<Subject[]>(() => storageService.getSubjects());
  const [documents, setDocuments] = useState<AcademicDocument[]>(() => storageService.getDocuments());
  const [assignments, setAssignments] = useState<Assignment[]>(() => storageService.getAssignments());
  const [notifications, setNotifications] = useState<AcademicNotification[]>(() => storageService.getNotifications());
  const [referenceCodes, setReferenceCodes] = useState<ReferenceCode[]>(() => storageService.getReferenceCodes());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => storageService.getAuditLogs());

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('notes');
  const [uploadSubjectId, setUploadSubjectId] = useState<string | undefined>(undefined);

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('elcivilo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('elcivilo_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subject helpers
  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(
      (s) =>
        s.id === id ||
        s.code.replace(/\s+/g, '').toLowerCase() === id.replace(/\s+/g, '').toLowerCase()
    );
  };

  const getSubjectsBySemester = (sem: number): Subject[] => {
    return subjects.filter((s) => s.semester === sem);
  };

  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub_${Date.now()}`,
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    storageService.saveSubjects(updated);
    storageService.addAuditLog('Added Subject', `${newSub.code}: ${newSub.name}`, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Subject ${newSub.code} added.`, 'success');
  };

  const deleteSubject = (id: string): boolean => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return false;
    }
    const subToDelete = subjects.find((s) => s.id === id);
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    storageService.saveSubjects(updated);
    storageService.addAuditLog('Deleted Subject', subToDelete ? `${subToDelete.code}: ${subToDelete.name}` : id, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Subject ${subToDelete?.code || ''} removed successfully.`, 'info');
    return true;
  };

  const updateSubject = (subject: Subject) => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return;
    }
    const updated = subjects.map((s) => (s.id === subject.id ? subject : s));
    setSubjects(updated);
    storageService.saveSubjects(updated);

    // Keep documents and assignments in sync with updated subject code, name, and semester
    const updatedDocs = documents.map((d) =>
      d.subjectId === subject.id
        ? { ...d, subjectCode: subject.code, subjectName: subject.name, semester: subject.semester }
        : d
    );
    if (JSON.stringify(updatedDocs) !== JSON.stringify(documents)) {
      setDocuments(updatedDocs);
      storageService.saveDocuments(updatedDocs);
    }

    const updatedAsgs = assignments.map((a) =>
      a.subjectId === subject.id
        ? { ...a, subjectCode: subject.code, subjectName: subject.name, semester: subject.semester }
        : a
    );
    if (JSON.stringify(updatedAsgs) !== JSON.stringify(assignments)) {
      setAssignments(updatedAsgs);
      storageService.saveAssignments(updatedAsgs);
    }

    storageService.addAuditLog('Updated Subject', `${subject.code}: ${subject.name}`, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Subject ${subject.code} updated.`, 'success');
  };

  // Documents
  const getDocumentsBySubject = (subjectId: string, category?: DocumentCategory): AcademicDocument[] => {
    const sub = getSubjectById(subjectId);
    return documents.filter((d) => {
      const matchSubject = d.subjectId === subjectId || (sub && d.subjectCode === sub.code);
      const matchCat = !category || d.category === category;
      return matchSubject && matchCat;
    });
  };

  const addDocument = (docData: Omit<AcademicDocument, 'id' | 'uploadedAt' | 'downloadCount'>) => {
    const newDoc: AcademicDocument = {
      ...docData,
      id: `doc_${Date.now()}`,
      uploadedAt: new Date().toISOString(),
      downloadCount: 0,
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    storageService.saveDocuments(updated);
    storageService.addAuditLog('Uploaded Document', newDoc.title, user?.name || 'Admin', `Category: ${newDoc.category}`);
    setAuditLogs(storageService.getAuditLogs());
    showToast(`"${newDoc.title}" uploaded successfully!`, 'success');
  };

  const deleteDocument = (id: string): boolean => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return false;
    }
    const target = documents.find((d) => d.id === id);
    if (!target) return false;

    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    storageService.saveDocuments(updated);
    storageService.addAuditLog('Deleted Document', target.title, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`"${target.title}" deleted.`, 'info');
    if (previewDoc?.id === id) {
      setPreviewDoc(null);
    }
    return true;
  };

  const downloadDocument = (doc: { title: string; fileName?: string; fileUrl: string; fileSize?: string; category?: string; subjectCode?: string }) => {
    // Increment download count if matching document exists
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.title === doc.title ? { ...d, downloadCount: d.downloadCount + 1 } : d));
      storageService.saveDocuments(updated);
      return updated;
    });

    let url = doc.fileUrl;
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      const mockContent = `ELCIVILO | CIVIL ENGINEERING ACADEMIC PORTAL
============================================================
DOCUMENT : ${doc.title}
CATEGORY : ${(doc.category || 'ACADEMIC RESOURCE').toUpperCase()}
CODE     : ${doc.subjectCode || 'IS STANDARD'}
============================================================
Official study resource provided for Civil Engineering students.
Conforms to relevant university curriculum and Bureau of Indian Standards (BIS).
`;
      const blob = new Blob([mockContent], { type: 'text/plain' });
      url = URL.createObjectURL(blob);
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast(`Downloaded "${doc.fileName || doc.title}"`, 'success');
  };

  // Assignments
  const getAssignmentsBySubject = (subjectId: string): Assignment[] => {
    const sub = getSubjectById(subjectId);
    return assignments.filter((a) => a.subjectId === subjectId || (sub && a.subjectCode === sub.code));
  };

  const addAssignment = (asgData: Omit<Assignment, 'id'>) => {
    const newAsg: Assignment = {
      ...asgData,
      id: `asg_${Date.now()}`,
    };
    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    storageService.saveAssignments(updated);
    storageService.addAuditLog('Posted Assignment', newAsg.title, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Assignment "${newAsg.title}" posted.`, 'success');
  };

  const deleteAssignment = (id: string) => {
    if (!isAdmin) return;
    const target = assignments.find((a) => a.id === id);
    if (!target) return;
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    storageService.saveAssignments(updated);
    showToast('Assignment removed.', 'info');
  };

  // Notifications
  const addNotification = (notifData: Omit<AcademicNotification, 'id' | 'createdAt'>) => {
    const newNotif: AcademicNotification = {
      ...notifData,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    storageService.saveNotifications(updated);
    storageService.addAuditLog('Published Notice', newNotif.title, user?.name || 'Admin', `Due: ${newNotif.dueDate}`);
    setAuditLogs(storageService.getAuditLogs());
    showToast('Notice published successfully!', 'success');
  };

  const deleteNotification = (id: string) => {
    if (!isAdmin) return;
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    storageService.saveNotifications(updated);
    showToast('Notice removed.', 'info');
  };

  // IS Codes & Reference Tables
  const addReferenceCode = (codeData: Omit<ReferenceCode, 'id'>) => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return;
    }
    const newCode: ReferenceCode = {
      ...codeData,
      id: `code_${Date.now()}`,
    };
    const updated = [newCode, ...referenceCodes];
    setReferenceCodes(updated);
    storageService.saveReferenceCodes(updated);
    storageService.addAuditLog('Added IS Code', `${newCode.codeNumber}: ${newCode.title}`, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast(`Code "${newCode.codeNumber}" added to repository.`, 'success');
  };

  const deleteReferenceCode = (id: string) => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return;
    }
    const target = referenceCodes.find((c) => c.id === id);
    const updated = referenceCodes.filter((c) => c.id !== id);
    setReferenceCodes(updated);
    storageService.saveReferenceCodes(updated);
    storageService.addAuditLog('Deleted IS Code', target ? `${target.codeNumber}: ${target.title}` : id, user?.name || 'Admin');
    setAuditLogs(storageService.getAuditLogs());
    showToast('Reference code removed.', 'info');
  };

  // Preview Modal
  const openPreview = (doc: AcademicDocument) => {
    setPreviewDoc(doc);
  };

  const closePreview = () => {
    setPreviewDoc(null);
  };

  // Upload Modal
  const openUploadModal = (category: DocumentCategory = 'notes', subjectId?: string) => {
    setUploadCategory(category);
    setUploadSubjectId(subjectId);
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setIsUploadModalOpen(false);
    setUploadSubjectId(undefined);
  };

  // Document Helpers
  const toggleBookmark = (docId: string) => {
    const updated = documents.map((d) => (d.id === docId ? { ...d, isBookmarked: !d.isBookmarked } : d));
    setDocuments(updated);
    storageService.saveDocuments(updated);
  };

  // Notification Helpers
  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    storageService.saveNotifications(updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    storageService.saveNotifications(updated);
  };

  // Assignment Helpers
  const createAssignment = (asgData: Omit<Assignment, 'id'>) => {
    addAssignment(asgData);
  };

  const gradeAssignment = (assignmentId: string, _submissionId: string, score: number, _feedback?: string) => {
    showToast(`Recorded score ${score} for assignment.`, 'success');
  };

  // Reset
  const resetPortalData = () => {
    storageService.resetAllData();
    setSubjects(storageService.getSubjects());
    setDocuments(storageService.getDocuments());
    setAssignments(storageService.getAssignments());
    setNotifications(storageService.getNotifications());
    setReferenceCodes(storageService.getReferenceCodes());
    setAuditLogs(storageService.getAuditLogs());
    showToast('Reset to original Elcivilo Civil Engineering dataset.', 'info');
  };

  return (
    <PortalContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        selectedSemester,
        setSelectedSemester,
        semesters,
        subjects,
        addSubject,
        deleteSubject,
        updateSubject,
        getSubjectById,
        getSubjectsBySemester,
        documents,
        addDocument,
        deleteDocument,
        downloadDocument,
        getDocumentsBySubject,
        toggleBookmark,
        assignments,
        addAssignment,
        createAssignment,
        deleteAssignment,
        getAssignmentsBySubject,
        gradeAssignment,
        notifications,
        addNotification,
        deleteNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        referenceCodes,
        addReferenceCode,
        deleteReferenceCode,
        auditLogs,
        previewDoc,
        openPreview,
        closePreview,
        isSearchOpen,
        setIsSearchOpen,
        isUploadModalOpen,
        uploadCategory,
        uploadSubjectId,
        openUploadModal,
        closeUploadModal,
        toasts,
        showToast,
        removeToast,
        resetPortalData,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
