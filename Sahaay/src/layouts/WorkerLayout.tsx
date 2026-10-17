import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { RoleSwitcherBanner } from '../components/common/RoleSwitcherBanner';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { NotificationDrawer } from '../components/common/NotificationDrawer';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { SahaayLogo } from '../components/common/SahaayLogo';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { 
  Heart, 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  IndianRupee, 
  UserCheck, 
  GraduationCap, 
  Bell, 
  Menu, 
  X, 
  Power,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  LogOut
} from 'lucide-react';

export const WorkerLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toggleNotifications, unreadCount } = useNotifications();
  const { user, isWorkerAvailable, toggleWorkerAvailability, logout, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Worker Dashboard', path: '/worker', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Available Tasks', path: '/worker/tasks', icon: <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'My Active Tasks', path: '/worker/my-tasks', icon: <CheckSquare className="w-4 h-4 text-forest-600 dark:text-forest-400" /> },
    { label: 'Simulated Earnings', path: '/worker/earnings', icon: <IndianRupee className="w-4 h-4 text-gold-500" /> },
    { label: 'Training & Safety Verification', path: '/worker/training', icon: <GraduationCap className="w-4 h-4" /> },
    { label: 'Worker Profile', path: '/worker/profile', icon: <UserCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 dark:bg-night-900 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <RoleSwitcherBanner />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-night-850 border-r border-sage-200/80 dark:border-night-700 p-4 shrink-0 justify-between">
          <div className="space-y-6">
            {/* Brand */}
            <div className="px-2 space-y-1">
              <Link to="/" className="block">
                <SahaayLogo size="sm" />
              </Link>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 pl-1">
                Worker Console
              </span>
            </div>

            {/* Interactive Availability Toggle Card */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              isWorkerAvailable 
                ? 'bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800' 
                : 'bg-slate-50 border-slate-200 dark:bg-night-800 dark:border-night-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isWorkerAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {isWorkerAvailable ? 'Ready for Tasks' : 'Off-Duty / Paused'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleWorkerAvailability}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isWorkerAvailable ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-night-700'
                  }`}
                  aria-label="Toggle task availability"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isWorkerAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {isWorkerAvailable 
                  ? 'You are visible for nearby rescue and care tasks.' 
                  : 'No dispatch notifications will be sent.'}
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-forest-50 text-forest-800 dark:bg-forest-950/60 dark:text-forest-200 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sage-100/50 dark:hover:bg-night-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile & simulated earnings summary */}
          <div className="pt-4 border-t border-sage-200/80 dark:border-night-700 space-y-3">
            <Link
              to="/worker/earnings"
              className="block p-3 rounded-xl bg-gold-50/70 dark:bg-gold-950/20 border border-gold-200 dark:border-gold-800 hover:border-gold-400 transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-gold-900 dark:text-gold-200">
                <span className="font-medium">Available (Simulated)</span>
                <span className="font-bold text-sm text-gold-700 dark:text-gold-400">₹2,450</span>
              </div>
              <p className="text-[10px] text-gold-800/70 dark:text-gold-400/70 mt-1">
                + ₹750 pending task review
              </p>
            </Link>

            <div className="flex items-center justify-between p-2 rounded-xl bg-sage-50 dark:bg-night-800 border border-sage-200 dark:border-night-700">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-forest-500/20 shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="truncate">{user.badge || 'Certified Handler'}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-night-750 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-400">Light / Dark</span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top header on tablet/mobile */}
          <header className={`bg-white/80 dark:bg-night-850/80 backdrop-blur-md border-b border-sage-200/80 dark:border-night-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky ${isDemo ? 'top-8' : 'top-0'} z-30 transition-all`}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sage-100 dark:hover:bg-night-800"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Worker Console</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isWorkerAvailable 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-700 dark:bg-night-700 dark:text-slate-300'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isWorkerAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isWorkerAvailable ? 'Active' : 'Paused'}
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Browse tasks, log emergency assistance, and track simulated earnings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Availability quick switch */}
              <button
                onClick={toggleWorkerAvailability}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isWorkerAvailable
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-night-700 dark:border-night-600 dark:text-slate-300'
                }`}
                title="Toggle Task Availability"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isWorkerAvailable ? 'Online & Available' : 'Go Online'}</span>
              </button>

              <Link
                to="/worker/earnings"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800 text-xs font-bold text-gold-900 dark:text-gold-200"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>₹2,450 (Simulated)</span>
              </Link>

              <button
                onClick={toggleNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-sage-100/80 hover:bg-sage-200/80 dark:text-slate-300 dark:hover:text-white dark:bg-night-800 dark:hover:bg-night-700 border border-sage-200/80 dark:border-night-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              <LanguageSelector />
              <ThemeToggle className="lg:hidden" />
            </div>
          </header>

          {/* Main Worker Page Slot */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-xs bg-white dark:bg-night-850 p-5 flex flex-col justify-between shadow-2xl border-r border-sage-200 dark:border-night-700">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={() => setSidebarOpen(false)} className="block">
                  <SahaayLogo size="sm" />
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Availability */}
              <button
                onClick={toggleWorkerAvailability}
                className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  isWorkerAvailable
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40'
                    : 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-night-700'
                }`}
              >
                <span>Status: {isWorkerAvailable ? 'Online & Available' : 'Off-Duty'}</span>
                <Power className="w-4 h-4" />
              </button>

              <nav className="space-y-1">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-sage-100 dark:hover:bg-night-700"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-sage-200 dark:border-night-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">{user.name}</p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate">{user.title}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-night-750 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationDrawer />
    </div>
  );
};
