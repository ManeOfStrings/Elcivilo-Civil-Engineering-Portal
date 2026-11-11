import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { AcademicDocument, Assignment } from '../../types';
import { formatDate } from '../../utils/formatters';

type TabKey = 'notes' | 'pyq' | 'syllabus' | 'textbooks' | 'assignments';

export const SubjectPage: React.FC = () => {
  const { semId, subjectId } = useParams<{ semId: string; subjectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    getSubjectById,
    getDocumentsBySubject,
    getAssignmentsBySubject,
    openPreview,
    downloadDocument,
    documents,
  } = usePortal();

  const semesterNum = Number(semId) || 1;
  const subject = getSubjectById(subjectId || '');

  const queryTab = searchParams.get('tab') as TabKey | null;
  const validTabs: TabKey[] = ['notes', 'pyq', 'syllabus', 'textbooks', 'assignments'];
  const initialTab: TabKey = queryTab && validTabs.includes(queryTab) ? queryTab : 'notes';

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  // Sync tab with URL search parameter if updated externally
  useEffect(() => {
    if (queryTab && validTabs.includes(queryTab) && queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      },
      { replace: true }
    );
  };

  const allDocs = useMemo(() => (subject ? getDocumentsBySubject(subject.id) : []), [getDocumentsBySubject, subject]);
  const assignments = useMemo(() => (subject ? getAssignmentsBySubject(subject.id) : []), [getAssignmentsBySubject, subject]);

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-concrete-100 dark:bg-concrete-800 flex items-center justify-center text-concrete-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-concrete-900 dark:text-white">
          Subject Not Found
        </h2>
        <p className="text-sm text-concrete-500 font-sans max-w-md mx-auto">
          The requested subject could not be located. It may have been removed or not yet configured.
        </p>
        <div className="pt-2">
          <Link
            to={`/semester/${semesterNum}`}
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-blueprint-600 dark:text-blueprint-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Semester {semesterNum} Subjects</span>
          </Link>
        </div>
      </div>
    );
  }

  const notes = allDocs.filter((d) => d.category === 'notes');
  const textbooks = allDocs.filter((d) => d.category === 'textbook');
  const pyqs = allDocs.filter((d) => d.category === 'question_paper');
  const syllabi = allDocs.filter((d) => d.category === 'syllabus');
  const semSyllabi = useMemo(() => {
    return documents.filter((d) => Number(d.semester) === semesterNum && d.category === 'syllabus');
  }, [documents, semesterNum]);

  // Group notes by Unit / Module for clean accordion display
  const notesByUnit = useMemo(() => {
    const groups: Record<string, AcademicDocument[]> = {};
    notes.forEach((doc) => {
      const unitKey = doc.unit || 'General Notes';
      if (!groups[unitKey]) groups[unitKey] = [];
      groups[unitKey].push(doc);
    });
    return groups;
  }, [notes]);

  const toggleAccordion = (unit: string) => {
    setOpenAccordions((prev) => ({ ...prev, [unit]: !prev[unit] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Subject Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            to={`/semester/${semesterNum}`}
            className="inline-flex items-center gap-1 text-concrete-500 hover:text-blueprint-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Semester {semesterNum} Subjects</span>
          </Link>
          <span className="text-concrete-300 dark:text-concrete-700">/</span>
          <span className="font-bold text-blueprint-700 dark:text-blueprint-300">{subject.code}</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800">
              {subject.code}
            </span>
            <span className="font-mono text-xs text-concrete-500">
              {subject.credits} Credits {subject.facultyName ? `• ${subject.facultyName}` : ''}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 font-sans pt-1">
              {subject.description}
            </p>
          )}
        </div>
      </div>

      {/* Tabs Navigation: Class Notes, PYQs, Syllabus prominently first */}
      <div className="flex items-center gap-1.5 border-b border-concrete-300 dark:border-concrete-800 overflow-x-auto pb-1 text-xs sm:text-sm font-mono scrollbar-none">
        {[
          { id: 'notes', label: 'Class Notes', count: notes.length, icon: FileText },
          { id: 'pyq', label: 'Question Papers (PYQs)', count: pyqs.length, icon: Calendar },
          { id: 'syllabus', label: 'Syllabus', count: syllabi.length > 0 ? syllabi.length : semSyllabi.length, icon: BookOpen },
          { id: 'textbooks', label: 'Textbooks', count: textbooks.length },
          { id: 'assignments', label: 'Assignments', count: assignments.length },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabKey)}
              className={`px-3.5 py-2 rounded-t-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blueprint-700 text-white shadow-xs'
                  : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-200 dark:hover:bg-concrete-800'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 opacity-80" />}
              <span>{tab.label}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-concrete-200 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Areas */}
      <div className="space-y-4">
        {/* 1. CLASS NOTES (Accordion by Unit) */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            {Object.keys(notesByUnit).length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-concrete-500 bg-white dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800">
                No class notes uploaded for this subject yet.
              </p>
            ) : (
              Object.entries(notesByUnit).map(([unit, unitDocs]) => {
                const isOpen = openAccordions[unit] !== false; // open by default
                return (
                  <div
                    key={unit}
                    className="rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleAccordion(unit)}
                      className="w-full flex items-center justify-between p-4 bg-concrete-50 dark:bg-concrete-950/60 font-heading font-bold text-sm text-concrete-900 dark:text-white text-left cursor-pointer hover:bg-concrete-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blueprint-600" />
                        <span>{unit}</span>
                        <span className="text-xs font-mono font-normal text-concrete-500">
                          ({unitDocs.length} {unitDocs.length === 1 ? 'file' : 'files'})
                        </span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-concrete-400" /> : <ChevronDown className="w-4 h-4 text-concrete-400" />}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-concrete-100 dark:divide-concrete-800 p-2 sm:p-3 space-y-2">
                        {unitDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-concrete-50 dark:hover:bg-concrete-800/40 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <h4 className="font-heading font-semibold text-sm text-concrete-900 dark:text-white">
                                {doc.title}
                              </h4>
                              {doc.description && (
                                <p className="text-xs text-concrete-500 font-sans line-clamp-1">
                                  {doc.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-[11px] font-mono text-concrete-400">
                                <span className="uppercase font-bold">{doc.fileType}</span>
                                <span>•</span>
                                <span>{doc.fileSize}</span>
                                <span>•</span>
                                <span>{formatDate(doc.uploadedAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => openPreview(doc)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 hover:text-blueprint-700 text-xs font-mono font-semibold transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => downloadDocument(doc)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blueprint-700 hover:bg-blueprint-800 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. TEXTBOOKS */}
        {activeTab === 'textbooks' && (
          <div className="space-y-3">
            {textbooks.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-concrete-500 bg-white dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800">
                No reference textbooks listed for this subject.
              </p>
            ) : (
              textbooks.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900"
                >
                  <div className="space-y-1">
                    <h4 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white">
                      {doc.title}
                    </h4>
                    {doc.description && (
                      <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs font-mono text-concrete-400">
                      <span>{doc.fileSize}</span>
                      <span>•</span>
                      <span>PDF Document</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPreview(doc)}
                      className="px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. ASSIGNMENTS (Strictly read details and download question files - no student upload) */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {assignments.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-concrete-500 bg-white dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800">
                No active assignments for this subject.
              </p>
            ) : (
              assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-5 rounded-2xl border-2 border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-safety font-bold">
                      DUE: {asg.dueDate} {asg.dueTime ? `@ ${asg.dueTime}` : ''}
                    </span>
                    {asg.maxMarks && (
                      <span className="font-mono text-xs text-concrete-500 font-semibold">
                        Max Marks: {asg.maxMarks}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-concrete-900 dark:text-white">
                      {asg.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 font-sans leading-relaxed">
                      {asg.description}
                    </p>
                  </div>

                  {asg.attachmentUrl && (
                    <div className="pt-2">
                      <button
                        onClick={() =>
                          downloadDocument({
                            title: asg.title,
                            fileName: asg.attachmentName || `${asg.title}.pdf`,
                            fileUrl: asg.attachmentUrl!,
                            category: 'assignment',
                            subjectCode: asg.subjectCode,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Question File (PDF)</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. PREVIOUS YEAR QUESTIONS (PYQs) */}
        {activeTab === 'pyq' && (
          <div className="space-y-3">
            {pyqs.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-concrete-500 bg-white dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800">
                No past question papers uploaded for this subject yet.
              </p>
            ) : (
              pyqs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {doc.examYear && (
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-steel/15 text-steel-dark dark:text-steel-light">
                          {doc.examYear}
                        </span>
                      )}
                      {doc.examType && (
                        <span className="font-mono text-xs text-concrete-500">
                          {doc.examType}
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading font-bold text-sm text-concrete-900 dark:text-white">
                      {doc.title}
                    </h4>
                    <p className="text-xs font-mono text-concrete-400">
                      {doc.fileSize} • Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPreview(doc)}
                      className="px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. SYLLABUS */}
        {activeTab === 'syllabus' && (
          <div className="space-y-3">
            {syllabi.length === 0 && semSyllabi.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-concrete-500 bg-white dark:bg-concrete-900 rounded-xl border border-concrete-200 dark:border-concrete-800">
                No syllabus document found for this subject or semester.
              </p>
            ) : syllabi.length > 0 ? (
              syllabi.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900"
                >
                  <div className="space-y-1">
                    <h4 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
                      {doc.description || 'Official curriculum learning outcomes and exam syllabus.'}
                    </p>
                    <p className="text-xs font-mono text-concrete-400">
                      {doc.fileSize} • Uploaded {formatDate(doc.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPreview(doc)}
                      className="px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-300">
                    <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Official Semester {semesterNum} Curriculum Syllabus (includes {subject.code}):</span>
                  </div>
                </div>

                {semSyllabi.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          CURRICULUM SYLLABUS
                        </span>
                        <span className="font-mono text-xs text-concrete-500">
                          {doc.fileSize}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
                        {doc.description || 'Full curriculum syllabus covering course outcomes and modules.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openPreview(doc)}
                        className="px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
