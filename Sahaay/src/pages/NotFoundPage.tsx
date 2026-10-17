import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Heart, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-forest-100 dark:bg-forest-900/60 text-forest-700 dark:text-forest-300 flex items-center justify-center shadow-md">
          <Heart className="w-8 h-8 fill-current text-gold-500" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl sm:text-6xl font-black text-forest-800 dark:text-forest-300">
            404
          </span>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The link you followed may be broken or the page may have been moved. Return to the main portal or jump to your role dashboard.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home className="w-4 h-4 mr-1.5" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link to="/citizen">
            <Button variant="outline" size="md">
              <span>Citizen Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
