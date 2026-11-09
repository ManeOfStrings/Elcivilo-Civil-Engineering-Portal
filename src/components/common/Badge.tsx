import React from 'react';

export type BadgeVariant =
  | 'blueprint'
  | 'steel'
  | 'safety'
  | 'concrete'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'concrete',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    blueprint:
      'bg-blueprint-100 text-blueprint-800 border-blueprint-300 dark:bg-blueprint-950 dark:text-blueprint-300 dark:border-blueprint-800',
    steel:
      'bg-steel/15 text-steel-dark border-steel/30 dark:bg-steel/20 dark:text-steel-light dark:border-steel/40',
    safety:
      'bg-safety/20 text-concrete-900 border-safety/60 dark:bg-safety/15 dark:text-safety dark:border-safety/40 font-semibold',
    concrete:
      'bg-concrete-200 text-concrete-700 border-concrete-300 dark:bg-concrete-800 dark:text-concrete-300 dark:border-concrete-700',
    success:
      'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    warning:
      'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    danger:
      'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    outline:
      'bg-transparent text-concrete-700 border-concrete-300 dark:text-concrete-300 dark:border-concrete-600',
  };

  const dotColors: Record<BadgeVariant, string> = {
    blueprint: 'bg-blueprint-600',
    steel: 'bg-steel',
    safety: 'bg-safety-amber',
    concrete: 'bg-concrete-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    outline: 'bg-concrete-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-tight font-medium',
    md: 'text-xs px-3 py-1 font-semibold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono transition-all duration-150 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} shrink-0 animate-pulse`} />}
      {children}
    </span>
  );
};

