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
  PlusCircle, 
  FileText, 
  HelpCircle, 
  MapPin, 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  UserCheck,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const CitizenLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toggleNotifications, unreadCount } = useNotifications();
  const { user, logout, isDemo } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Citizen Dashboard', path: '/citizen', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Report an Animal', path: '/citizen/report', icon: <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> },
    { label: 'My Reports', path: '/citizen/reports', icon: <FileText className="w-4 h-4" /> },
    { label: 'Assisted Reporting / Hotline', path: '/citizen/assisted-help', icon: <HelpCircle className="w-4 h-4" /> },
    { label: 'Live Incident Map', path: '/org/map', icon: <MapPin className="w-4 h-4" /> },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

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
              <span className="block text-[10px] font-bold uppercase tracking-wider text-forest-700 dark:text-forest-400 pl-1">
                Citizen Portal
              </span>
            </div>

            {/* Quick Action Report Button */}
            <Link
              to="/citizen/report"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-semibold text-sm shadow-md transition-all hover:shadow-lg"
            >
              <PlusCircle className="w-4 h-4 text-gold-300" />
              <span>Report Animal Issue</span>
            </Link>

            {/* Navigation items */}
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

          {/* User info card at bottom */}
          <div className="pt-4 border-t border-sage-200/80 dark:border-night-700 space-y-3">
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
                  <p className="text-[11px] text-forest-700 dark:text-forest-400 truncate">
                    {user.badge || 'Citizen Reporter'}
                  </p>
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

        {/* Content Area */}
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
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  Citizen Services
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Report, monitor, and assist community street animals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/citizen/report"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Report Issue</span>
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

          {/* Main Citizen Page Slot */}
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

              <Link
                to="/citizen/report"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-forest-700 text-white rounded-xl font-semibold text-sm"
              >
                <PlusCircle className="w-4 h-4 text-gold-300" />
                <span>Report Animal Issue</span>
              </Link>

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
                  <p className="text-[11px] text-forest-700 dark:text-forest-400 truncate">{user.title}</p>
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
