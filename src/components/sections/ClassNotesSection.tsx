import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Eye, FileText, Search, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { AcademicDocument } from '../../types';
import { formatDate } from '../../utils/formatters';

export const ClassNotesSection: React.FC = () => {
  const { documents, openPreview, downloadDocument, selectedSemester } = usePortal();
  const [searchParams] = useSearchParams();
  const semQuery = searchParams.get('sem');
  const initialSem: number | 'all' = semQuery
    ? Number(semQuery) || 'all'
    : selectedSemester && selectedSemester >= 1 && selectedSemester <= 8
    ? selectedSemester
    : 'all';
  const [selectedSem, setSelectedSem] = useState<number | 'all'>(initialSem);
  const [search, setSearch] = useState('');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const notesDocs = useMemo(() => {
    return documents.filter((d) => d.category === 'notes');
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return notesDocs.filter((doc) => {
      const matchSem = selectedSem === 'all' || doc.semester === selectedSem;
      const matchSearch =
        !search.trim() ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        (doc.unit && doc.unit.toLowerCase().includes(search.toLowerCase()));
      return matchSem && matchSearch;
    });
  }, [notesDocs, selectedSem, search]);

  // Group by Unit / Module
  const groupedByUnit = useMemo(() => {
    const map: Record<string, AcademicDocument[]> = {};
    filteredDocs.forEach((doc) => {
      const unitKey = doc.unit || 'General Lecture Notes';
      if (!map[unitKey]) map[unitKey] = [];
      map[unitKey].push(doc);
    });
    return map;
  }, [filteredDocs]);

  const toggleAccordion = (unit: string) => {
    setOpenAccordions((prev) => ({ ...prev, [unit]: !prev[unit] }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Title */}
      <div className="border-b border-concrete-300 dark:border-concrete-800 pb-4">
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
          Class Notes Repository
        </h1>
        <p className="text-xs sm:text-sm text-concrete-500 font-sans mt-0.5">
          Centralized civil engineering lecture notes categorized by unit and module.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
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

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-concrete-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes or unit..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-xs text-concrete-900 dark:text-white placeholder-concrete-400 focus:outline-none focus:border-blueprint-600 font-sans w-full sm:w-60"
          />
        </div>
      </div>

      {/* Accordions Grouped by Unit */}
      <div className="space-y-4">
        {Object.keys(groupedByUnit).length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-200 dark:border-concrete-800 text-concrete-500 font-mono text-xs">
            No class notes found for this filter.
          </div>
        ) : (
          Object.entries(groupedByUnit).map(([unit, docs]) => {
            const isOpen = openAccordions[unit] !== false;
            return (
              <div
                key={unit}
                className="rounded-2xl border-2 border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 overflow-hidden"
              >
                <button
                  onClick={() => toggleAccordion(unit)}
                  className="w-full flex items-center justify-between p-4 bg-concrete-50 dark:bg-concrete-950/60 font-heading font-bold text-sm text-concrete-900 dark:text-white text-left cursor-pointer hover:bg-concrete-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blueprint-600" />
                    <span>{unit}</span>
                    <span className="text-xs font-mono font-normal text-concrete-500">
                      ({docs.length} {docs.length === 1 ? 'document' : 'documents'})
                    </span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-concrete-400" /> : <ChevronDown className="w-4 h-4 text-concrete-400" />}
                </button>

                {isOpen && (
                  <div className="divide-y divide-concrete-100 dark:divide-concrete-800 p-2 sm:p-3 space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl hover:bg-concrete-50 dark:hover:bg-concrete-800/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300">
                              {doc.subjectCode}
                            </span>
                            <span className="font-mono text-xs text-concrete-500">
                              {doc.subjectName}
                            </span>
                          </div>
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
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-concrete-100 dark:bg-concrete-800 hover:bg-blueprint-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
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
            );
          })
        )}
      </div>
    </div>
  );
};
