import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  AlertCircle,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Assignment } from '../../types';
import { Button } from '../common/Button';

export const AssignmentSection: React.FC = () => {
  const {
    assignments,
    subjects,
    downloadDocument,
  } = usePortal();

  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Subjects filtered by selected semester
  const availableSubjects = useMemo(() => {
    if (selectedSemester === 'all') return subjects;
    return subjects.filter((s) => s.semester === selectedSemester);
  }, [subjects, selectedSemester]);

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSem = selectedSemester === 'all' || asg.semester === selectedSemester;
      const matchesSubject = selectedSubjectId === 'all' || asg.subjectId === selectedSubjectId;
      const matchesQuery =
        !searchQuery.trim() ||
        asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSem && matchesSubject && matchesQuery;
    });
  }, [assignments, selectedSemester, selectedSubjectId, searchQuery]);

  const handleDownloadQuestion = (asg: Assignment) => {
    downloadDocument({
      title: `${asg.subjectCode} - ${asg.title} (Question Sheet)`,
      fileName: asg.attachmentName || `${asg.title.replace(/\s+/g, '_')}_Questions.pdf`,
      fileUrl: asg.attachmentUrl || '/mock-docs/sample-assignment.pdf',
      category: 'notes',
      subjectCode: asg.subjectCode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blueprint-900 via-blueprint-800 to-steel p-6 sm:p-8 text-white shadow-md border border-blueprint-700">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-safety/20 border border-safety/30 text-safety text-xs font-mono font-semibold tracking-wider uppercase">
            <FileText className="w-3.5 h-3.5" /> Coursework & Assignments
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
            Class Assignments & Question Sheets
          </h1>
          <p className="text-sm sm:text-base text-concrete-200 leading-relaxed">
            Direct access to official course problem sets, design exercises, and project requirements. Students can review guidelines and download question PDFs directly.
          </p>
        </div>

        {/* Blueprint background grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-3 p-4 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 shadow-xs">
        {/* Semester Buttons Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedSemester('all');
              setSelectedSubjectId('all');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedSemester === 'all'
                ? 'bg-blueprint-700 text-white shadow-xs'
                : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800'
            }`}
          >
            All Semesters
          </button>
          {semesters.map((sem) => (
            <button
              key={sem}
              onClick={() => {
                setSelectedSemester(sem);
                setSelectedSubjectId('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSemester === sem
                  ? 'bg-blueprint-700 text-white shadow-xs'
                  : 'text-concrete-700 dark:text-concrete-300 hover:bg-concrete-100 dark:hover:bg-concrete-800'
              }`}
            >
              Semester {sem}
            </button>
          ))}
        </div>

        {/* Subject Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-concrete-200 dark:border-concrete-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-concrete-400" />
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-950 text-concrete-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500 max-w-[280px]"
            >
              <option value="all">All Subjects ({availableSubjects.length})</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code}: {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-concrete-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-950 text-concrete-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blueprint-500"
            />
          </div>
        </div>
      </div>

      {/* Read-Only Notice Box for Students */}
      <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Student Notice:</span> Elcivilo provides verified assignment questions and technical problem sets. No student login or file upload is required. Submit your completed calculation sheets to your respective course faculty.
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl border border-dashed border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900">
            <FileText className="w-10 h-10 mx-auto text-concrete-400 mb-2 stroke-[1.5]" />
            <h3 className="font-heading text-base font-bold text-concrete-800 dark:text-concrete-200">
              No assignments found
            </h3>
            <p className="text-xs text-concrete-500 mt-1">
              There are no coursework assignments matching the current semester or subject filter.
            </p>
          </div>
        ) : (
          filteredAssignments.map((asg) => (
            <div
              key={asg.id}
              className="group relative flex flex-col justify-between p-5 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 hover:border-blueprint-500 transition-all shadow-xs"
            >
              <div className="space-y-3">
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-800 dark:text-blueprint-200 border border-blueprint-300 dark:border-blueprint-800">
                      Sem {asg.semester}
                    </span>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-concrete-100 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300">
                      {asg.subjectCode}
                    </span>
                  </div>

                  {asg.maxMarks && (
                    <span className="font-mono text-[11px] font-bold text-concrete-600 dark:text-concrete-400">
                      {asg.maxMarks} Marks
                    </span>
                  )}
                </div>

                {/* Title & Subject */}
                <div>
                  <h3 className="font-heading text-base font-bold text-concrete-900 dark:text-white group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                    {asg.title}
                  </h3>
                  <p className="font-mono text-xs text-concrete-500 dark:text-concrete-400 mt-0.5">
                    {asg.subjectName}
                  </p>
                </div>

                {/* Problem Statement Details */}
                <p className="text-xs text-concrete-600 dark:text-concrete-300 line-clamp-3 leading-relaxed">
                  {asg.description}
                </p>
              </div>

              {/* Bottom Metadata & Download Button */}
              <div className="pt-4 mt-4 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs font-mono text-concrete-500">
                  <Calendar className="w-3.5 h-3.5 text-concrete-400" />
                  <span>Due: {new Date(asg.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleDownloadQuestion(asg)}
                    className="flex items-center gap-1.5 text-xs py-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Question PDF</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
