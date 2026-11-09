import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { usePortal } from '../../context/PortalContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePortal();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
          info: <Info className="h-5 w-5 text-blueprint-500 shrink-0" />,
        };

        const borderStyles = {
          success: 'border-emerald-300 dark:border-emerald-800 bg-white dark:bg-concrete-900',
          error: 'border-rose-300 dark:border-rose-800 bg-white dark:bg-concrete-900',
          info: 'border-blueprint-300 dark:border-blueprint-800 bg-white dark:bg-concrete-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${borderStyles[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-xs sm:text-sm font-medium text-concrete-900 dark:text-concrete-100">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-concrete-400 hover:text-concrete-600 dark:hover:text-concrete-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

