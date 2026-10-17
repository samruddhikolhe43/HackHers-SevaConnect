import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { SahaayLogo } from '../../components/common/SahaayLogo';
import { 
  LogIn, 
  User, 
  Wrench, 
  Building2, 
  Sparkles, 
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  // Check if redirected from a protected route
  const redirectedFrom = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success && res.role) {
      if (redirectedFrom) {
        navigate(redirectedFrom);
      } else if (res.role === 'citizen') {
        navigate('/citizen');
      } else if (res.role === 'worker') {
        navigate('/worker');
      } else if (res.role === 'organisation') {
        navigate('/org');
      } else {
        navigate('/');
      }
    } else {
      setErrorMessage(res.error || 'Invalid email or password. Please try again.');
    }
  };

  const handleDemoQuickLogin = async (role: UserRole, targetPath: string) => {
    setDemoLoading(role);
    setErrorMessage('');
    const res = await loginAsDemo(role);
    setDemoLoading(null);

    if (res.success) {
      navigate(targetPath);
    } else {
      setErrorMessage(res.error || 'Failed to load demo portal.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <SahaayLogo size="lg" showText={false} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Sign In to Sahaay
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Access your personal citizen, worker, or organisation account
        </p>
      </div>

      {redirectedFrom && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Please sign in to access that protected portal.</span>
        </div>
      )}

      {/* 1. Primary Standard Account Login */}
      <Card className="p-6 shadow-soft border-sage-200 dark:border-night-700">
        <form onSubmit={handleStandardLogin} className="space-y-4">
          <div className="flex items-center justify-between border-b border-sage-100 dark:border-night-700 pb-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Account Credentials
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified SQLite Auth
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-slate-900 dark:text-slate-100 text-xs sm:text-sm focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="md" fullWidth isLoading={isSubmitting}>
            <LogIn className="w-4 h-4 mr-1.5" />
            <span>Sign In to Account</span>
          </Button>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-forest-700 dark:text-forest-400 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </Card>

      {/* 2. Separate Distinct "Explore Demo" Section */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-sage-200 dark:border-night-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-ivory-50 dark:bg-night-900 px-3 text-slate-500 font-medium">
            Or Explore Without Registering
          </span>
        </div>
      </div>

      <Card className="p-5 border-forest-200 dark:border-forest-900/60 bg-gradient-to-b from-forest-50/40 to-white dark:from-forest-950/20 dark:to-night-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-forest-900 dark:text-forest-200 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span>Explore Demo Mode</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-300">
            Sample Portals
          </span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
          Quickly inspect pre-populated workflows, sample tasks, and reporting dashboards using isolated demonstration personas:
        </p>

        <div className="space-y-2">
          {/* Priya Demo */}
          <button
            type="button"
            disabled={demoLoading !== null}
            onClick={() => handleDemoQuickLogin('citizen', '/citizen')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 hover:border-forest-500 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-700 flex items-center justify-center font-bold text-xs">
                PS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Priya Sharma</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-sage-100 dark:bg-night-700 text-slate-600 dark:text-slate-300">Demo Citizen</span>
                </p>
                <p className="text-[11px] text-slate-500">Citizen Reporter (Pune records)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-forest-700 dark:text-forest-400 flex items-center gap-1">
              {demoLoading === 'citizen' ? 'Loading...' : 'Open Demo →'}
            </span>
          </button>

          {/* Rahul Demo */}
          <button
            type="button"
            disabled={demoLoading !== null}
            onClick={() => handleDemoQuickLogin('worker', '/worker')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 hover:border-gold-500 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center font-bold text-xs">
                RV
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Rahul Verma</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-gold-50 dark:bg-gold-950/60 text-gold-700 dark:text-gold-300">Demo Worker</span>
                </p>
                <p className="text-[11px] text-slate-500">Certified Community Worker (Nagpur)</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-gold-600 dark:text-gold-400 flex items-center gap-1">
              {demoLoading === 'worker' ? 'Loading...' : 'Open Demo →'}
            </span>
          </button>

          {/* Org Demo */}
          <button
            type="button"
            disabled={demoLoading !== null}
            onClick={() => handleDemoQuickLogin('organisation', '/org')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 hover:border-forest-700 text-left transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-forest-200 text-forest-900 flex items-center justify-center font-bold text-xs">
                SK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>Dr. Sunita Kulkarni</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300">Demo NGO</span>
                </p>
                <p className="text-[11px] text-slate-500">Sahaay Partner Welfare Alliance</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-forest-700 dark:text-forest-400 flex items-center gap-1">
              {demoLoading === 'organisation' ? 'Loading...' : 'Open Demo →'}
            </span>
          </button>
        </div>
      </Card>

      <div className="text-center text-[11px] text-slate-400 max-w-xs mx-auto">
        Normal accounts have independent private records stored in local SQLite database.
      </div>
    </div>
  );
};
