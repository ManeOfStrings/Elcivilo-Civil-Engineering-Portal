import React from 'react';

export type ButtonVariant =
  | 'blueprint'
  | 'steel'
  | 'safety'
  | 'concrete'
  | 'danger'
  | 'ghost'
  | 'outline'
  | 'primary'
  | 'secondary';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'blueprint',
  size = 'md',
  icon,
  rightIcon,
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const variantStyles: Record<ButtonVariant, string> = {
    blueprint:
      'bg-gradient-to-r from-blueprint-700 to-blueprint-800 hover:from-blueprint-600 hover:to-blueprint-700 text-white shadow-blueprint hover:shadow-blueprint-lg border border-blueprint-600/60 focus-visible:ring-blueprint-500',
    steel:
      'bg-gradient-to-r from-steel to-steel-dark hover:from-steel-light hover:to-steel text-white shadow-sm border border-steel-dark/60 focus-visible:ring-steel',
    safety:
      'bg-safety hover:bg-safety-light text-concrete-950 font-bold shadow-safety hover:shadow-safety border border-safety-dark/80 focus-visible:ring-safety',
    concrete:
      'bg-concrete-200/90 hover:bg-concrete-300 text-concrete-800 border border-concrete-300/80 dark:bg-concrete-800 dark:hover:bg-concrete-700 dark:text-concrete-200 dark:border-concrete-700 focus-visible:ring-concrete-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-700 focus-visible:ring-rose-500',
    ghost:
      'bg-transparent hover:bg-concrete-200/60 text-concrete-700 hover:text-concrete-900 dark:hover:bg-concrete-800/60 dark:text-concrete-300 dark:hover:text-white',
    outline:
      'bg-white/80 dark:bg-concrete-900/80 hover:bg-blueprint-50 dark:hover:bg-blueprint-950/60 border border-concrete-300 dark:border-concrete-700 text-blueprint-700 dark:text-blueprint-300 hover:border-blueprint-500',
    primary:
      'bg-gradient-to-r from-blueprint-700 to-blueprint-800 hover:from-blueprint-600 hover:to-blueprint-700 text-white shadow-blueprint hover:shadow-blueprint-lg border border-blueprint-600/60 focus-visible:ring-blueprint-500',
    secondary:
      'bg-concrete-200/90 hover:bg-concrete-300 text-concrete-800 border border-concrete-300/80 dark:bg-concrete-800 dark:hover:bg-concrete-700 dark:text-concrete-200 dark:border-concrete-700 focus-visible:ring-concrete-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-4 py-2 rounded-xl gap-2 font-semibold',
    md: 'text-sm px-5 py-2.5 rounded-2xl gap-2.5 font-semibold',
    lg: 'text-base px-7 py-3.5 rounded-2xl gap-3 font-bold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center font-heading transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

