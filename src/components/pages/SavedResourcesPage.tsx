import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Eye, Download } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { formatDate } from '../../utils/formatters';

export const SavedResourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, openPreview, toggleBookmark, downloadDocument } = usePortal();

  const bookmarkedDocs = documents.filter((doc) => doc.isBookmarked);

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 sm:p-10 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="font-mono text-xs px-3 py-1 rounded-xl bg-blueprint-100 text-blueprint-800 dark:bg-blueprint-950 dark:text-blueprint-300 border border-blueprint-300 dark:border-blueprint-800 font-bold">
              COLLECTION • SAVED REPOSITORY
            </span>
            <span className="text-xs font-mono text-concrete-500">Fast Local Pinning</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-concrete-900 dark:text-white tracking-tight">
            Saved Academic Documents
          </h1>
          <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 leading-relaxed font-sans">
            Your pinned quick-access vault for IS standard design codes, lecture units, and past question papers.
          </p>
        </div>
      </div>

      {bookmarkedDocs.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-concrete-900 rounded-3xl border border-concrete-300 dark:border-concrete-800 space-y-4">
          <Bookmark className="h-14 w-14 mx-auto text-concrete-300 dark:text-concrete-700" />
          <h3 className="font-heading font-bold text-concrete-900 dark:text-white text-lg">
            No Bookmarks Saved Yet
          </h3>
          <p className="text-xs sm:text-sm text-concrete-500 max-w-md mx-auto leading-relaxed">
            Click the bookmark ribbon on any lecture note, textbook, or past exam question paper to store it in your quick vault.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-xl bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Browse Semesters & Subjects
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedDocs.map((doc) => (
            <div
              key={doc.id}
              className="group rounded-3xl border-2 border-concrete-300 dark:border-concrete-800 bg-white/95 dark:bg-concrete-900/95 p-6 shadow-sm hover:shadow-blueprint hover:border-blueprint-500 dark:hover:border-blueprint-400 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blueprint-600 dark:text-blueprint-400">
                      {doc.subjectCode}
                    </span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-400">
                      Sem {doc.semester}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-bold uppercase text-blueprint-700 dark:text-blueprint-300">
                    {doc.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-base text-concrete-900 dark:text-white line-clamp-2 group-hover:text-blueprint-600 dark:group-hover:text-blueprint-400 transition-colors">
                    {doc.title}
                  </h4>
                  <p className="font-mono text-xs text-concrete-500 truncate">
                    {doc.subjectName}
                  </p>
                </div>

                {doc.description && (
                  <p className="text-xs text-concrete-600 dark:text-concrete-400 font-sans line-clamp-2">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-concrete-400 pt-2 border-t border-concrete-100 dark:border-concrete-800">
                  <span>{doc.fileSize}</span>
                  <span>{formatDate(doc.uploadedAt)}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-concrete-100 dark:border-concrete-800 flex items-center gap-2">
                <button
                  onClick={() => openPreview(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blueprint-700 text-white hover:bg-blueprint-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => downloadDocument(doc)}
                  className="p-2 rounded-xl border border-concrete-300 dark:border-concrete-700 hover:bg-concrete-100 dark:hover:bg-concrete-800 text-concrete-700 dark:text-concrete-300 transition-colors cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleBookmark(doc.id)}
                  className="p-2 rounded-xl border border-safety/60 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-safety transition-colors cursor-pointer"
                  title="Remove from Saved Vault"
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
