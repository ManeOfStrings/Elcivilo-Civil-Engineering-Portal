import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  FileText,
  Bell,
  ClipboardList,
  Plus,
  Trash2,
  Eye,
  Search,
  ExternalLink,
  UploadCloud,
  BookMarked,
  Download,
  Edit3,
  X,
  RefreshCw,
  Database,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  DocumentCategory,
  NotificationCategory,
  NotificationPriority,
  Subject,
  ReferenceCodeCategory,
} from '../../types';

// Security Helper: Sanitize external URLs to prevent javascript: and dangerous scheme XSS
const sanitizeExternalUrl = (rawUrl?: string): string => {
  if (!rawUrl) return '#';
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed;
    }
  }
  return '#';
};

// Security Helper: Sanitize filenames to prevent path traversal and header injection
const sanitizeFileName = (base: string): string => {
  return `${base.replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`;
};

export const AdminManage: React.FC = () => {
  const {
    documents,
    deleteDocument,
    openPreview,
    downloadDocument,
    migrateLocalStorageDocuments,
    refreshDocuments,
    isDocumentsLoading,
    notifications,
    addNotification,
    deleteNotification,
    assignments,
    createAssignment,
    deleteAssignment,
    subjects,
    addSubject,
    deleteSubject,
    updateSubject,
    referenceCodes,
    addReferenceCode,
    deleteReferenceCode,
    showToast,
  } = usePortal();

  const [activeTab, setActiveTab] = useState<'documents' | 'subjects' | 'notifications' | 'assignments' | 'codes'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const res = await migrateLocalStorageDocuments();
      if (res.errors.length > 0) {
        showToast(`Migration partially completed: ${res.migratedCount} uploaded, ${res.errors.length} failed. (${res.errors[0]})`, 'error');
      } else if (res.migratedCount > 0) {
        showToast(`Successfully migrated ${res.migratedCount} local document(s) to Supabase database!`, 'success');
      } else {
        showToast(`All local documents are already synchronized with Supabase (${res.skippedCount} matched).`, 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Migration failed.', 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  // Subjects Tab State
  const [subjectSemFilter, setSubjectSemFilter] = useState<number | 'all'>('all');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubSem, setNewSubSem] = useState(1);
  const [newSubCredits, setNewSubCredits] = useState(4);
  const [newSubFaculty, setNewSubFaculty] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');

  // Edit Subject Modal State
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubCode, setEditSubCode] = useState('');
  const [editSubName, setEditSubName] = useState('');
  const [editSubSem, setEditSubSem] = useState(1);
  const [editSubCredits, setEditSubCredits] = useState(4);
  const [editSubFaculty, setEditSubFaculty] = useState('');
  const [editSubDesc, setEditSubDesc] = useState('');

  // New Notification Form State
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDesc, setNotifDesc] = useState('');
  const [notifCat, setNotifCat] = useState<NotificationCategory>('Academic Notice');
  const [notifPriority, setNotifPriority] = useState<NotificationPriority>('upcoming');
  const [notifDueDate, setNotifDueDate] = useState('');

  // New Assignment Form State
  const [isAsgModalOpen, setIsAsgModalOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubjectId, setAsgSubjectId] = useState(subjects[0]?.id || '');
  const [asgSemester, setAsgSemester] = useState(1);
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('');
  const [asgMarks, setAsgMarks] = useState(50);
  const [asgExtUrl, setAsgExtUrl] = useState('https://forms.google.com/');
  const [asgInstructions, setAsgInstructions] = useState('Submit your completed calculation sheet and drawing in PDF format.');

  // IS Codes Tab State
  const [codeSearch, setCodeSearch] = useState('');
  const [codeCategoryFilter, setCodeCategoryFilter] = useState<string>('All');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [newCodeNumber, setNewCodeNumber] = useState('');
  const [newCodeTitle, setNewCodeTitle] = useState('');
  const [newCodeCategory, setNewCodeCategory] = useState<ReferenceCodeCategory>('Structural');
  const [newCodeDesc, setNewCodeDesc] = useState('');
  const [newCodeYear, setNewCodeYear] = useState<number>(2024);
  const [newCodeSize, setNewCodeSize] = useState('4.5 MB');

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchCat = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.subjectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [documents, categoryFilter, searchQuery]);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((sub) => {
      const matchSem = subjectSemFilter === 'all' || sub.semester === subjectSemFilter;
      const matchSearch =
        !subjectSearch.trim() ||
        sub.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        sub.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (sub.facultyName && sub.facultyName.toLowerCase().includes(subjectSearch.toLowerCase()));
      return matchSem && matchSearch;
    });
  }, [subjects, subjectSemFilter, subjectSearch]);

  // Filtered IS codes
  const filteredCodes = useMemo(() => {
    return referenceCodes.filter((c) => {
      const matchCat = codeCategoryFilter === 'All' || c.category === codeCategoryFilter;
      const matchSearch =
        !codeSearch.trim() ||
        c.codeNumber.toLowerCase().includes(codeSearch.toLowerCase()) ||
        c.title.toLowerCase().includes(codeSearch.toLowerCase()) ||
        c.description.toLowerCase().includes(codeSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [referenceCodes, codeCategoryFilter, codeSearch]);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newSubCode.trim().toUpperCase().slice(0, 30);
    const cleanName = newSubName.trim().slice(0, 150);
    if (!cleanCode || !cleanName) {
      showToast('Please enter both course code and subject name.', 'error');
      return;
    }

    const cleanSem = Math.max(1, Math.min(8, Math.floor(Number(newSubSem)) || 1));
    const cleanCredits = Math.max(0.5, Math.min(12, Number(newSubCredits) || 3));
    const cleanFaculty = newSubFaculty.trim().slice(0, 100) || undefined;
    const cleanDesc = newSubDesc.trim().slice(0, 1000) || undefined;

    addSubject({
      code: cleanCode,
      name: cleanName,
      semester: cleanSem,
      credits: cleanCredits,
      facultyName: cleanFaculty,
      description: cleanDesc,
    });

    setNewSubCode('');
    setNewSubName('');
    setNewSubCredits(4);
    setNewSubFaculty('');
    setNewSubDesc('');
    setIsSubModalOpen(false);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setEditSubCode(sub.code);
    setEditSubName(sub.name);
    setEditSubSem(sub.semester);
    setEditSubCredits(sub.credits);
    setEditSubFaculty(sub.facultyName || '');
    setEditSubDesc(sub.description || '');
  };

  const handleSaveEditSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    const cleanCode = editSubCode.trim().toUpperCase().slice(0, 30);
    const cleanName = editSubName.trim().slice(0, 150);
    if (!cleanCode || !cleanName) {
      showToast('Please enter both course code and subject name.', 'error');
      return;
    }

    const cleanSem = Math.max(1, Math.min(8, Math.floor(Number(editSubSem)) || 1));
    const cleanCredits = Math.max(0.5, Math.min(12, Number(editSubCredits) || 3));
    const cleanFaculty = editSubFaculty.trim().slice(0, 100) || undefined;
    const cleanDesc = editSubDesc.trim().slice(0, 1000) || undefined;

    updateSubject({
      id: editingSubject.id,
      code: cleanCode,
      name: cleanName,
      semester: cleanSem,
      credits: cleanCredits,
      facultyName: cleanFaculty,
      description: cleanDesc,
    });

    setEditingSubject(null);
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = notifTitle.trim().slice(0, 200);
    const cleanDesc = notifDesc.trim().slice(0, 2000);
    if (!cleanTitle || !cleanDesc) {
      showToast('Please fill in title and description', 'error');
      return;
    }

    const cleanDueDate = notifDueDate.trim() || new Date().toISOString().split('T')[0];

    addNotification({
      title: cleanTitle,
      description: cleanDesc,
      category: notifCat,
      priority: notifPriority,
      dueDate: cleanDueDate,
      createdBy: 'Head of Civil Department',
    });

    setIsNotifModalOpen(false);
    setNotifTitle('');
    setNotifDesc('');
    showToast('Published new circular to student noticeboard!', 'success');
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSem = Math.max(1, Math.min(8, Math.floor(Number(asgSemester)) || 1));
    const semSubjects = subjects.filter((s) => s.semester === cleanSem);
    const currentSub = semSubjects.find((s) => s.id === asgSubjectId) || semSubjects[0];

    if (!currentSub) {
      showToast(`No subjects exist for Semester ${cleanSem}. Please add a subject first in the Subjects tab.`, 'error');
      return;
    }

    const cleanTitle = asgTitle.trim().slice(0, 200);
    const cleanDesc = asgDesc.trim().slice(0, 2000);
    if (!cleanTitle || !cleanDesc) {
      showToast('Please fill in assignment title and description', 'error');
      return;
    }

    const trimmedUrl = asgExtUrl.trim();
    let validatedUrl = trimmedUrl;
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      validatedUrl = `https://${trimmedUrl}`;
    }

    try {
      const parsed = new URL(validatedUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        showToast('Please enter a valid HTTP or HTTPS submission URL.', 'error');
        return;
      }
    } catch {
      showToast('Please enter a valid submission URL (e.g. https://forms.google.com/...)', 'error');
      return;
    }

    const cleanMarks = Math.max(1, Math.min(500, Math.floor(Number(asgMarks)) || 50));
    const cleanDueDate = asgDueDate.trim() || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    createAssignment({
      title: cleanTitle,
      subjectId: currentSub.id,
      subjectCode: currentSub.code,
      subjectName: currentSub.name,
      semester: cleanSem,
      description: cleanDesc,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: cleanDueDate,
      maxMarks: cleanMarks,
      externalSubmissionUrl: validatedUrl,
      submissionInstructions: asgInstructions.trim().slice(0, 1000),
    });

    setIsAsgModalOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    showToast('Assignment and submission link posted for students!', 'success');
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCodeNumber = newCodeNumber.trim().toUpperCase().slice(0, 50);
    const cleanTitle = newCodeTitle.trim().slice(0, 250);
    if (!cleanCodeNumber || !cleanTitle) {
      showToast('Please enter both standard code and title.', 'error');
      return;
    }

    const cleanDesc = newCodeDesc.trim().slice(0, 1000) || 'Official Indian Standard code of practice.';
    const cleanYear = Math.max(1900, Math.min(2100, Math.floor(Number(newCodeYear)) || new Date().getFullYear()));
    const cleanSize = newCodeSize.trim().slice(0, 30) || '4.2 MB';

    addReferenceCode({
      codeNumber: cleanCodeNumber,
      title: cleanTitle,
      category: newCodeCategory,
      description: cleanDesc,
      year: cleanYear,
      fileSize: cleanSize,
      fileUrl: '/mock-docs/sample-is-code.pdf',
    });

    setIsCodeModalOpen(false);
    setNewCodeNumber('');
    setNewCodeTitle('');
    setNewCodeDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-safety/20 text-concrete-950 dark:text-safety font-mono text-xs font-bold border border-safety/40">
            <Layers className="h-4 w-4" />
            <span>FULL CRUD REPOSITORY MODERATION</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-concrete-900 dark:text-white tracking-tight">
            Curriculum, Subjects & Moderation
          </h1>
          <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 leading-relaxed font-sans">
            Add official semester courses, upload syllabus and lecture documents, issue circulars, and post assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/admin/upload">
            <Button variant="blueprint" size="md" icon={<UploadCloud className="h-4.5 w-4.5" />}>
              Upload File
            </Button>
          </Link>
          <Button
            variant="safety"
            size="md"
            icon={<Plus className="h-4.5 w-4.5" />}
            onClick={() => {
              if (activeTab === 'subjects') setIsSubModalOpen(true);
              else if (activeTab === 'notifications') setIsNotifModalOpen(true);
              else if (activeTab === 'assignments') setIsAsgModalOpen(true);
              else if (activeTab === 'codes') setIsCodeModalOpen(true);
              else setIsSubModalOpen(true);
            }}
          >
            {activeTab === 'subjects'
              ? 'Add Subject'
              : activeTab === 'assignments'
                ? 'Post Assignment'
                : activeTab === 'notifications'
                  ? 'Issue Circular'
                  : activeTab === 'codes'
                    ? 'Add IS Code'
                    : 'Add Subject'}
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 border-b border-concrete-200 dark:border-concrete-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'documents'
            ? 'bg-blueprint-700 text-white shadow-blueprint'
            : 'bg-white dark:bg-concrete-900 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
            }`}
        >
          <FileText className="h-4.5 w-4.5" />
          <span>Curriculum Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'subjects'
            ? 'bg-blueprint-700 text-white shadow-blueprint'
            : 'bg-white dark:bg-concrete-900 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
            }`}
        >
          <Layers className="h-4.5 w-4.5" />
          <span>Subjects & Courses ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'notifications'
            ? 'bg-blueprint-700 text-white shadow-blueprint'
            : 'bg-white dark:bg-concrete-900 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
            }`}
        >
          <Bell className="h-4.5 w-4.5" />
          <span>Notices & Deadlines ({notifications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'assignments'
            ? 'bg-blueprint-700 text-white shadow-blueprint'
            : 'bg-white dark:bg-concrete-900 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
            }`}
        >
          <ClipboardList className="h-4.5 w-4.5" />
          <span>Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('codes')}
          className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer shrink-0 ${activeTab === 'codes'
            ? 'bg-blueprint-700 text-white shadow-blueprint'
            : 'bg-white dark:bg-concrete-900 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-100'
            }`}
        >
          <BookMarked className="h-4.5 w-4.5" />
          <span>IS Codes & Standards ({referenceCodes.length})</span>
        </button>
      </div>

      {/* Tab 1: Documents Management */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Supabase Cloud Sync & Migration Card */}
          <div className="p-6 rounded-3xl bg-blueprint-900/10 dark:bg-blueprint-950/40 border border-blueprint-300 dark:border-blueprint-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-blueprint-700 dark:text-blueprint-300">
                <Database className="h-4 w-4 text-blueprint-500" />
                <span>SUPABASE CLOUD DATABASE SYNC</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px]">
                  {isDocumentsLoading ? 'Loading records...' : `${documents.length} live records`}
                </span>
              </div>
              <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans max-w-2xl">
                All visitors load curriculum documents directly from the Supabase <code className="font-mono text-blueprint-600 dark:text-blueprint-400">documents</code> table. If you previously uploaded files that are stored only in this browser, click below to migrate their metadata to Supabase.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => refreshDocuments()}
                disabled={isDocumentsLoading}
                className="px-3 py-2 rounded-xl border border-concrete-300 dark:border-concrete-700 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Refresh from Supabase"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isDocumentsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleMigrate}
                disabled={isMigrating}
                className="px-4 py-2 rounded-xl bg-blueprint-700 hover:bg-blueprint-800 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>{isMigrating ? 'Migrating...' : 'Migrate Local Docs to Cloud'}</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-concrete-900 p-5 rounded-3xl border border-concrete-300 dark:border-concrete-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="font-mono text-xs text-concrete-500 uppercase tracking-wider font-semibold">Filter:</span>
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${categoryFilter === 'all'
                  ? 'bg-blueprint-700 text-white'
                  : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300'
                  }`}
              >
                All Categories
              </button>
              {(['syllabus', 'notes', 'question_paper', 'supply', 'textbook'] as DocumentCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${categoryFilter === cat
                    ? 'bg-blueprint-700 text-white'
                    : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300'
                    }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-concrete-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-concrete-900 rounded-3xl border border-concrete-300 dark:border-concrete-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-concrete-50 dark:bg-concrete-800/80 border-b border-concrete-200 dark:border-concrete-700 font-mono uppercase text-concrete-500 text-[11px]">
                  <tr>
                    <th className="p-4">Document Title & Code</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Size & Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 dark:divide-concrete-800">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-concrete-50/50 dark:hover:bg-concrete-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-heading font-bold text-sm text-concrete-900 dark:text-white">
                          {doc.title}
                        </div>
                        <div className="font-mono text-[11px] text-concrete-400 mt-0.5">
                          {doc.subjectCode} • {doc.subjectName}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={doc.category === 'supply' ? 'warning' : 'concrete'} size="sm">
                          {doc.category.toUpperCase().replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono font-bold">Sem {doc.semester}</td>
                      <td className="p-4 font-mono text-concrete-500">
                        {doc.fileSize} • {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openPreview(doc)}
                            className="p-1.5 text-concrete-400 hover:text-blueprint-600 rounded-lg hover:bg-concrete-100 dark:hover:bg-concrete-800"
                            title="Preview Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete document "${doc.title}"?`)) {
                                await deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-concrete-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-concrete-500 font-mono text-xs">
                        No curriculum documents found. Click "Upload File" above to add new files.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subjects Management */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-concrete-900 p-5 rounded-3xl border border-concrete-300 dark:border-concrete-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <span className="font-mono text-xs text-concrete-500 uppercase tracking-wider font-semibold mr-1">Semester:</span>
              <button
                onClick={() => setSubjectSemFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${subjectSemFilter === 'all'
                  ? 'bg-blueprint-700 text-white'
                  : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300'
                  }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectSemFilter(s)}
                  className={`w-7 h-7 rounded-xl text-xs font-mono font-bold transition-all ${subjectSemFilter === s
                    ? 'bg-blueprint-700 text-white'
                    : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-concrete-400" />
                <input
                  type="text"
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  placeholder="Search code or subject..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsSubModalOpen(true)}
              >
                New Subject
              </Button>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white dark:bg-concrete-900 rounded-3xl border border-concrete-300 dark:border-concrete-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-concrete-50 dark:bg-concrete-800/80 border-b border-concrete-200 dark:border-concrete-700 font-mono uppercase text-concrete-500 text-[11px]">
                  <tr>
                    <th className="p-4">Course Code</th>
                    <th className="p-4">Subject Title</th>
                    <th className="p-4">Semester</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Instructor</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 dark:divide-concrete-800">
                  {filteredSubjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-concrete-50/50 dark:hover:bg-concrete-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800">
                          {sub.code}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-heading font-bold text-sm text-concrete-900 dark:text-white">
                          {sub.name}
                        </div>
                        {sub.description && (
                          <div className="text-xs text-concrete-500 font-sans line-clamp-1 mt-0.5">
                            {sub.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-mono font-bold">Semester {sub.semester}</td>
                      <td className="p-4 font-mono text-concrete-600 dark:text-concrete-300 font-semibold">
                        {sub.credits} Credits
                      </td>
                      <td className="p-4 font-sans text-concrete-600 dark:text-concrete-300">
                        {sub.facultyName || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/semester/${sub.semester}/subject/${sub.id}`}
                            className="p-1.5 text-concrete-400 hover:text-blueprint-600 rounded-lg hover:bg-concrete-100 dark:hover:bg-concrete-800 transition-colors"
                            title="View Subject Hub"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleOpenEditSubject(sub)}
                            className="p-1.5 text-concrete-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                            title="Edit Subject"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete subject ${sub.code}: ${sub.name}?`)) {
                                deleteSubject(sub.id);
                              }
                            }}
                            className="p-1.5 text-concrete-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubjects.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-concrete-500 font-mono text-xs">
                        No subjects found. Click "New Subject" above to add course subjects.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notifications Management */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-6 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={notif.priority === 'urgent' ? 'danger' : 'concrete'} size="sm">
                      {notif.category}
                    </Badge>
                    <span className="text-xs font-mono text-concrete-400">
                      Due: {notif.dueDate}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-concrete-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans leading-relaxed">
                    {notif.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    deleteNotification(notif.id);
                    showToast('Notification deleted', 'info');
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="col-span-2 p-12 text-center rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 text-concrete-500 font-mono text-xs">
                No active notices or circulars. Click "Issue Circular" to publish one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Assignments Management */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 font-bold">
                    {asg.subjectCode} • Sem {asg.semester}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-concrete-500 font-bold">
                      Max Marks: {asg.maxMarks}
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete assignment "${asg.title}"?`)) {
                          deleteAssignment(asg.id);
                        }
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h4 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
                  {asg.title}
                </h4>
                <p className="text-xs text-concrete-600 dark:text-concrete-400 leading-relaxed font-sans line-clamp-3">
                  {asg.description}
                </p>

                {asg.externalSubmissionUrl && (
                  <div className="p-3 rounded-xl bg-concrete-50 dark:bg-concrete-800/60 border border-concrete-200 dark:border-concrete-700 text-xs font-mono space-y-1">
                    <span className="text-concrete-500 block text-[10px] uppercase font-bold">
                      External Student Submission Link:
                    </span>
                    <a
                      href={sanitizeExternalUrl(asg.externalSubmissionUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blueprint-600 dark:text-blueprint-400 font-semibold hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{asg.externalSubmissionUrl}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                <div className="pt-3 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-concrete-500">Cutoff: {asg.dueDate}</span>
                  <span className="text-emerald-600 font-bold">Public Read-Only Active</span>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <div className="col-span-2 p-12 text-center rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 text-concrete-500 font-mono text-xs">
                No assignments posted yet. Click "Post Assignment" to add one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: IS Codes & Reference Standards */}
      {activeTab === 'codes' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-concrete-900 p-5 rounded-3xl border border-concrete-300 dark:border-concrete-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {['All', 'Structural', 'Concrete', 'Steel', 'Geotechnical', 'Tables & Charts', 'General'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCodeCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                    codeCategoryFilter === cat
                      ? 'bg-blueprint-700 text-white shadow-sm'
                      : 'bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-concrete-400" />
                <input
                  type="text"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  placeholder="Search IS Code or title..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCodeModalOpen(true)}
              >
                New IS Code
              </Button>
            </div>
          </div>

          {/* IS Codes Table */}
          <div className="bg-white dark:bg-concrete-900 rounded-3xl border border-concrete-300 dark:border-concrete-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-concrete-50 dark:bg-concrete-800/80 border-b border-concrete-200 dark:border-concrete-700 font-mono uppercase text-concrete-500 text-[11px]">
                  <tr>
                    <th className="p-4">Standard Code</th>
                    <th className="p-4">Standard Title & Scope</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Edition / Year</th>
                    <th className="p-4">File Size</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-concrete-100 dark:divide-concrete-800">
                  {filteredCodes.map((code) => (
                    <tr key={code.id} className="hover:bg-concrete-50/50 dark:hover:bg-concrete-800/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800">
                          {code.codeNumber}
                        </span>
                      </td>
                      <td className="p-4 max-w-md">
                        <div className="font-heading font-bold text-sm text-concrete-900 dark:text-white">
                          {code.title}
                        </div>
                        {code.description && (
                          <div className="text-xs text-concrete-500 font-sans line-clamp-1 mt-0.5">
                            {code.description}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="concrete" size="sm">
                          {code.category}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-concrete-600 dark:text-concrete-300 font-semibold">
                        {code.year || '—'}
                      </td>
                      <td className="p-4 font-mono text-concrete-500">
                        {code.fileSize}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              openPreview({
                                id: code.id,
                                title: `${code.codeNumber}: ${code.title}`,
                                fileName: sanitizeFileName(code.codeNumber),
                                fileUrl: code.fileUrl,
                                fileType: 'pdf',
                                fileSize: code.fileSize,
                                category: 'notes',
                                subjectId: 'codes',
                                subjectCode: code.codeNumber,
                                subjectName: 'IS Codes & Reference Tables',
                                semester: 0,
                                description: code.description,
                                uploadedAt: new Date().toISOString(),
                                downloadCount: 1,
                              });
                            }}
                            className="p-1.5 text-concrete-400 hover:text-blueprint-600 rounded-lg hover:bg-concrete-100 dark:hover:bg-concrete-800 transition-colors"
                            title="Preview Document"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              downloadDocument({
                                title: `${code.codeNumber} - ${code.title}`,
                                fileName: sanitizeFileName(code.codeNumber),
                                fileUrl: code.fileUrl,
                                category: 'notes',
                                subjectCode: code.codeNumber,
                              });
                            }}
                            className="p-1.5 text-concrete-400 hover:text-blueprint-600 rounded-lg hover:bg-concrete-100 dark:hover:bg-concrete-800 transition-colors"
                            title="Download Standard"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete IS Code ${code.codeNumber}: ${code.title}?`)) {
                                deleteReferenceCode(code.id);
                              }
                            }}
                            className="p-1.5 text-concrete-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Delete Standard"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-concrete-500 font-mono text-xs">
                        No IS codes found. Click "New IS Code" to add standards to the repository.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Subject */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <h3 className="font-heading font-bold text-xl text-concrete-900 dark:text-white">
                Add New Subject / Course
              </h3>
              <button
                type="button"
                onClick={() => setIsSubModalOpen(false)}
                className="p-1 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. CE-301"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Semester *
                  </label>
                  <select
                    value={newSubSem}
                    onChange={(e) => setNewSubSem(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Subject Full Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Structural Analysis & Design"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={newSubCredits}
                    onChange={(e) => setNewSubCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Faculty / Instructor (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Dr. Doom"
                    value={newSubFaculty}
                    onChange={(e) => setNewSubFaculty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Core course topics and lecture units..."
                  value={newSubDesc}
                  onChange={(e) => setNewSubDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-concrete-100 dark:border-concrete-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsSubModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Subject */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-concrete-900 dark:text-white">
                    Edit Subject
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">
                    Modifying {editingSubject.code}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubject(null)}
                className="p-1 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubject} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. CE-301"
                    value={editSubCode}
                    onChange={(e) => setEditSubCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Semester *
                  </label>
                  <select
                    value={editSubSem}
                    onChange={(e) => setEditSubSem(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Subject Full Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="e.g. Structural Analysis & Design"
                  value={editSubName}
                  onChange={(e) => setEditSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={editSubCredits}
                    onChange={(e) => setEditSubCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Faculty / Instructor (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Dr. Doom"
                    value={editSubFaculty}
                    onChange={(e) => setEditSubFaculty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Core course topics and lecture units..."
                  value={editSubDesc}
                  onChange={(e) => setEditSubDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-concrete-100 dark:border-concrete-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingSubject(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<Edit3 className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Notification */}
      {isNotifModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <h3 className="font-heading font-bold text-xl text-concrete-900 dark:text-white">
                Publish Academic Circular
              </h3>
              <button
                type="button"
                onClick={() => setIsNotifModalOpen(false)}
                className="p-1 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNotification} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Circular Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g. Concrete Laboratory Exam Schedule Announcement"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Description & Instructions *
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={notifDesc}
                  onChange={(e) => setNotifDesc(e.target.value)}
                  placeholder="Detailed guidelines, room numbers, allowed reference codes..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={notifPriority}
                    onChange={(e) => setNotifPriority(e.target.value as NotificationPriority)}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="urgent">Urgent</option>
                    <option value="info">Informational</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Due / Expiry Date
                  </label>
                  <input
                    type="date"
                    value={notifDueDate}
                    onChange={(e) => setNotifDueDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-concrete-100 dark:border-concrete-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNotifModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="safety" size="sm">
                  Publish Circular
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Assignment with External URL */}
      {isAsgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <h3 className="font-heading font-bold text-xl text-concrete-900 dark:text-white">
                Post Course Assignment
              </h3>
              <button
                type="button"
                onClick={() => setIsAsgModalOpen(false)}
                className="p-1 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-concrete-500 font-mono">
              Students do not log in. Submissions will be collected via your external Google Form / University Portal link.
            </p>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Continuous Beam Design & Moment Distribution"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Semester
                  </label>
                  <select
                    value={asgSemester}
                    onChange={(e) => {
                      const sem = Number(e.target.value);
                      setAsgSemester(sem);
                      const firstSub = subjects.find((s) => s.semester === sem);
                      setAsgSubjectId(firstSub ? firstSub.id : '');
                    }}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Subject
                  </label>
                  {subjects.filter((s) => s.semester === asgSemester).length === 0 ? (
                    <div className="p-2 text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200">
                      No subjects for Sem {asgSemester}. Add one first!
                    </div>
                  ) : (
                    <select
                      value={asgSubjectId}
                      onChange={(e) => setAsgSubjectId(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                    >
                      {subjects.filter((s) => s.semester === asgSemester).map((s) => (
                        <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  External Submission Link (Google Form / Microsoft Form) *
                </label>
                <input
                  type="url"
                  required
                  maxLength={500}
                  value={asgExtUrl}
                  onChange={(e) => setAsgExtUrl(e.target.value)}
                  placeholder="https://docs.google.com/forms/d/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Problem Description & Requirements *
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={2000}
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Specify loadings, spans, grades, and IS code references..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={asgMarks}
                    onChange={(e) => setAsgMarks(Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-concrete-100 dark:border-concrete-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAsgModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="safety" size="sm">
                  Publish Assignment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New IS Code */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blueprint-100 dark:bg-blueprint-950 flex items-center justify-center text-blueprint-700 dark:text-blueprint-300">
                  <BookMarked className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-concrete-900 dark:text-white">
                    Publish Indian Standard Code
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">Bureau of Indian Standards Repository</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeModalOpen(false)}
                className="p-1 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Standard Code ID *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    placeholder="e.g. IS 875 (Part 3): 2015"
                    value={newCodeNumber}
                    onChange={(e) => setNewCodeNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={newCodeCategory}
                    onChange={(e) => setNewCodeCategory(e.target.value as ReferenceCodeCategory)}
                    className="w-full p-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  >
                    <option value="Structural">Structural</option>
                    <option value="Concrete">Concrete</option>
                    <option value="Steel">Steel</option>
                    <option value="Geotechnical">Geotechnical</option>
                    <option value="Tables & Charts">Tables & Charts</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Standard Title & Subject *
                </label>
                <input
                  type="text"
                  required
                  maxLength={250}
                  placeholder="e.g. Code of Practice for Design Loads (Wind Loads)"
                  value={newCodeTitle}
                  onChange={(e) => setNewCodeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Revision Year
                  </label>
                  <input
                    type="number"
                    min="1900"
                    max="2100"
                    value={newCodeYear}
                    onChange={(e) => setNewCodeYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                    Estimated File Size
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={newCodeSize}
                    onChange={(e) => setNewCodeSize(e.target.value)}
                    placeholder="e.g. 4.8 MB"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-concrete-600 dark:text-concrete-300 block mb-1">
                  Description / Key Clauses & Coverage (Optional)
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  placeholder="Key design clauses, wind pressure coefficients, terrain categories..."
                  value={newCodeDesc}
                  onChange={(e) => setNewCodeDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-800 text-concrete-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-concrete-100 dark:border-concrete-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCodeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                  Publish Standard
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
