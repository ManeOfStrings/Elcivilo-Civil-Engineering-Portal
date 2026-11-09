import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Bookmark,
  Share2,
  Printer,
  FileText,
  Calendar,
  User,
  Eye,
  CheckCircle2,
  HardDrive,
  ExternalLink,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { Badge } from './Badge';
import { Button } from './Button';
import { formatDate } from '../../utils/formatters';

export const FilePreviewModal: React.FC = () => {
  const { previewDoc, closePreview, toggleBookmark, downloadDocument, showToast } = usePortal();
  const [mobileTab, setMobileTab] = useState<'preview' | 'details'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (previewDoc) {
      setMobileTab('preview');
    }
  }, [previewDoc?.id]);

  if (!previewDoc) return null;

  const handleDownload = () => {
    downloadDocument(previewDoc);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(previewDoc.fileUrl || window.location.href);
    showToast('Document link copied to clipboard', 'info');
  };

  const isImage =
    previewDoc.fileType === 'image' ||
    Boolean(previewDoc.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|svg)($|\?)/i));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-concrete-950/80 backdrop-blur-sm animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0' : 'p-0 sm:p-3 md:p-5 lg:p-6'
      }`}
    >
      <div
        className={`relative flex flex-col w-full bg-white dark:bg-concrete-900 border-concrete-300 dark:border-concrete-700 shadow-2xl overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? 'w-full h-full max-w-none rounded-none border-0'
            : 'max-w-7xl h-[100dvh] sm:h-[94vh] md:h-[95vh] rounded-none sm:rounded-2xl md:rounded-3xl border sm:border'
        }`}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3.5 bg-blueprint-900 text-white border-b border-blueprint-800 shrink-0 gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-blueprint-700/80 border border-blueprint-500/50 text-safety">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-mono text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-blueprint-800 text-blueprint-200 border border-blueprint-700 font-semibold truncate max-w-[80px] sm:max-w-none">
                  {previewDoc.subjectCode}
                </span>
                <span className="font-mono text-[9px] sm:text-xs text-blueprint-300 uppercase truncate">
                  {previewDoc.fileType.toUpperCase()} • {previewDoc.fileSize}
                </span>
              </div>
              <h2 className="font-heading font-semibold text-xs sm:text-base text-white truncate max-w-[170px] sm:max-w-md md:max-w-xl">
                {previewDoc.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Open Raw File in New Tab */}
            {previewDoc.fileUrl && (
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 sm:p-2 text-blueprint-200 hover:text-white hover:bg-blueprint-800 rounded-xl transition-colors flex items-center gap-1 text-xs font-mono font-semibold"
                title="Open original file in new window"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden md:inline">Open in Tab</span>
              </a>
            )}

            {/* Toggle Fullscreen button */}
            <button
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-1.5 sm:p-2 text-blueprint-200 hover:text-white hover:bg-blueprint-800 rounded-xl transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Maximize Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={() => toggleBookmark(previewDoc.id)}
              className={`p-1.5 sm:p-2 rounded-xl transition-colors ${
                previewDoc.isBookmarked
                  ? 'text-safety bg-blueprint-800'
                  : 'text-blueprint-200 hover:text-white hover:bg-blueprint-800'
              }`}
              title="Bookmark Document"
            >
              <Bookmark className={`h-4 w-4 ${previewDoc.isBookmarked ? 'fill-safety' : ''}`} />
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 sm:p-2 text-blueprint-200 hover:text-white hover:bg-blueprint-800 rounded-xl transition-colors hidden sm:block"
              title="Share Link"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 sm:p-2 text-blueprint-200 hover:text-white hover:bg-blueprint-800 rounded-xl transition-colors hidden md:block"
              title="Print Document"
            >
              <Printer className="h-4 w-4" />
            </button>

            <Button
              variant="safety"
              size="sm"
              icon={<Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              onClick={handleDownload}
              className="px-2.5 sm:px-3 text-xs"
            >
              <span className="hidden sm:inline">Download</span>
            </Button>

            <button
              onClick={closePreview}
              className="p-1.5 sm:p-2 text-blueprint-300 hover:text-white hover:bg-blueprint-800 rounded-xl transition-colors ml-0.5 sm:ml-1"
              title="Close Preview"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Responsive View Mode Switcher */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 bg-concrete-100 dark:bg-concrete-950 border-b border-concrete-200 dark:border-concrete-800 text-xs font-mono text-concrete-600 dark:text-concrete-400 shrink-0 gap-2">
          {/* Left: Mobile Tab Switcher on mobile/small screens; Document title on desktop */}
          <div className="flex items-center gap-2 sm:gap-3 truncate">
            {/* Mobile Tab Toggle */}
            <div className="flex md:hidden items-center bg-concrete-200 dark:bg-concrete-800 p-0.5 rounded-lg border border-concrete-300 dark:border-concrete-700">
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  mobileTab === 'preview'
                    ? 'bg-blueprint-700 text-white shadow-sm'
                    : 'text-concrete-600 dark:text-concrete-400 hover:text-concrete-900 dark:hover:text-white'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Document View</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('details')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  mobileTab === 'details'
                    ? 'bg-blueprint-700 text-white shadow-sm'
                    : 'text-concrete-600 dark:text-concrete-400 hover:text-concrete-900 dark:hover:text-white'
                }`}
              >
                <Info className="h-3 w-3" />
                <span>Specs & Info</span>
              </button>
            </div>

            {/* Desktop doc name and status */}
            <span className="hidden md:inline font-semibold text-concrete-800 dark:text-concrete-200 truncate">
              {previewDoc.fileName || previewDoc.title}
            </span>
            <span className="text-concrete-400 hidden lg:inline">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 hidden lg:flex items-center gap-1 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified Document
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="font-mono text-concrete-500 text-[10px] sm:text-[11px]">
              Semester {previewDoc.semester}
            </span>
            {previewDoc.fileUrl && (
              <a
                href={previewDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blueprint-600 dark:text-blueprint-400 font-semibold hover:underline flex items-center gap-1 text-[11px] sm:text-xs"
              >
                <span>Full Window</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Main Viewport: Real File Viewer + Technical Sidebar */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Real Document / PDF Viewer Canvas */}
          <div
            className={`flex-1 flex flex-col bg-concrete-200 dark:bg-concrete-950 p-1 sm:p-2.5 md:p-3 overflow-hidden relative min-h-0 ${
              mobileTab === 'details' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {isImage ? (
              <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-auto">
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-full max-w-full object-contain rounded-lg sm:rounded-xl shadow-lg border border-concrete-300 dark:border-concrete-700 bg-white dark:bg-concrete-900"
                />
              </div>
            ) : previewDoc.fileUrl ? (
              /* Embedded PDF / Document Viewer */
              <div className="w-full h-full rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-concrete-300 dark:border-concrete-800 bg-white dark:bg-concrete-900 flex flex-col min-h-0">
                <object
                  data={`${previewDoc.fileUrl}#view=FitH&toolbar=1&navpanes=0`}
                  type="application/pdf"
                  className="w-full h-full flex-1 border-0 min-h-0"
                >
                  <iframe
                    src={`${previewDoc.fileUrl}#view=FitH&toolbar=1&navpanes=0`}
                    title={previewDoc.title}
                    className="w-full h-full flex-1 border-0 min-h-0"
                  >
                    {/* Fallback for browsers unable to render inline PDF */}
                    <div className="h-full w-full flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-4 overflow-y-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blueprint-50 dark:bg-blueprint-950 flex items-center justify-center text-blueprint-600 dark:text-blueprint-400">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div className="space-y-1 max-w-md">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-concrete-900 dark:text-white">
                          {previewDoc.title}
                        </h3>
                        <p className="text-xs text-concrete-500 font-sans">
                          Click below to view or download the uploaded document.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2">
                        <a
                          href={previewDoc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-blueprint-700 hover:bg-blueprint-600 text-white font-mono text-xs font-bold transition-colors shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Document</span>
                        </a>
                        <Button
                          variant="safety"
                          size="sm"
                          icon={<Download className="w-4 h-4" />}
                          onClick={handleDownload}
                        >
                          Download File
                        </Button>
                      </div>
                    </div>
                  </iframe>
                </object>
              </div>
            ) : (
              /* Fallback if no fileUrl */
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white dark:bg-concrete-900 rounded-xl sm:rounded-2xl border border-concrete-300 dark:border-concrete-800">
                <FileText className="w-12 h-12 text-concrete-400" />
                <h3 className="font-heading font-bold text-base text-concrete-900 dark:text-white">
                  No File URL Available
                </h3>
                <p className="text-xs text-concrete-500 font-sans max-w-sm">
                  This document record does not have a linked file URL.
                </p>
              </div>
            )}
          </div>

          {/* Right Technical Specification Drawer */}
          <div
            className={`w-full md:w-80 lg:w-96 bg-concrete-50 dark:bg-concrete-900 border-t md:border-t-0 md:border-l border-concrete-200 dark:border-concrete-800 p-4 sm:p-5 shrink-0 overflow-y-auto ${
              mobileTab === 'preview' ? 'hidden md:block' : 'block'
            }`}
          >
            {/* Quick Switch back to Document View on Mobile */}
            <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-concrete-200 dark:border-concrete-800">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-concrete-700 dark:text-concrete-300">
                Specifications & Meta
              </span>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className="px-2.5 py-1 rounded-lg bg-blueprint-50 dark:bg-blueprint-900/40 text-blueprint-700 dark:text-blueprint-300 text-xs font-semibold hover:bg-blueprint-100 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Back to Document</span>
              </button>
            </div>

            <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-concrete-500 dark:text-concrete-400 mb-4 hidden md:block">
              Document Specifications
            </h4>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-concrete-500 block mb-1">Category & Type</span>
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="blueprint">{previewDoc.category.replace('_', ' ').toUpperCase()}</Badge>
                  <Badge variant="steel">{previewDoc.fileType.toUpperCase()}</Badge>
                </div>
              </div>

              <div>
                <span className="text-concrete-500 block mb-1">Target Subject</span>
                <p className="font-medium text-concrete-900 dark:text-concrete-100">
                  {previewDoc.subjectName} ({previewDoc.subjectCode})
                </p>
              </div>

              {previewDoc.unit && (
                <div>
                  <span className="text-concrete-500 block mb-1">Module / Unit</span>
                  <Badge variant="concrete">{previewDoc.unit}</Badge>
                </div>
              )}

              {previewDoc.examYear && (
                <div>
                  <span className="text-concrete-500 block mb-1">Examination Year & Type</span>
                  <p className="font-semibold text-concrete-900 dark:text-concrete-100">
                    {previewDoc.examYear} • {previewDoc.examType}
                  </p>
                </div>
              )}

              {previewDoc.supplyCategory && (
                <div>
                  <span className="text-concrete-500 block mb-1">Supply Specialization</span>
                  <Badge variant="safety">{previewDoc.supplyCategory}</Badge>
                </div>
              )}

              {previewDoc.description && (
                <div>
                  <span className="text-concrete-500 block mb-1">Description</span>
                  <p className="text-xs text-concrete-700 dark:text-concrete-300 font-sans leading-relaxed">
                    {previewDoc.description}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-concrete-200 dark:border-concrete-800 space-y-2 text-concrete-600 dark:text-concrete-400">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Uploaded</span>
                  <span className="font-mono">{formatDate(previewDoc.uploadedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Contributor</span>
                  <span className="font-medium text-concrete-800 dark:text-concrete-200">{previewDoc.uploadedBy || 'Civil Department Faculty'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5" /> File Size</span>
                  <span className="font-mono">{previewDoc.fileSize}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Downloads</span>
                  <span className="font-mono font-semibold text-blueprint-600 dark:text-blueprint-400">{previewDoc.downloadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> Views</span>
                  <span className="font-mono font-semibold">{previewDoc.viewsCount || 128}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-concrete-200 dark:border-concrete-800 space-y-2">
                <Button
                  variant="blueprint"
                  size="sm"
                  className="w-full"
                  icon={<Download className="h-4 w-4" />}
                  onClick={handleDownload}
                >
                  Save Original File
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  icon={<Bookmark className="h-4 w-4" />}
                  onClick={() => toggleBookmark(previewDoc.id)}
                >
                  {previewDoc.isBookmarked ? 'Remove Bookmark' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
