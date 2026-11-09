import React from 'react';

interface BlueprintCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  variant?: 'default' | 'blueprint' | 'safety' | 'concrete';
  highlight?: boolean;
  onClick?: () => void;
}

export const BlueprintCard: React.FC<BlueprintCardProps> = ({
  children,
  title,
  subtitle,
  action,
  badge,
  icon,
  className = '',
  headerClassName = '',
  variant = 'default',
  highlight = false,
  onClick,
}) => {
  const activeVariant = highlight ? 'safety' : variant;
  const variantStyles = {
    default:
      'bg-white/95 dark:bg-concrete-900/95 border-concrete-200/90 dark:border-concrete-800/90 text-concrete-900 dark:text-concrete-100 shadow-sm hover:shadow-blueprint-lg',
    blueprint:
      'bg-gradient-to-br from-blueprint-50/60 to-white/90 dark:from-blueprint-950/40 dark:to-concrete-900/90 border-blueprint-200/80 dark:border-blueprint-800/80 text-concrete-900 dark:text-concrete-100 shadow-blueprint',
    safety:
      'bg-gradient-to-br from-amber-50/70 to-white/95 dark:from-amber-950/30 dark:to-concrete-900/95 border-safety/60 dark:border-safety/40 text-concrete-900 dark:text-concrete-100 shadow-safety',
    concrete:
      'bg-concrete-50/90 dark:bg-concrete-850/80 border-concrete-200 dark:border-concrete-700/80 text-concrete-900 dark:text-concrete-100',
  };

  return (
    <div
      onClick={onClick}
      className={`relative rounded-3xl border backdrop-blur-md transition-all duration-300 ${variantStyles[activeVariant]} ${
        onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''
      } ${className}`}
    >
      {(title || subtitle || action || badge || icon) && (
        <div
          className={`flex items-start justify-between gap-5 px-7 py-5 sm:px-8 sm:py-6 border-b border-concrete-100/90 dark:border-concrete-800/80 ${headerClassName}`}
        >
          <div className="flex items-center gap-4 min-w-0">
            {icon && (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blueprint-100/80 dark:bg-blueprint-900/60 text-blueprint-700 dark:text-blueprint-300 border border-blueprint-200/80 dark:border-blueprint-800/80 shadow-xs">
                {icon}
              </div>
            )}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                {title && (
                  <h3 className="font-heading font-bold text-lg sm:text-xl tracking-tight text-concrete-900 dark:text-white truncate">
                    {title}
                  </h3>
                )}
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs sm:text-sm text-concrete-500 dark:text-concrete-400 leading-relaxed font-sans">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0 pt-0.5">{action}</div>}
        </div>
      )}

      <div className="p-7 sm:p-8 lg:p-9">{children}</div>
    </div>
  );
};
