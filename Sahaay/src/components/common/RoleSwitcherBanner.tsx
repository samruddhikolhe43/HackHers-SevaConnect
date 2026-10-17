import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { User, Wrench, Building2, Sparkles, LogOut } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { role, isDemo, switchRole, user, logout } = useAuth();
  const navigate = useNavigate();

  // If this is a real user or public visitor, do not show persistent demo banner
  if (!isDemo || role === 'public') {
    return null;
  }

  const handleRoleSelect = (targetRole: UserRole, targetPath: string) => {
    switchRole(targetRole);
    navigate(targetPath);
  };

  const roles: { id: UserRole; label: string; path: string; icon: React.ReactNode }[] = [
    { id: 'citizen', label: 'Citizen (Priya)', path: '/citizen', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'worker', label: 'Worker (Rahul)', path: '/worker', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'organisation', label: 'Organisation (Sahaay)', path: '/org', icon: <Building2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside
      aria-label="Demo mode indicator banner"
      className="bg-amber-950 text-amber-100 text-xs px-3 sm:px-4 py-1.5 border-b border-amber-800/80 sticky top-0 z-50 shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px] bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-700/60">
            <Sparkles className="w-3 h-3 text-gold-400" />
            <span>DEMO MODE ACTIVE</span>
          </span>
          <span className="text-amber-200 text-[11px] hidden sm:inline">
            Viewing isolated sample records as <strong>{user.name}</strong> ({user.title})
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-amber-300/80 text-[11px] hidden md:inline">Demo Persona:</span>
          {roles.map(r => {
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id, r.path)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-amber-900/40 text-amber-200 hover:text-white hover:bg-amber-800/60'
                }`}
                title={`Switch demo persona to ${r.label}`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/50 transition-colors ml-1"
            title="Exit Demo Mode"
          >
            <LogOut className="w-3 h-3" />
            <span>Exit Demo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
