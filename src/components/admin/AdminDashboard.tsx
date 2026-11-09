import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileText,
  Upload,
  Calendar,
  Layers,
  BookMarked,
  CheckCircle2,
  Trash2,
  Plus,
  Compass,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { BlueprintCard } from '../common/BlueprintCard';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    subjects,
    documents,
    assignments,
    notifications,
    referenceCodes,
    auditLogs,
    deleteDocument,
    openUploadModal,
    showToast,
    resetPortalData,
  } = usePortal();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Executive Admin Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blueprint-950 via-blueprint-900 to-concrete-950 text-white border-2 border-safety/60 shadow-xl p-8 sm:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-safety text-concrete-950 font-mono text-xs font-extrabold mb-2 shadow-sm">
              <ShieldAlert className="h-4 w-4 fill-concrete-950" />
              <span>SINGLE ADMIN COMMAND CENTER</span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              {user.title || 'Department Administration'}
            </h1>
            <p className="text-xs sm:text-sm text-concrete-300 leading-relaxed max-w-xl">
              {getGreeting()}, {user.name} 👋 Welcome back to the Department Administration Center. Manage curriculum documents, assignment questions, and BIS reference codes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="safety"
              onClick={() => openUploadModal()}
              icon={<Upload className="h-4 w-4" />}
            >
              Upload Document
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/admin/manage')}
            >
              Manage Repository
            </Button>
          </div>
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

      {/* System Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-concrete-500 uppercase tracking-wider block font-bold">
            Total Documents
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blueprint-700 dark:text-safety">
              {documents.length}
            </span>
            <span className="text-xs text-concrete-400">PDFs</span>
          </div>
          <span className="text-[11px] text-concrete-500 block">Syllabus, Notes & PYQs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-concrete-500 uppercase tracking-wider block font-bold">
            Civil Subjects
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blueprint-700 dark:text-safety">
              {subjects.length}
            </span>
            <span className="text-xs text-concrete-400">Courses</span>
          </div>
          <span className="text-[11px] text-concrete-500 block">Sem 1 to Sem 8</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-concrete-500 uppercase tracking-wider block font-bold">
            Assignments
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blueprint-700 dark:text-safety">
              {assignments.length}
            </span>
            <span className="text-xs text-concrete-400">Sheets</span>
          </div>
          <span className="text-[11px] text-concrete-500 block">Coursework problem sets</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-concrete-500 uppercase tracking-wider block font-bold">
            Notifications
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blueprint-700 dark:text-safety">
              {notifications.length}
            </span>
            <span className="text-xs text-concrete-400">Notices</span>
          </div>
          <span className="text-[11px] text-concrete-500 block">Academic Notices & Deadlines</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono text-concrete-500 uppercase tracking-wider block font-bold">
            IS Design Codes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blueprint-700 dark:text-safety">
              {referenceCodes.length}
            </span>
            <span className="text-xs text-concrete-400">Codes</span>
          </div>
          <span className="text-[11px] text-concrete-500 block">BIS & Steel Tables</span>
        </div>
      </div>

      {/* Main Content Layout: Uploaded Files & Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Academic Resources Repository */}
        <div className="lg:col-span-2 space-y-6">
          <BlueprintCard
            title="Recent Academic Documents"
            subtitle="Verified uploads active on student-facing semester resource hubs"
            action={
              <Link
                to="/admin/upload"
                className="text-xs font-mono font-bold text-blueprint-600 dark:text-blueprint-400 hover:underline flex items-center gap-1"
              >
                <span>Upload New</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          >
            <div className="divide-y divide-concrete-100 dark:divide-concrete-800 -mx-6 -my-4">
              {documents.slice(0, 6).map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-concrete-50 dark:hover:bg-concrete-850/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-800 dark:text-blueprint-200">
                        {doc.subjectCode}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-concrete-100 dark:bg-concrete-800 text-concrete-600 dark:text-concrete-300 uppercase">
                        {doc.category}
                      </span>
                      <span className="text-xs font-mono text-concrete-400">
                        Sem {doc.semester}
                      </span>
                    </div>
                    <h4 className="font-heading text-sm font-bold text-concrete-900 dark:text-white truncate">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-concrete-500 font-mono">
                      {doc.fileName} • {doc.fileSize} • {formatDate(doc.uploadedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-concrete-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </BlueprintCard>

          {/* Quick Navigation into 8 Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/syllabus"
              className="p-4 rounded-xl border border-concrete-200 dark:border-concrete-800 bg-white dark:bg-concrete-900 hover:border-blueprint-500 transition-colors group"
            >
              <FileText className="w-5 h-5 text-blueprint-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-heading text-xs font-bold block text-concrete-900 dark:text-white">
                Syllabus Hub
              </span>
              <span className="text-[10px] text-concrete-500">Curriculum PDFs</span>
            </Link>

            <Link
              to="/notes"
              className="p-4 rounded-xl border border-concrete-200 dark:border-concrete-800 bg-white dark:bg-concrete-900 hover:border-blueprint-500 transition-colors group"
            >
              <Layers className="w-5 h-5 text-blueprint-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-heading text-xs font-bold block text-concrete-900 dark:text-white">
                Class Notes
              </span>
              <span className="text-[10px] text-concrete-500">Unit-wise Modules</span>
            </Link>

            <Link
              to="/papers"
              className="p-4 rounded-xl border border-concrete-200 dark:border-concrete-800 bg-white dark:bg-concrete-900 hover:border-blueprint-500 transition-colors group"
            >
              <FileText className="w-5 h-5 text-blueprint-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-heading text-xs font-bold block text-concrete-900 dark:text-white">
                Question Papers
              </span>
              <span className="text-[10px] text-concrete-500">PYQ Archive</span>
            </Link>

            <Link
              to="/supply"
              className="p-4 rounded-xl border border-amber-300 dark:border-safety/40 bg-amber-50/40 dark:bg-amber-950/20 hover:border-safety transition-colors group"
            >
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-safety mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-heading text-xs font-bold block text-amber-950 dark:text-safety">
                Supply Notes
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-concrete-400">Supplementary Prep</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Database Health & Audit Logs */}
        <div className="space-y-6">
          {/* Storage & Security Status */}
          <BlueprintCard title="System & Storage Architecture">
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-concrete-600 dark:text-concrete-400">Database Engine</span>
                <span className="font-mono font-bold text-concrete-900 dark:text-white">
                  PostgreSQL / Supabase
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-concrete-600 dark:text-concrete-400">Cloud Storage Bucket</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  elcivilo-documents
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-concrete-600 dark:text-concrete-400">Security Rule</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blueprint-100 dark:bg-blueprint-900/60 text-blueprint-800 dark:text-blueprint-200 font-bold">
                  Public Read / Admin Write
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-concrete-600 dark:text-concrete-400">Active Admin</span>
                <span className="font-mono text-xs text-concrete-900 dark:text-white font-semibold">
                  {user.email}
                </span>
              </div>

              <div className="pt-3 border-t border-concrete-100 dark:border-concrete-800 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/manage')}
                  className="w-full text-xs"
                >
                  Manage Courses & Metadata
                </Button>
                <button
                  onClick={resetPortalData}
                  className="w-full py-1.5 text-xs text-concrete-500 hover:text-red-500 transition-colors font-mono"
                >
                  Reset To Initial Dataset
                </button>
              </div>
            </div>
          </BlueprintCard>

          {/* Audit Logs */}
          <BlueprintCard
            title="Audit Trail"
            subtitle="Recent administrator actions"
            action={
              <Link to="/admin/audit-logs" className="text-xs font-mono text-blueprint-600 hover:underline">
                View All
              </Link>
            }
          >
            <div className="space-y-3 pt-1">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-concrete-800 dark:text-concrete-200">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-concrete-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-concrete-500 truncate">
                    {log.target} {log.details ? `(${log.details})` : ''}
                  </p>
                </div>
              ))}
            </div>
          </BlueprintCard>
        </div>
      </div>
    </div>
  );
};
