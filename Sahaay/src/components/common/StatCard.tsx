import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  isSimulated?: boolean;
  colorScheme?: 'forest' | 'gold' | 'mint' | 'rose' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  isSimulated = false,
  colorScheme = 'forest',
}) => {
  const iconColorStyles = {
    forest: 'bg-forest-100 text-forest-700 dark:bg-forest-900/60 dark:text-forest-300',
    gold: 'bg-gold-100 text-gold-700 dark:bg-gold-900/50 dark:text-gold-300',
    mint: 'bg-mint-100 text-mint-700 dark:bg-mint-900/50 dark:text-mint-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-night-700 dark:text-slate-300',
  };

  return (
    <Card className="p-5 relative overflow-hidden">
      {isSimulated && (
        <span className="absolute top-2.5 right-3 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-sage-100 text-sage-600 dark:bg-night-700 dark:text-sage-400">
          Simulated
        </span>
      )}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconColorStyles[colorScheme]}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate">{subtitle}</span>
          )}
          {trend && (
            <span
              className={`font-semibold shrink-0 ml-2 ${
                trend.neutral
                  ? 'text-slate-500'
                  : trend.isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
