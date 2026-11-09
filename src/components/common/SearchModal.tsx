import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  BookOpen,
  ArrowRight,
  Filter,
  Calculator,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Badge } from './Badge';

export const SearchModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isSearchOpen,
    setIsSearchOpen,
    semesters,
    subjects,
    documents,
    assignments,
    openPreview,
  } = usePortal();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<number | 'all'>('all');

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase().trim();

    // Matching subjects
    const matchingSubjects = subjects.filter((s) => {
      const matchQ =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q));
      const matchSem = selectedSem === 'all' || s.semester === selectedSem;
      return matchQ && matchSem;
    });

    // Matching documents
    const matchingDocs = documents.filter((doc) => {
      const matchQ =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.subjectCode.toLowerCase().includes(q) ||
        doc.subjectName.toLowerCase().includes(q) ||
        (doc.description && doc.description.toLowerCase().includes(q)) ||
        (doc.unit && doc.unit.toLowerCase().includes(q));

      const matchCat =
        selectedCategory === 'all' ||
        (selectedCategory === 'notes' && doc.category === 'notes') ||
        (selectedCategory === 'textbooks' && doc.category === 'textbook') ||
        (selectedCategory === 'pyq' && doc.category === 'question_paper');

      const matchSem = selectedSem === 'all' || doc.semester === selectedSem;

      return matchQ && matchCat && matchSem;
    });

    // Matching assignments
    const matchingAsgs = assignments.filter((asg) => {
      const matchQ =
        !q ||
        asg.title.toLowerCase().includes(q) ||
        asg.subjectCode.toLowerCase().includes(q) ||
        asg.subjectName.toLowerCase().includes(q);

      const matchCat = selectedCategory === 'all' || selectedCategory === 'assignments';
      const matchSem = selectedSem === 'all' || asg.semester === selectedSem;

      return matchQ && matchCat && matchSem;
    });

    return {
      subjects: matchingSubjects.slice(0, 4),
      docs: matchingDocs.slice(0, 8),
      asgs: matchingAsgs.slice(0, 3),
    };
  }, [query, selectedCategory, selectedSem, subjects, documents, assignments]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-concrete-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-700 rounded-3xl shadow-2xl overflow-hidden max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-concrete-200 dark:border-concrete-800 bg-white dark:bg-concrete-900 gap-3">
          <Search className="h-5 w-5 text-blueprint-600 dark:text-blueprint-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subjects, lecture notes, IS codes, textbooks, PYQs..."
            className="flex-1 bg-transparent text-sm sm:text-base text-concrete-900 dark:text-concrete-100 placeholder:text-concrete-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-concrete-400 hover:text-concrete-600 rounded cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-2 py-0.5 rounded bg-concrete-100 dark:bg-concrete-800 text-concrete-500 border border-concrete-300 dark:border-concrete-700">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-concrete-400 hover:text-concrete-700 dark:hover:text-concrete-200 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-4 py-2 bg-concrete-50 dark:bg-concrete-950 border-b border-concrete-200 dark:border-concrete-800 overflow-x-auto text-xs font-mono">
          <span className="text-concrete-500 flex items-center gap-1 shrink-0">
            <Filter className="h-3 w-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Items' },
            { id: 'notes', label: 'Lecture Notes' },
            { id: 'textbooks', label: 'Textbooks & Codes' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'pyq', label: 'PYQ Papers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blueprint-700 text-white font-medium'
                  : 'bg-white dark:bg-concrete-800 text-concrete-700 dark:text-concrete-300 border border-concrete-200 dark:border-concrete-700 hover:border-blueprint-400'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1.5 shrink-0 pl-2">
            <span className="text-concrete-500">Semester:</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white dark:bg-concrete-800 border border-concrete-200 dark:border-concrete-700 rounded px-2 py-0.5 text-xs text-concrete-800 dark:text-concrete-200"
            >
              <option value="all">All (1-8)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-concrete-100 dark:divide-concrete-800">
          {/* Quick Tool: SGPA Calculator */}
          {(query.toLowerCase().includes('calc') ||
            query.toLowerCase().includes('sgpa') ||
            query.toLowerCase().includes('gpa')) && (
            <div
              onClick={() => {
                setIsSearchOpen(false);
                navigate('/sgpa');
              }}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-safety/60 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/30 dark:from-amber-950/30 dark:via-concrete-900 dark:to-amber-900/10 hover:border-safety cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-safety text-concrete-950 shadow-xs">
                  <Calculator className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-700 dark:text-safety font-bold">TOOL</span>
                    <Badge variant="safety" size="sm">CALCULATOR</Badge>
                  </div>
                  <p className="text-sm font-bold text-concrete-900 dark:text-white truncate">
                    Civil SGPA & CGPA Honors Calculator
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-concrete-400 group-hover:text-blueprint-600 transition-all shrink-0 ml-2" />
            </div>
          )}

          {/* Subjects Matches */}
          {filteredResults.subjects.length > 0 && (
            <div className="space-y-2 pt-2 first:pt-0">
              <span className="text-xs font-mono uppercase tracking-wider text-concrete-400">
                Curricular Subjects ({filteredResults.subjects.length})
              </span>
              <div className="space-y-1.5">
                {filteredResults.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/semester/${sub.semester}/subject/${sub.id}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-concrete-200 dark:border-concrete-800 hover:border-blueprint-400 hover:bg-blueprint-50/50 dark:hover:bg-blueprint-950/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-700 dark:text-blueprint-300 font-mono text-xs font-bold">
                        {sub.code}
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-concrete-500">
                          Semester {sub.semester} • {sub.credits} Credits
                        </span>
                        <p className="text-sm font-bold text-concrete-900 dark:text-white truncate group-hover:text-blueprint-700 dark:group-hover:text-blueprint-300">
                          {sub.name}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-concrete-400 group-hover:text-blueprint-600 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents Matches */}
          {filteredResults.docs.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-xs font-mono uppercase tracking-wider text-concrete-400">
                Academic Documents & Notes ({filteredResults.docs.length})
              </span>
              <div className="space-y-1.5">
                {filteredResults.docs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      openPreview(doc);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-concrete-200 dark:border-concrete-800 hover:border-blueprint-400 hover:bg-blueprint-50/50 dark:hover:bg-blueprint-950/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-concrete-100 dark:bg-concrete-800 text-blueprint-700 dark:text-blueprint-300 font-mono text-xs font-bold uppercase">
                        {doc.fileType}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-blueprint-600 dark:text-blueprint-400 font-bold">
                            {doc.subjectCode}
                          </span>
                          <span className="text-xs font-mono text-concrete-500">
                            Sem {doc.semester} {doc.unit ? `• ${doc.unit}` : ''}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-concrete-900 dark:text-concrete-100 truncate group-hover:text-blueprint-700 dark:group-hover:text-blueprint-300">
                          {doc.title}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-concrete-400 group-hover:text-blueprint-600 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assignments Matches */}
          {filteredResults.asgs.length > 0 && (
            <div className="space-y-2 pt-3">
              <span className="text-xs font-mono uppercase tracking-wider text-concrete-400">
                Coursework Tasks ({filteredResults.asgs.length})
              </span>
              <div className="space-y-1.5">
                {filteredResults.asgs.map((asg) => (
                  <div
                    key={asg.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/semester/${asg.semester}/subject/${asg.subjectId}`);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-concrete-200 dark:border-concrete-800 hover:border-blueprint-400 hover:bg-blueprint-50/50 dark:hover:bg-blueprint-950/30 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-mono text-xs text-concrete-500">
                          {asg.subjectCode} • Due {asg.dueDate}
                        </span>
                        <p className="text-sm font-medium text-concrete-900 dark:text-concrete-100 truncate">
                          {asg.title}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-concrete-400 group-hover:text-blueprint-600 transition-all shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredResults.subjects.length === 0 &&
            filteredResults.docs.length === 0 &&
            filteredResults.asgs.length === 0 && (
              <div className="text-center py-12 text-concrete-500">
                <Search className="h-10 w-10 mx-auto text-concrete-300 mb-2" />
                <p className="font-semibold text-sm">No civil engineering resources found</p>
                <p className="text-xs mt-1">Try searching for "IS 456", "IS 800", "RCC", or "Surveying"</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
