import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-sage-100/80 hover:bg-sage-200/80 dark:text-slate-300 dark:hover:text-white dark:bg-night-800 dark:hover:bg-night-700 border border-sage-200/80 dark:border-night-700 transition-colors shadow-sm ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-forest-700 transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-gold-400 transition-transform hover:rotate-45" />
      )}
    </button>
  );
};
