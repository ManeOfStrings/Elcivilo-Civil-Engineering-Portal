import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { supabase, isSupabaseConfigured, deleteAcademicFile } from '../lib/supabase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

/**
 * Maps a snake_case Supabase document record to a camelCase AcademicDocument
 */
export function mapSupabaseDocToAcademicDoc(row: any): AcademicDocument {
  const fileName =
    (row.storage_path ? row.storage_path.split('/').pop() : '') ||
    (row.file_url ? decodeURIComponent(row.file_url.split('/').pop()?.split('?')[0] || '') : '') ||
    `${row.title || 'Document'}.pdf`;

  return {
    id: String(row.id),
    title: row.title || 'Untitled Document',
    fileName,
    description: row.description || '',
    category: (row.category || 'notes') as DocumentCategory,
    semester: Number(row.semester) || 1,
    subjectId: row.subject_id || '',
    subjectCode: row.subject_code || 'CE',
    subjectName: row.subject_name || 'Civil Engineering',
    unit: row.unit || undefined,
    topic: row.topic || undefined,
    examType: row.exam_type || undefined,
    examYear: row.exam_year ? Number(row.exam_year) : undefined,
    supplyCategory: row.supply_category || undefined,
    fileUrl: row.file_url || '',
    fileSize: row.file_size || 'Unknown',
    fileType: (row.file_type || 'PDF').toLowerCase(),
    storagePath: row.storage_path || undefined,
    downloadCount: Number(row.download_count) || 0,
    uploadedAt: row.created_at || new Date().toISOString(),
    uploadedBy: 'Civil Faculty / Admin',
    uploaderRole: 'admin',
    isBookmarked: false,
  };
}

/**
 * Maps a camelCase AcademicDocument to a snake_case Supabase document record for insertion
 */
