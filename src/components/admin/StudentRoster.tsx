import React, { useState } from 'react';
import { Search, Filter, BookOpen, Layers } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { BlueprintCard } from '../common/BlueprintCard';
import { Badge } from '../common/Badge';

export const StudentRoster: React.FC = () => {
  const { subjects, documents } = usePortal();
  const [search, setSearch] = useState('');
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');

  const filtered = subjects.filter((sub) => {
    const matchSem = selectedSem === 'all' || sub.semester === selectedSem;
    const matchSearch =
      !search.trim() ||
      sub.code.toLowerCase().includes(search.toLowerCase()) ||
      sub.name.toLowerCase().includes(search.toLowerCase()) ||
      (sub.facultyName && sub.facultyName.toLowerCase().includes(search.toLowerCase()));
    return matchSem && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-concrete-900 dark:text-white">
            Academic Course Catalog
          </h2>
          <p className="text-xs text-concrete-500 font-mono mt-1">
            Department of Civil Engineering • All 8 Semesters Curriculum
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-concrete-300 dark:border-concrete-700 bg-concrete-50 dark:bg-concrete-800 text-xs font-mono"
          >
            <option value="all">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sub) => {
          const docCount = documents.filter((d) => d.subjectId === sub.id || d.subjectCode === sub.code).length;
          return (
            <div
              key={sub.id}
              className="p-5 rounded-xl border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-800 dark:text-blueprint-200">
                  {sub.code}
                </span>
                <span className="text-xs font-mono text-concrete-500 font-bold">
                  Sem {sub.semester} • {sub.credits} Credits
                </span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-concrete-900 dark:text-white">
                  {sub.name}
                </h4>
                <p className="text-xs text-concrete-500 mt-0.5">Faculty: {sub.facultyName || 'Department Faculty'}</p>
              </div>
              <p className="text-xs text-concrete-600 dark:text-concrete-400 line-clamp-2">
                {sub.description}
              </p>
              <div className="pt-2 border-t border-concrete-100 dark:border-concrete-800 flex items-center justify-between text-xs text-concrete-500 font-mono">
                <span>{docCount} Resources Loaded</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
