import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-night-800 rounded-2xl border border-sage-200/80 dark:border-night-700 shadow-soft transition-all duration-200 ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-card dark:hover:shadow-card-dark cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, badge, className = '' }) => (
  <div className={`p-5 sm:p-6 border-b border-sage-100 dark:border-night-700/80 flex items-start justify-between gap-4 ${className}`}>
    <div>
      <div className="flex items-center gap-2.5 flex-wrap">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
        {badge}
      </div>
      {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className={`px-5 py-3.5 sm:px-6 bg-sage-50/60 dark:bg-night-850/50 rounded-b-2xl border-t border-sage-100 dark:border-night-700/80 flex items-center justify-between gap-3 text-xs sm:text-sm ${className}`}>
    {children}
  </div>
);
