import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  X,
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  Layers,
  Sparkles,
  FileCheck,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Subject, AcademicDocument } from '../../types';
import { formatDate } from '../../utils/formatters';

export const SemesterPage: React.FC = () => {
  const { semId } = useParams<{ semId: string }>();
  const navigate = useNavigate();
  const {
    documents,
    openPreview,
    downloadDocument,
    deleteDocument,
    getSubjectsBySemester,
    addSubject,
    updateSubject,
    deleteSubject,
    setSelectedSemester,
    showToast,
  } = usePortal();
  const { isAdmin } = useAuth();

  const semesterNum = Math.max(1, Math.min(8, Number(semId) || 1));

  // Sync selected semester in context
  useEffect(() => {
    setSelectedSemester(semesterNum);
  }, [semesterNum, setSelectedSemester]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'notes' | 'pyq' | 'syllabus' | 'subjects'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Documents for this Semester
  const semDocs = useMemo(() => {
    return documents.filter((d) => Number(d.semester) === semesterNum);
  }, [documents, semesterNum]);

  const semNotes = useMemo(() => semDocs.filter((d) => d.category === 'notes'), [semDocs]);
  const semPyqs = useMemo(() => semDocs.filter((d) => d.category === 'question_paper'), [semDocs]);
  const semSyllabus = useMemo(() => semDocs.filter((d) => d.category === 'syllabus'), [semDocs]);

  // 2. Subjects configured or derived from uploaded documents
  const configuredSubjects = getSubjectsBySemester(semesterNum);

  const displaySubjects = useMemo(() => {
    const existingCodes = new Set(
      configuredSubjects.map((s) => s.code.replace(/[\s-_]/g, '').toLowerCase())
    );
    const derived: Subject[] = [];

    semDocs.forEach((d) => {
      const codeClean = (d.subjectCode || '').replace(/[\s-_]/g, '').toLowerCase();
      if (
        codeClean &&
        codeClean !== `sem${semesterNum}` &&
        codeClean !== 'isstandard' &&
        !existingCodes.has(codeClean)
      ) {
        existingCodes.add(codeClean);
        derived.push({
          id: d.subjectId || `derived_${d.subjectCode.replace(/[^a-zA-Z0-9]/g, '_')}`,
          code: d.subjectCode,
          name: d.subjectName || d.title,
          semester: semesterNum,
          credits: 4,
          description: `Civil Engineering course with active lecture notes and past question papers.`,
        });
      }
    });

    return [...configuredSubjects, ...derived];
  }, [configuredSubjects, semDocs, semesterNum]);

  // 3. Filtered documents based on active search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return semNotes;
    const q = searchQuery.toLowerCase();
    return semNotes.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subjectCode.toLowerCase().includes(q) ||
        d.subjectName.toLowerCase().includes(q) ||
        (d.unit && d.unit.toLowerCase().includes(q))
    );
  }, [semNotes, searchQuery]);

  const filteredPyqs = useMemo(() => {
    if (!searchQuery.trim()) return semPyqs;
    const q = searchQuery.toLowerCase();
    return semPyqs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subjectCode.toLowerCase().includes(q) ||
        d.subjectName.toLowerCase().includes(q) ||
        (d.examType && d.examType.toLowerCase().includes(q)) ||
        (d.examYear && String(d.examYear).includes(q))
    );
  }, [semPyqs, searchQuery]);

  const filteredSyllabus = useMemo(() => {
    if (!searchQuery.trim()) return semSyllabus;
    const q = searchQuery.toLowerCase();
    return semSyllabus.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subjectCode.toLowerCase().includes(q) ||
        d.subjectName.toLowerCase().includes(q)
    );
  }, [semSyllabus, searchQuery]);

  // Group notes by Unit / Module
  const notesByUnit = useMemo(() => {
    const groups: Record<string, AcademicDocument[]> = {};
    filteredNotes.forEach((doc) => {
      const unitKey = doc.unit || 'General Notes';
      if (!groups[unitKey]) groups[unitKey] = [];
      groups[unitKey].push(doc);
    });
    return groups;
  }, [filteredNotes]);

  // Group PYQs by Year
  const pyqsByYear = useMemo(() => {
    const groups: Record<string, AcademicDocument[]> = {};
    filteredPyqs.forEach((doc) => {
      const yearKey = doc.examYear ? String(doc.examYear) : 'Archived Examination';
      if (!groups[yearKey]) groups[yearKey] = [];
      groups[yearKey].push(doc);
    });
    return groups;
  }, [filteredPyqs]);

  // Add Subject Modal State (for Admin)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState<number>(4);
  const [facultyName, setFacultyName] = useState('');
  const [description, setDescription] = useState('');

  // Edit Subject Modal State (for Admin)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCredits, setEditCredits] = useState<number>(4);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSemester, setEditSemester] = useState<number>(semesterNum);

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      showToast('Please enter both subject code and subject name.', 'error');
      return;
    }

    addSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      semester: semesterNum,
      credits: Number(credits) || 4,
      facultyName: facultyName.trim() || undefined,
      description: description.trim() || undefined,
    });

    setCode('');
    setName('');
    setCredits(4);
    setFacultyName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const handleDeleteSubject = (e: React.MouseEvent, id: string, subjectCode: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove subject ${subjectCode}?`)) {
      deleteSubject(id);
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, sub: Subject) => {
    e.stopPropagation();
    setEditingSubject(sub);
    setEditCode(sub.code);
    setEditName(sub.name);
    setEditCredits(sub.credits);
    setEditFacultyName(sub.facultyName || '');
    setEditDescription(sub.description || '');
    setEditSemester(sub.semester);
  };

  const handleUpdateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;

    if (!editCode.trim() || !editName.trim()) {
      showToast('Please enter both subject code and subject name.', 'error');
      return;
    }

    updateSubject({
      id: editingSubject.id,
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      semester: editSemester,
      credits: Number(editCredits) || 4,
      facultyName: editFacultyName.trim() || undefined,
      description: editDescription.trim() || undefined,
    });

    setEditingSubject(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-concrete-300 dark:border-concrete-800 pb-5">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-concrete-500 hover:text-blueprint-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Semesters</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white tracking-tight">
              Semester {semesterNum} Academic Vault
            </h1>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blueprint-100 dark:bg-blueprint-950 text-blueprint-800 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800 font-bold">
              {semDocs.length} {semDocs.length === 1 ? 'Resource' : 'Resources'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-concrete-500 font-sans">
            Access curriculum syllabus, lecture module notes, and previous year examination question papers for Semester {semesterNum}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Quick Semester Switcher */}
          <div className="flex items-center gap-1 font-mono text-xs bg-concrete-100 dark:bg-concrete-900 p-1 rounded-xl border border-concrete-200 dark:border-concrete-800">
            <span className="px-2 font-bold text-[11px] text-concrete-400 uppercase hidden sm:inline">Term:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <button
                key={s}
                onClick={() => {
                  navigate(`/semester/${s}`);
                  setActiveTab('all');
                  setSearchQuery('');
                }}
                className={`w-7 h-7 rounded-lg font-bold transition-all ${
                  s === semesterNum
                    ? 'bg-blueprint-700 text-white shadow-xs'
                    : 'text-concrete-600 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800'
                }`}
                title={`Semester ${s}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Admin Add Subject Button */}
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-mono"
            >
              Add Course
            </Button>
          )}
        </div>
      </div>

      {/* Primary Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blueprint-700 text-white shadow-sm'
                : 'bg-concrete-100 dark:bg-concrete-900 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800 border border-concrete-200 dark:border-concrete-800'
            }`}
          >
            All Resources ({semDocs.length})
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-blueprint-700 text-white shadow-sm'
                : 'bg-concrete-100 dark:bg-concrete-900 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800 border border-concrete-200 dark:border-concrete-800'
            }`}
          >
            Class Notes ({semNotes.length})
          </button>

          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'pyq'
                ? 'bg-blueprint-700 text-white shadow-sm'
                : 'bg-concrete-100 dark:bg-concrete-900 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800 border border-concrete-200 dark:border-concrete-800'
            }`}
          >
            Question Papers / PYQs ({semPyqs.length})
          </button>

          <button
            onClick={() => setActiveTab('syllabus')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-blueprint-700 text-white shadow-sm'
                : 'bg-concrete-100 dark:bg-concrete-900 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800 border border-concrete-200 dark:border-concrete-800'
            }`}
          >
            Syllabus ({semSyllabus.length})
          </button>

          <button
            onClick={() => setActiveTab('subjects')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'subjects'
                ? 'bg-blueprint-700 text-white shadow-sm'
                : 'bg-concrete-100 dark:bg-concrete-900 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800 border border-concrete-200 dark:border-concrete-800'
            }`}
          >
            Courses / Subjects ({displaySubjects.length})
          </button>
        </div>

        {/* Search within Semester */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-concrete-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search Semester ${semesterNum}...`}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-concrete-900 dark:text-white placeholder-concrete-400 focus:outline-none focus:border-blueprint-600 font-sans shadow-xs"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SYLLABUS SECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'syllabus') && semSyllabus.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h2 className="font-heading font-extrabold text-lg text-concrete-900 dark:text-white">
                Official Curriculum Syllabus
              </h2>
            </div>
            <span className="text-xs font-mono text-concrete-500">
              {filteredSyllabus.length} Document(s)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {filteredSyllabus.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-500 transition-all shadow-xs"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      OFFICIAL SYLLABUS
                    </span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300">
                      {doc.subjectCode}
                    </span>
                    <span className="font-mono text-xs text-concrete-500">
                      Sem {doc.semester} • {doc.fileSize}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-base sm:text-lg text-concrete-900 dark:text-white">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-concrete-500 font-sans line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-concrete-100 dark:border-concrete-800">
                  <button
                    onClick={() => openPreview(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => downloadDocument(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blueprint-700 hover:bg-blueprint-800 text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (confirm(`Delete syllabus "${doc.title}"?`)) {
                          await deleteDocument(doc.id);
                        }
                      }}
                      className="p-1.5 text-concrete-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CLASS NOTES & MODULES SECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'notes') && semNotes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blueprint-500" />
              <h2 className="font-heading font-extrabold text-lg text-concrete-900 dark:text-white">
                Class Notes & Lecture Modules
              </h2>
            </div>
            <span className="text-xs font-mono text-concrete-500">
              {filteredNotes.length} Note File(s)
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(notesByUnit).map(([unitName, unitDocs]) => (
              <div key={unitName} className="space-y-2.5">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-blueprint-700 dark:text-blueprint-300 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{unitName}</span>
                  <span className="text-concrete-400 font-normal">({unitDocs.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {unitDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-600 dark:hover:border-blueprint-400 transition-all shadow-xs space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-200 dark:border-blueprint-800 truncate max-w-[200px]">
                            {doc.subjectCode}
                          </span>
                          <span className="font-mono text-[11px] text-concrete-500 shrink-0">
                            {doc.fileSize}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white line-clamp-2">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-concrete-500 font-sans truncate">
                          {doc.subjectName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-concrete-100 dark:border-concrete-800/80">
                        <span className="text-[10px] font-mono text-concrete-400">
                          {formatDate(doc.uploadedAt)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openPreview(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-concrete-300 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blueprint-700 hover:bg-blueprint-800 text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                if (confirm(`Delete note "${doc.title}"?`)) {
                                  await deleteDocument(doc.id);
                                }
                              }}
                              className="p-1 text-concrete-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. QUESTION PAPERS (PYQ) SECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'pyq') && semPyqs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="font-heading font-extrabold text-lg text-concrete-900 dark:text-white">
                Previous Year Question Papers (PYQs)
              </h2>
            </div>
            <span className="text-xs font-mono text-concrete-500">
              {filteredPyqs.length} Exam Paper(s)
            </span>
          </div>

          <div className="space-y-5">
            {Object.entries(pyqsByYear).map(([yearLabel, yearDocs]) => (
              <div key={yearLabel} className="space-y-2.5">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-700 dark:text-safety uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exam Year: {yearLabel}</span>
                  <span className="text-concrete-400 font-normal">({yearDocs.length})</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {yearDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-amber-500 transition-all shadow-xs space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            {doc.examType || 'Examination'}
                          </span>
                          <span className="font-mono text-[11px] text-concrete-500">
                            {doc.examYear || ''} • {doc.fileSize}
                          </span>
                        </div>
                        <h4 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white line-clamp-2">
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-concrete-500 font-sans truncate">
                          {doc.subjectCode} — {doc.subjectName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-concrete-100 dark:border-concrete-800/80">
                        <span className="text-[10px] font-mono text-concrete-400">
                          {formatDate(doc.uploadedAt)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openPreview(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-concrete-300 dark:border-concrete-700 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => downloadDocument(doc)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                if (confirm(`Delete PYQ paper "${doc.title}"?`)) {
                                  await deleteDocument(doc.id);
                                }
                              }}
                              className="p-1 text-concrete-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete paper"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. SUBJECTS & COURSE HUBS SECTION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'subjects') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-concrete-500" />
              <h2 className="font-heading font-extrabold text-lg text-concrete-900 dark:text-white">
                Semester {semesterNum} Courses & Subjects
              </h2>
            </div>
            <span className="text-xs font-mono text-concrete-500">
              {displaySubjects.length} Course Hub(s)
            </span>
          </div>

          <div className="space-y-3.5">
            {displaySubjects.map((sub) => {
              const subNotesCount = semNotes.filter(
                (d) =>
                  d.subjectId === sub.id ||
                  d.subjectCode.replace(/[\s-_]/g, '').toLowerCase() === sub.code.replace(/[\s-_]/g, '').toLowerCase()
              ).length;
              const subPyqsCount = semPyqs.filter(
                (d) =>
                  d.subjectId === sub.id ||
                  d.subjectCode.replace(/[\s-_]/g, '').toLowerCase() === sub.code.replace(/[\s-_]/g, '').toLowerCase()
              ).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/semester/${semesterNum}/subject/${sub.id}`)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-600 dark:hover:border-blueprint-400 hover:shadow-blueprint transition-all cursor-pointer relative"
                >
                  <div className="space-y-1.5 min-w-0 pr-8 sm:pr-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800">
                        {sub.code}
                      </span>
                      <span className="font-mono text-xs text-concrete-500 font-semibold">
                        {sub.credits} Credits
                      </span>
                      {sub.facultyName && (
                        <span className="font-mono text-xs text-concrete-400 hidden md:inline">
                          • Instructor: {sub.facultyName}
                        </span>
                      )}
                      <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                        • {subNotesCount} Notes • {subPyqsCount} PYQs
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg sm:text-xl text-concrete-900 dark:text-white group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                      {sub.name}
                    </h3>

                    {sub.description && (
                      <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 font-sans line-clamp-2">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-concrete-100 dark:border-concrete-800">
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title={`Edit ${sub.code}`}
                          onClick={(e) => handleOpenEdit(e, sub)}
                          className="p-1.5 text-concrete-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          title={`Delete ${sub.code}`}
                          onClick={(e) => handleDeleteSubject(e, sub.id, sub.code)}
                          className="p-1.5 text-concrete-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <span className="text-xs font-mono font-semibold text-blueprint-700 dark:text-blueprint-300 group-hover:translate-x-0.5 transition-transform">
                      Open Resource Hub →
                    </span>
                  </div>
                </div>
              );
            })}

            {displaySubjects.length === 0 && (
              <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-concrete-900 border-2 border-dashed border-concrete-300 dark:border-concrete-800 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-concrete-100 dark:bg-concrete-800 flex items-center justify-center text-concrete-400 dark:text-concrete-500">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-concrete-900 dark:text-white">
                    No Courses Configured for Semester {semesterNum}
                  </h3>
                  <p className="text-xs sm:text-sm text-concrete-500 font-sans leading-relaxed">
                    {isAdmin
                      ? 'Click below to register courses or upload lecture notes and examination papers.'
                      : 'Curriculum courses for this semester will appear once academic documents are uploaded.'}
                  </p>
                </div>

                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    Add Subject for Semester {semesterNum}
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Global Empty State for this Semester */}
      {semDocs.length === 0 && displaySubjects.length === 0 && (
        <div className="p-10 text-center rounded-3xl bg-white dark:bg-concrete-900 border-2 border-dashed border-concrete-300 dark:border-concrete-800 space-y-4 my-8">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-concrete-100 dark:bg-concrete-800 flex items-center justify-center text-concrete-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
              No Materials Uploaded for Semester {semesterNum} Yet
            </h3>
            <p className="text-xs text-concrete-500 font-sans">
              There are currently no notes, PYQs, or syllabus files recorded for this semester.
            </p>
          </div>
          {isAdmin ? (
            <Link
              to="/admin/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blueprint-700 text-white text-xs font-mono font-bold hover:bg-blueprint-800 transition-colors"
            >
              Upload Materials in Admin Console →
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Explore Other Semesters</span>
            </Link>
          )}
        </div>
      )}

      {/* Admin Modal: Add New Subject */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blueprint-100 dark:bg-blueprint-900 flex items-center justify-center text-blueprint-700 dark:text-blueprint-300">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
                    Add Subject
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">Semester {semesterNum}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE-301"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={credits}
                    onChange={(e) => setCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Subject Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Analysis & Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Faculty / Instructor Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Doom"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief course objectives and topics covered..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-concrete-200 dark:border-concrete-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Modal: Edit Subject */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-concrete-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-concrete-200 dark:border-concrete-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-concrete-900 dark:text-white">
                    Edit Subject
                  </h3>
                  <p className="text-xs font-mono text-concrete-500">Modifying {editingSubject.code}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingSubject(null)}
                className="p-1.5 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CE-301"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                    Credits *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    required
                    value={editCredits}
                    onChange={(e) => setEditCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-mono focus:outline-none focus:border-blueprint-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Subject Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Analysis & Design"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Faculty / Instructor Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Doom"
                  value={editFacultyName}
                  onChange={(e) => setEditFacultyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-concrete-500 font-semibold mb-1">
                  Description / Syllabus Outline (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief course objectives and topics covered..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-concrete-900 dark:text-white font-sans focus:outline-none focus:border-blueprint-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-concrete-200 dark:border-concrete-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
