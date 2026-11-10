import {
  AcademicDocument,
  AcademicNotification,
  Assignment,
  AuditLog,
  ReferenceCode,
  Subject,
} from '../types';
import {
  civilSubjects,
  initialAssignments,
  initialAuditLogs,
  initialDocuments,
  initialNotifications,
  initialReferenceCodes,
} from '../data/initialData';

const KEYS = {
  SUBJECTS: 'elcivilo_v6_subjects',
  DOCUMENTS: 'elcivilo_v6_documents',
  NOTIFICATIONS: 'elcivilo_v6_notifications',
  ASSIGNMENTS: 'elcivilo_v6_assignments',
  REFERENCE_CODES: 'elcivilo_v6_reference_codes',
  AUDIT_LOGS: 'elcivilo_v6_audit_logs',
  THEME: 'elcivilo_v6_theme',
};

// Purge legacy storage keys from previous mock-data versions
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const legacyKeys = [
      'elcivilo_v5_subjects',
      'elcivilo_v5_documents',
      'elcivilo_v5_assignments',
      'elcivilo_v5_notifications',
      'elcivilo_v5_reference_codes',
      'elcivilo_v5_audit_logs',
      'elcivilo_v4_subjects',
      'elcivilo_v4_documents',
      'elcivilo_v4_assignments',
      'elcivilo_v4_notifications',
      'elcivilo_v4_reference_codes',
      'elcivilo_v4_audit_logs',
      'elcivilo_subjects',
      'elcivilo_documents',
      'ce_portal_sgpa_v2_sem_1',
      'ce_portal_sgpa_v2_sem_2',
      'ce_portal_sgpa_v2_sem_3',
      'ce_portal_sgpa_v2_sem_4',
      'ce_portal_sgpa_v2_sem_5',
      'ce_portal_sgpa_v2_sem_6',
      'ce_portal_sgpa_v2_sem_7',
      'ce_portal_sgpa_v2_sem_8',
      'ce_portal_sgpa_v3_sem_1',
      'ce_portal_sgpa_v3_sem_2',
      'ce_portal_sgpa_v3_sem_3',
      'ce_portal_sgpa_v3_sem_4',
      'ce_portal_sgpa_v3_sem_5',
      'ce_portal_sgpa_v3_sem_6',
      'ce_portal_sgpa_v3_sem_7',
      'ce_portal_sgpa_v3_sem_8',
    ];
    legacyKeys.forEach((key) => localStorage.removeItem(key));
  }
} catch {
  // Ignore in environments without window / localStorage
}

export const storageService = {
  getSubjects(): Subject[] {
    const data = localStorage.getItem(KEYS.SUBJECTS);
    return data ? JSON.parse(data) : civilSubjects;
  },

  saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  },

  deleteSubject(id: string): void {
    const subs = this.getSubjects().filter((s) => s.id !== id);
    this.saveSubjects(subs);
  },

  updateSubject(subject: Subject): void {
    const subs = this.getSubjects().map((s) => (s.id === subject.id ? subject : s));
    this.saveSubjects(subs);
  },

  getDocuments(): AcademicDocument[] {
    try {
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  },

  saveDocuments(docs: AcademicDocument[]): void {
    try {
      localStorage.setItem(KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (err) {
      console.warn('Could not cache documents to localStorage:', err);
    }
  },

  getMigratableDocuments(): AcademicDocument[] {
    try {
      const data = localStorage.getItem(KEYS.DOCUMENTS);
      if (!data) return [];
      const parsed: AcademicDocument[] = JSON.parse(data);
      return parsed.filter(
        (d) => d.fileUrl && !d.fileUrl.startsWith('blob:') && !d.fileUrl.startsWith('data:')
      );
    } catch {
      return [];
    }
  },

  getNotifications(): AcademicNotification[] {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : initialNotifications;
  },

  saveNotifications(notifs: AcademicNotification[]): void {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  getAssignments(): Assignment[] {
    const data = localStorage.getItem(KEYS.ASSIGNMENTS);
    return data ? JSON.parse(data) : initialAssignments;
  },

  saveAssignments(assignments: Assignment[]): void {
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(assignments));
  },

  getReferenceCodes(): ReferenceCode[] {
    const data = localStorage.getItem(KEYS.REFERENCE_CODES);
    return data ? JSON.parse(data) : initialReferenceCodes;
  },

  saveReferenceCodes(codes: ReferenceCode[]): void {
    localStorage.setItem(KEYS.REFERENCE_CODES, JSON.stringify(codes));
  },

  getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(KEYS.AUDIT_LOGS);
    return data ? JSON.parse(data) : initialAuditLogs;
  },

  saveAuditLogs(logs: AuditLog[]): void {
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  addAuditLog(action: string, target: string, user: string, details?: string): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action,
      target,
      user,
      timestamp: new Date().toISOString(),
      details,
    };
    logs.unshift(newLog);
    this.saveAuditLogs(logs.slice(0, 50));
  },

  getUser(): any {
    const data = localStorage.getItem('elcivilo_v5_user');
    return data ? JSON.parse(data) : null;
  },

  saveUser(user: any): void {
    localStorage.setItem('elcivilo_v5_user', JSON.stringify(user));
  },

  resetAllData(): void {
    localStorage.removeItem(KEYS.SUBJECTS);
    localStorage.removeItem(KEYS.DOCUMENTS);
    localStorage.removeItem(KEYS.NOTIFICATIONS);
    localStorage.removeItem(KEYS.ASSIGNMENTS);
    localStorage.removeItem(KEYS.REFERENCE_CODES);
    localStorage.removeItem(KEYS.AUDIT_LOGS);
  },
};
