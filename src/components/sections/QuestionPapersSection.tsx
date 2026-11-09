import React, { useState, useMemo } from 'react';
import { Download, Eye, FileText, Search, Calendar } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { formatDate } from '../../utils/formatters';

export const QuestionPapersSection: React.FC = () => {
  const { documents, openPreview, downloadDocument } = usePortal();
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const qpDocs = useMemo(() => {
    return documents.filter((d) => d.category === 'question_paper');
  }, [documents]);

  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  const filteredDocs = useMemo(() => {
    return qpDocs.filter((doc) => {
      const matchSem = selectedSem === 'all' || doc.semester === selectedSem;
      const matchYear = selectedYear === 'all' || doc.examYear === selectedYear;
      const matchSearch =
        !search.trim() ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        (doc.examType && doc.examType.toLowerCase().includes(search.toLowerCase()));
      return matchSem && matchYear && matchSearch;
    });
  }, [qpDocs, selectedSem, selectedYear, search]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Title */}
      <div className="border-b border-concrete-300 dark:border-concrete-800 pb-4">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
          Question Papers Archive
        </h1>
        <p className="text-xs sm:text-sm text-concrete-500 font-sans mt-0.5">
          Previous year end-semester and mid-term examination papers for Civil Engineering subjects.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Filter */}
          <div className="flex items-center gap-1">
            <span className="text-concrete-500 font-bold">Sem:</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-concrete-800 dark:text-concrete-200"
            >
              <option value="all">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1">
            <span className="text-concrete-500 font-bold">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-concrete-800 dark:text-concrete-200"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-concrete-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam paper or subject..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-xs text-concrete-900 dark:text-white placeholder-concrete-400 focus:outline-none focus:border-blueprint-600 font-sans w-full sm:w-60"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-concrete-300 dark:border-concrete-800 hover:border-blueprint-500 transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300">
                  {doc.subjectCode}
                </span>
                {doc.examYear && (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-concrete-100 text-concrete-700 dark:bg-concrete-800 dark:text-concrete-300">
                    {doc.examYear}
                  </span>
                )}
                {doc.examType && (
                  <span className="font-mono text-xs text-concrete-500">
                    {doc.examType}
                  </span>
                )}
              </div>

              <h3 className="font-heading font-bold text-base text-concrete-900 dark:text-white">
                {doc.title}
              </h3>
              <p className="text-xs font-mono text-concrete-500">
                {doc.subjectName} • Sem {doc.semester} • {doc.fileSize}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openPreview(doc)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => downloadDocument(doc)}
                className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-blueprint-700 hover:bg-blueprint-800 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-200 dark:border-concrete-800 text-concrete-500 font-mono text-xs">
            No question papers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