export function mapAcademicDocToSupabaseRow(
  doc: Omit<AcademicDocument, 'id' | 'uploadedAt' | 'downloadCount'>,
  userId?: string
) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.subjectId || '');

  // Normalize category to allowed enum in database
  let validCategory: 'syllabus' | 'notes' | 'question_paper' | 'supply' = 'notes';
  if (['syllabus', 'notes', 'question_paper', 'supply'].includes(doc.category)) {
    validCategory = doc.category as any;
  }

  return {
    title: doc.title.trim(),
    description: doc.description ? doc.description.trim() : null,
    category: validCategory,
    semester: Math.max(1, Math.min(8, Number(doc.semester) || 1)),
    subject_id: isUuid ? doc.subjectId : null,
    subject_code: doc.subjectCode || 'CE',
    subject_name: doc.subjectName || 'Civil Engineering',
    unit: doc.unit ? doc.unit.trim() : null,
    exam_type: doc.examType || null,
    exam_year: doc.examYear ? Number(doc.examYear) : null,
    supply_category: doc.supplyCategory || null,
    file_url: doc.fileUrl,
    file_size: doc.fileSize || 'Unknown',
    file_type: (doc.fileType || 'PDF').toUpperCase(),
    storage_path: doc.storagePath || null,
    download_count: 0,
    created_by: userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) ? userId : null,
  };
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
  isDocumentsLoading: boolean;
  refreshDocuments: () => Promise<void>;
  migrateLocalStorageDocuments: () => Promise<{ migratedCount: number; skippedCount: number; errors: string[] }>;
  addDocument: (doc: Omit<AcademicDocument, 'id' | 'uploadedAt' | 'downloadCount'>) => Promise<AcademicDocument>;
  deleteDocument: (id: string) => Promise<boolean>;
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
  const [isDocumentsLoading, setIsDocumentsLoading] = useState<boolean>(true);
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

  // Public retrieval of documents from Supabase database (source of truth)
  const fetchDocumentsFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsDocumentsLoading(false);
      return;
    }

    try {
      const { data: dbDocs, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase document retrieval notice:', error.message);
      } else if (dbDocs) {
        const mappedDocs: AcademicDocument[] = dbDocs.map(mapSupabaseDocToAcademicDoc);
        setDocuments(mappedDocs);
        storageService.saveDocuments(mappedDocs);
      }
    } catch (err) {
      console.warn('Supabase document fetch exception:', err);
    } finally {
      setIsDocumentsLoading(false);
    }
  }, []);

  // Fetch documents on mount & subscribe to realtime Postgres changes
  useEffect(() => {
    fetchDocumentsFromSupabase();

    if (!isSupabaseConfigured) return;

    // Realtime channel: automatically updates document list for all connected visitors whenever changes happen
    const channel = supabase
      .channel('public:documents:realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => {
          fetchDocumentsFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDocumentsFromSupabase]);

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
    const existing = subjects.find(
      (s) =>
        s.id === id ||
        s.code.replace(/\s+/g, '').toLowerCase() === id.replace(/\s+/g, '').toLowerCase()
    );
    if (existing) return existing;

    // Fallback: derive subject from documents if not explicitly added in subjects list
    const cleanId = id.replace(/[\s-_]/g, '').toLowerCase();
    const matchingDoc = documents.find(
      (d) =>
        d.subjectId === id ||
        (d.subjectCode && d.subjectCode.replace(/[\s-_]/g, '').toLowerCase() === cleanId) ||
        (d.subjectCode && id.includes(d.subjectCode.replace(/[^a-zA-Z0-9]/g, '_')))
    );
    if (matchingDoc && matchingDoc.subjectCode) {
      return {
        id: matchingDoc.subjectId || id,
        code: matchingDoc.subjectCode,
        name: matchingDoc.subjectName || matchingDoc.title,
        semester: matchingDoc.semester,
        credits: 4,
        description: 'Academic curriculum course in Department of Civil Engineering.',
      };
    }

    return undefined;
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
      const matchSubject =
        d.subjectId === subjectId ||
        (sub && (
          d.subjectId === sub.id ||
          d.subjectCode.replace(/[\s-_]/g, '').toLowerCase() === sub.code.replace(/[\s-_]/g, '').toLowerCase()
        ));
      const matchCat = !category || d.category === category;
      return Boolean(matchSubject && matchCat);
    });
  };

  const addDocument = async (
    docData: Omit<AcademicDocument, 'id' | 'uploadedAt' | 'downloadCount'>
  ): Promise<AcademicDocument> => {
    // 1. If Supabase is configured, insert directly into the cloud database
    if (isSupabaseConfigured) {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      const payload = mapAcademicDocToSupabaseRow(docData, session?.user?.id);
      const { data, error } = await supabase
        .from('documents')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        console.error('Supabase document insert error:', error);
        if (error.message?.includes('row-level security')) {
          throw new Error('Supabase RLS Error: Row-level security prevented database write. Please run the SQL fix script in your Supabase SQL Editor.');
        }
        throw new Error(`Database error: ${error.message}`);
      }

      const savedDoc = mapSupabaseDocToAcademicDoc(data);

      setDocuments((prev) => [savedDoc, ...prev.filter((d) => d.id !== savedDoc.id)]);
      storageService.saveDocuments([savedDoc, ...documents.filter((d) => d.id !== savedDoc.id)]);
      storageService.addAuditLog('Uploaded Document', savedDoc.title, user?.name || 'Admin', `Category: ${savedDoc.category}`);
      setAuditLogs(storageService.getAuditLogs());
      showToast(`"${savedDoc.title}" uploaded and published successfully!`, 'success');

      return savedDoc;
    } else {
      // Standalone / offline fallback
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
      showToast(`"${newDoc.title}" saved locally.`, 'success');
      return newDoc;
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      showToast('Admin privilege required.', 'error');
      return false;
    }
    const target = documents.find((d) => d.id === id);
    if (!target) return false;

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) {
        console.error('Supabase document delete error:', error);
        showToast(`Delete failed: ${error.message}`, 'error');
        return false;
      }

      if (target.storagePath) {
        await deleteAcademicFile(target.storagePath);
      }
    }

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

  const migrateLocalStorageDocuments = async (): Promise<{
    migratedCount: number;
    skippedCount: number;
    errors: string[];
  }> => {
    if (!isSupabaseConfigured) {
      return { migratedCount: 0, skippedCount: 0, errors: ['Supabase is not configured.'] };
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) {
      return {
        migratedCount: 0,
        skippedCount: 0,
        errors: ['Authentication required: Sign into Supabase Auth as Admin before migrating documents.'],
      };
    }

    const localDocs = storageService.getMigratableDocuments();
    if (localDocs.length === 0) {
      return { migratedCount: 0, skippedCount: 0, errors: [] };
    }

    // Query existing records to prevent duplicate insertion
    const { data: remoteDocs, error: fetchError } = await supabase
      .from('documents')
      .select('id, title, file_url, storage_path, semester, subject_code');

    if (fetchError) {
      return { migratedCount: 0, skippedCount: 0, errors: [fetchError.message] };
    }

    const existingUrls = new Set((remoteDocs || []).map((d) => d.file_url).filter(Boolean));
    const existingPaths = new Set((remoteDocs || []).map((d) => d.storage_path).filter(Boolean));
    const existingSignatures = new Set(
      (remoteDocs || []).map(
        (d) => `${(d.title || '').trim().toLowerCase()}__${d.semester}__${(d.subject_code || '').trim().toLowerCase()}`
      )
    );

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    const insertedDocs: AcademicDocument[] = [];

    for (const doc of localDocs) {
      const sig = `${(doc.title || '').trim().toLowerCase()}__${doc.semester}__${(doc.subjectCode || '').trim().toLowerCase()}`;
      if (
        (doc.fileUrl && existingUrls.has(doc.fileUrl)) ||
        (doc.storagePath && existingPaths.has(doc.storagePath)) ||
        existingSignatures.has(sig)
      ) {
        skippedCount++;
        continue;
      }

      try {
        const payload = mapAcademicDocToSupabaseRow(doc, session.user.id);
        const { data, error: insertError } = await supabase
          .from('documents')
          .insert(payload)
          .select('*')
          .single();

        if (insertError) {
          errors.push(`"${doc.title}": ${insertError.message}`);
        } else if (data) {
          migratedCount++;
          existingUrls.add(doc.fileUrl);
          if (doc.storagePath) existingPaths.add(doc.storagePath);
          existingSignatures.add(sig);
          insertedDocs.push(mapSupabaseDocToAcademicDoc(data));
        }
      } catch (err: any) {
        errors.push(`"${doc.title}": ${err.message || 'Error inserting row'}`);
      }
    }

    if (insertedDocs.length > 0) {
      setDocuments((prev) => [...insertedDocs, ...prev]);
      storageService.saveDocuments([...insertedDocs, ...documents]);
      showToast(`Migrated ${migratedCount} document(s) to Supabase database.`, 'success');
    }

    return { migratedCount, skippedCount, errors };
  };

  const downloadDocument = async (doc: {
    title: string;
    fileName?: string;
    fileUrl: string;
    fileSize?: string;
    category?: string;
    subjectCode?: string;
  }) => {
    // Increment download count if matching document exists
    setDocuments((prev) => {
      const updated = prev.map((d) =>
        d.title === doc.title ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d
      );
      storageService.saveDocuments(updated);
      return updated;
    });

    const safeName =
      doc.fileName || `${doc.title.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;

    if (!doc.fileUrl) {
      showToast('Document file URL is not available.', 'error');
      return;
    }

    // 1. If it's already a local blob: or data: URL, download immediately
    if (doc.fileUrl.startsWith('blob:') || doc.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = doc.fileUrl;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded "${safeName}"`, 'success');
      return;
    }

    // 2. Real remote file (e.g. Supabase Storage or external HTTPS URL)
    // Fetch as blob to enforce download filename across origins
    try {
      showToast(`Preparing download for "${safeName}"...`, 'info');
      const response = await fetch(doc.fileUrl, { mode: 'cors' });
      if (response.ok) {
        const fileBlob = await response.blob();
        const blobUrl = URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = safeName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
        showToast(`Downloaded "${safeName}"`, 'success');
        return;
      }
    } catch (err) {
      console.warn('Cross-origin direct blob download failed, falling back to direct window open:', err);
    }

    // 3. Fallback: Open original file directly in new window
    window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
    showToast(`Opened "${safeName}" in new tab`, 'info');
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
        isDocumentsLoading,
        refreshDocuments: fetchDocumentsFromSupabase,
        migrateLocalStorageDocuments,
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
