import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-forest-700 hover:bg-forest-800 text-white dark:bg-forest-600 dark:hover:bg-forest-500 shadow-forest-900/10 hover:shadow-md',
    secondary: 'bg-sage-100 hover:bg-sage-200 text-forest-900 dark:bg-night-700 dark:hover:bg-night-600 dark:text-sage-100 border border-sage-200 dark:border-night-600',
    outline: 'border border-forest-600/30 text-forest-800 hover:bg-forest-50 dark:border-forest-400/40 dark:text-forest-200 dark:hover:bg-night-750',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/10',
    ghost: 'bg-transparent hover:bg-sage-100/70 text-slate-700 dark:text-slate-300 dark:hover:bg-night-700 shadow-none',
    gold: 'bg-gold-500 hover:bg-gold-600 text-slate-950 font-semibold shadow-gold-900/10 hover:shadow-md',
    mint: 'bg-mint-100 hover:bg-mint-200 text-forest-900 dark:bg-mint-900/40 dark:text-mint-200 border border-mint-200 dark:border-mint-800',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {rightIcon && !isLoading ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
};
