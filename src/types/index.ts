export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  department?: string;
  rollNumber?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  facultyName?: string;
  description?: string;
}

export type DocumentCategory =
  | 'syllabus'
  | 'notes'
  | 'question_paper'
  | 'supply'
  | 'textbook';

export type NoteUnit = 'Unit 1' | 'Unit 2' | 'Unit 3' | 'Unit 4' | 'Unit 5' | 'General' | string;
export type ExamType = 'End-Semester' | 'Mid-Term' | 'Model Paper' | 'Supplementary' | string;
export type SupplyCategory = 'crash_course' | 'important_questions' | 'previous_paper' | 'formula_sheet' | string;

export interface AcademicDocument {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: 'pdf' | 'docx' | 'pptx' | 'image' | 'xlsx';
  fileSize: string;
  category: DocumentCategory;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  unit?: string; // e.g. "Unit 1", "Module 2"
  topic?: string;
  author?: string;
  edition?: string;
  examType?: string; // e.g. "End-Semester", "Mid-Term", "Model Paper"
  examYear?: number;
  isSupplySpecial?: boolean;
  supplyCategory?: SupplyCategory;
  description?: string;
  uploadedAt: string;
  uploadedBy?: string;
  uploaderRole?: string;
  storagePath?: string;
  downloadCount: number;
  viewsCount?: number;
  isBookmarked?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  description: string;
  dueDate: string;
  dueTime?: string;
  assignedDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  questionAttachmentUrl?: string;
  questionAttachmentName?: string;
  externalSubmissionUrl?: string;
  submissionInstructions?: string;
  maxMarks?: number;
}

export type NotificationCategory =
  | 'Examination'
  | 'Assignment'
  | 'Registration'
  | 'Supply Exam'
  | 'Academic Notice';

export type NotificationPriority = 'urgent' | 'upcoming' | 'info';

export interface AcademicNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  dueDate: string;
  dueTime?: string;
  isUrgent?: boolean;
  priority?: NotificationPriority;
  createdBy?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
  isRead?: boolean;
}

export type ReferenceCodeCategory =
  | 'Structural'
  | 'Concrete'
  | 'Steel'
  | 'Geotechnical'
  | 'Environmental'
  | 'Tables & Charts'
  | 'General';

export interface ReferenceCode {
  id: string;
  codeNumber: string;
  title: string;
  category: ReferenceCodeCategory;
  fileUrl: string;
  fileSize: string;
  description: string;
  year?: number;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  user: string;
  timestamp: string;
  details?: string;
}
