import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RoleSwitcherBanner } from '../components/common/RoleSwitcherBanner';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { NotificationDrawer } from '../components/common/NotificationDrawer';
import { SahaayLogo } from '../components/common/SahaayLogo';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  X, 
  Bell, 
  LogIn,
  UserPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LogOut,
  PhoneCall
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { LanguageSelector } from '../components/common/LanguageSelector';

export const PublicLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toggleNotifications, unreadCount } = useNotifications();
  const { role, isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.howItWorks, path: '/how-it-works' },
    { label: t.nav.interactiveMap, path: '/org/map' },
  ];

  const getDashboardPath = () => {
    if (role === 'citizen') return '/citizen';
    if (role === 'worker') return '/worker';
    if (role === 'organisation') return '/org';
    return '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 dark:bg-night-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Main Public Navigation Bar (No intrusive banner on public site) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-night-850/95 backdrop-blur-md border-b border-sage-200 dark:border-night-700 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link to="/" className="group focus:outline-none">
              <SahaayLogo size="md" />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-forest-900 bg-forest-50 dark:text-forest-200 dark:bg-forest-950/70 font-semibold border border-forest-200/60 dark:border-forest-800'
                        : 'text-slate-600 dark:text-slate-300 hover:text-forest-800 dark:hover:text-white hover:bg-sage-100/60 dark:hover:bg-night-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSelector />
              <ThemeToggle />

              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-sage-100/80 hover:bg-sage-200/80 dark:text-slate-300 dark:hover:text-white dark:bg-night-800 dark:hover:bg-night-700 border border-sage-200/80 dark:border-night-700 transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* If authenticated user */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-forest-700 hover:bg-forest-800 text-white dark:bg-forest-600 dark:hover:bg-forest-500 shadow-sm transition-all"
                  >
                    <span>My {role.charAt(0).toUpperCase() + role.slice(1)} Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-night-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  {/* Distinct Explore Demo Button */}
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-900 hover:bg-amber-100/80 transition-all"
                    title="Explore demonstration accounts without registering"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Explore Demo</span>
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-forest-900 dark:text-forest-200 hover:bg-forest-50 dark:hover:bg-night-800 border border-sage-200 dark:border-night-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                    <span>Login</span>
                  </Link>

                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-forest-700 hover:bg-forest-800 text-white dark:bg-forest-600 dark:hover:bg-forest-500 shadow-sm transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sage-100 dark:hover:bg-night-800"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 px-4 pt-2 pb-6 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-sage-100 dark:hover:bg-night-800"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-sage-200 dark:border-night-700 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-sage-200 dark:border-night-700 text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-forest-700 text-white text-sm font-semibold shadow-sm"
              >
                Register
              </Link>
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explore Demo Portals:</span>
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <Link
                  to="/citizen"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-medium text-center"
                >
                  Priya (Citizen)
                </Link>
                <Link
                  to="/worker"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-medium text-center"
                >
                  Rahul (Worker)
                </Link>
                <Link
                  to="/org"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-medium text-center"
                >
                  Sunita (Org)
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Global Public Footer */}
      <footer className="bg-forest-950 text-forest-100 border-t border-forest-900 mt-20 pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Col 1: Mission */}
            <div className="md:col-span-1 space-y-4">
              <SahaayLogo size="md" lightText />
              <p className="text-xs sm:text-sm text-forest-300 leading-relaxed">
                Sahaay is a community-service coordination platform that creates paid local work opportunities while helping citizens and organisations coordinate community welfare and animal-rescue needs.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-gold-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span>Verified community workflow</span>
              </div>
            </div>

            {/* Col 2: Citizen & Worker Links */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Community Access
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-forest-300">
                <li>
                  <Link to="/citizen/report" className="hover:text-white transition-colors">
                    Report an Incident or Need
                  </Link>
                </li>
                <li>
                  <Link to="/citizen/assisted-help" className="hover:text-white transition-colors">
                    Assisted Phone Intake
                  </Link>
                </li>
                <li>
                  <Link to="/worker/tasks" className="hover:text-white transition-colors">
                    Eligible Tasks & Earning
                  </Link>
                </li>
                <li>
                  <Link to="/worker/training" className="hover:text-white transition-colors">
                    Safety Training & Verification
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-white transition-colors">
                    How Sahaay Works
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Organisation & Responders */}
            <div>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                Organisations & Responders
              </h4>
              <ul className="space-y-2.5 text-xs sm:text-sm text-forest-300">
                <li>
                  <Link to="/org" className="hover:text-white transition-colors">
                    Organisation Coordination Console
                  </Link>
                </li>
                <li>
                  <Link to="/org/map" className="hover:text-white transition-colors">
                    Interactive Incident Map
                  </Link>
                </li>
                <li>
                  <Link to="/org/analytics" className="hover:text-white transition-colors">
                    Community Impact Records
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    Safety Charter & Medical Escalation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Emergency Assistance Helpline */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
                Emergency Helpline
              </h4>
              <div className="p-4 rounded-xl bg-forest-900 border border-forest-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase mb-1">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>National Emergency</span>
                </div>
                <div className="text-2xl font-black text-white tracking-wide">1962</div>
                <p className="text-[11px] text-forest-300 mt-1">
                  Immediate connection for high-risk, rabies suspicion, or critical medical emergencies.
                </p>
              </div>
              <p className="text-[11px] text-forest-400 leading-relaxed">
                Prototype demonstration: Payment records and automated dispatches are simulated for testing.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-forest-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-forest-400">
            <p>© 2026 Sahaay Platform. Built for community impact and reliable local work.</p>
            <div className="flex items-center gap-6">
              <span className="hover:underline cursor-pointer">Privacy Guidelines</span>
              <span className="hover:underline cursor-pointer">Safety Protocol</span>
              <span className="hover:underline cursor-pointer">Community Standards</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Notification Drawer */}
      <NotificationDrawer />
    </div>
  );
};
