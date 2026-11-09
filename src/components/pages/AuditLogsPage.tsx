import React from 'react';
import { usePortal } from '../../context/PortalContext';
import { BlueprintCard } from '../common/BlueprintCard';
import { Badge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = usePortal();

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 sm:p-10 lg:p-12 rounded-3xl bg-white dark:bg-concrete-900 border border-concrete-300 dark:border-concrete-800 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="font-mono text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-safety border border-amber-300 dark:border-amber-800 font-bold">
              ADMIN AUDIT TRAIL • AUDIT LOG
            </span>
            <span className="text-xs font-mono text-concrete-500">Security & Integrity Ledger</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-concrete-900 dark:text-white tracking-tight">
            Administrative Action Logs
          </h1>
          <p className="text-sm sm:text-base text-concrete-600 dark:text-concrete-400 leading-relaxed">
            Immutable tracking for document uploads, syllabus deletions, grading actions, and user role transitions.
          </p>
        </div>
      </div>

      <BlueprintCard title="System Activity Ledger">
        {auditLogs.length === 0 ? (
          <p className="text-xs text-concrete-500 py-12 text-center font-mono">No actions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm font-mono">
              <thead>
                <tr className="border-b border-concrete-200 dark:border-concrete-800 text-concrete-400">
                  <th className="pb-4 font-semibold">ACTION</th>
                  <th className="pb-4 font-semibold">TARGET OBJECT</th>
                  <th className="pb-4 font-semibold">OPERATOR</th>
                  <th className="pb-4 font-semibold">ROLE</th>
                  <th className="pb-4 font-semibold">TIMESTAMP</th>
                  <th className="pb-4 font-semibold">DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-concrete-100 dark:divide-concrete-800 text-concrete-700 dark:text-concrete-300">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-concrete-50 dark:hover:bg-concrete-800/40 transition-colors">
                    <td className="py-4 font-bold text-blueprint-700 dark:text-blueprint-300">
                      {log.action}
                    </td>
                    <td className="py-4 max-w-[220px] truncate text-concrete-900 dark:text-white font-semibold">
                      {log.target}
                    </td>
                    <td className="py-4">{log.user}</td>
                    <td className="py-4">
                      <Badge variant="safety" size="sm">
                        ADMIN
                      </Badge>
                    </td>
                    <td className="py-4 text-concrete-500">{formatDateTime(log.timestamp)}</td>
                    <td className="py-4 text-concrete-400 truncate max-w-[200px]">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BlueprintCard>
    </div>
  );
};

