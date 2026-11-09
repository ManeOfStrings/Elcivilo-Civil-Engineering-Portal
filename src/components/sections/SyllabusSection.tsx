import React, { useState, useMemo } from 'react';
import { Download, Eye, FileText, Search } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { formatDate } from '../../utils/formatters';

export const SyllabusSection: React.FC = () => {
  const { documents, openPreview, downloadDocument } = usePortal();
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const syllabusDocs = useMemo(() => {
    return documents.filter((d) => d.category === 'syllabus');
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return syllabusDocs.filter((doc) => {
      const matchSem = selectedSem === 'all' || doc.semester === selectedSem;
      const matchSearch =
        !search.trim() ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectName.toLowerCase().includes(search.toLowerCase());
      return matchSem && matchSearch;
    });
  }, [syllabusDocs, selectedSem, search]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Page Title */}
      <div className="border-b border-concrete-300 dark:border-concrete-800 pb-4">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
          Syllabus Repository
        </h1>
        <p className="text-xs sm:text-sm text-concrete-500 font-sans mt-0.5">
          Official civil engineering course syllabi, curriculum learning objectives, and credit structures.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        {/* Semester Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-concrete-500 font-bold">Semester:</span>
          <button
            onClick={() => setSelectedSem('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedSem === 'all'
                ? 'bg-blueprint-700 text-white'
                : 'bg-concrete-200 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-300'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSem(s)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                selectedSem === s
                  ? 'bg-blueprint-700 text-white'
                  : 'bg-concrete-200 dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 hover:bg-concrete-300'
              }`}
            >
              Sem {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-concrete-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject or code..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-xs text-concrete-900 dark:text-white placeholder-concrete-400 focus:outline-none focus:border-blueprint-600 font-sans w-full sm:w-60"
          />
        </div>
      </div>

      {/* List of Syllabus Documents */}
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
                <span className="font-mono text-xs text-concrete-500">
                  Semester {doc.semester}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-concrete-900 dark:text-white">
                {doc.title}
              </h3>
              {doc.description && (
                <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans">
                  {doc.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-[11px] font-mono text-concrete-400 pt-0.5">
                <span className="uppercase font-bold">{doc.fileType}</span>
                <span>•</span>
                <span>{doc.fileSize}</span>
                <span>•</span>
                <span>Uploaded {formatDate(doc.uploadedAt)}</span>
              </div>
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
            No syllabus documents found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
