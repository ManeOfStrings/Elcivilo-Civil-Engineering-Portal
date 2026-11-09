import React, { useState, useMemo } from 'react';
import { Download, Eye, AlertTriangle, Search, Star } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { formatDate } from '../../utils/formatters';

export const SupplyNotesSection: React.FC = () => {
  const { documents, openPreview, downloadDocument } = usePortal();
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const supplyDocs = useMemo(() => {
    return documents.filter((d) => d.category === 'supply' || d.isSupplySpecial);
  }, [documents]);

  const filteredDocs = useMemo(() => {
    return supplyDocs.filter((doc) => {
      const matchSem = selectedSem === 'all' || doc.semester === selectedSem;
      const matchSearch =
        !search.trim() ||
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectCode.toLowerCase().includes(search.toLowerCase()) ||
        doc.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        (doc.unit && doc.unit.toLowerCase().includes(search.toLowerCase()));
      return matchSem && matchSearch;
    });
  }, [supplyDocs, selectedSem, search]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      {/* Title with distinctive Safety Yellow banner */}
      <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-safety/80 space-y-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-safety text-concrete-950">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>SAFETY YELLOW • BACKLOG & SUPPLY VAULT</span>
          </span>
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-concrete-900 dark:text-white">
          Supply Special Notes & Revision Digests
        </h1>
        <p className="text-xs sm:text-sm text-concrete-700 dark:text-concrete-300 font-sans leading-relaxed">
          High-yield examination revision materials, solved derivations, and formula digests tailored for supplementary and backlog exam preparation.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-concrete-500 font-bold">Semester:</span>
          <button
            onClick={() => setSelectedSem('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              selectedSem === 'all'
                ? 'bg-amber-400 text-concrete-950 shadow-xs'
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
                  ? 'bg-amber-400 text-concrete-950 shadow-xs'
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
            placeholder="Search supply revision notes..."
            className="pl-8 pr-3 py-1.5 rounded-xl border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900 text-xs text-concrete-900 dark:text-white placeholder-concrete-400 focus:outline-none focus:border-amber-500 font-sans w-full sm:w-60"
          />
        </div>
      </div>

      {/* Supply Notes List - with distinctive safety yellow card borders and highlights */}
      <div className="space-y-3.5">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-concrete-900 border-2 border-safety/70 shadow-sm hover:border-safety transition-all"
          >
            {/* Safety Yellow side pill */}
            <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-safety rounded-l-2xl" />

            <div className="space-y-1.5 pl-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-safety border border-safety/60">
                  {doc.subjectCode}
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-concrete-100 text-concrete-700 dark:bg-concrete-800 dark:text-concrete-300">
                  Sem {doc.semester}
                </span>
                {doc.unit && (
                  <span className="font-mono text-xs text-amber-800 dark:text-safety font-bold">
                    ★ {doc.unit}
                  </span>
                )}
              </div>

              <h3 className="font-heading font-bold text-base sm:text-lg text-concrete-900 dark:text-white">
                {doc.title}
              </h3>
              {doc.description && (
                <p className="text-xs sm:text-sm text-concrete-600 dark:text-concrete-400 font-sans">
                  {doc.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs font-mono text-concrete-400 pt-1">
                <span>{doc.fileSize}</span>
                <span>•</span>
                <span>Uploaded {formatDate(doc.uploadedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 pl-2 sm:pl-0">
              <button
                onClick={() => openPreview(doc)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-concrete-100 dark:bg-concrete-800 hover:bg-concrete-200 text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => downloadDocument(doc)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-safety text-concrete-950 hover:bg-safety-dark font-mono text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-200 dark:border-concrete-800 text-concrete-500 font-mono text-xs">
            No supplementary special notes found matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};
