import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, ChevronRight, X } from 'lucide-react';
import { Button } from './Button';

interface SafetyNoticeBannerProps {
  type?: 'general' | 'critical' | 'worker-guidance';
  dismissible?: boolean;
}

export const SafetyNoticeBanner: React.FC<SafetyNoticeBannerProps> = ({
  type = 'general',
  dismissible = false,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  if (dismissed) return null;

  if (type === 'critical') {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 text-rose-900 dark:text-rose-200 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/80 rounded-xl text-rose-700 dark:text-rose-300 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm sm:text-base text-rose-950 dark:text-rose-100">
                Critical Safety Protocol: Do Not Approach Dangerous or Rabid Animals
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 uppercase">
                Zero Touch Red-Line
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
              If an animal displays disorientation, frothing, unprovoked aggression, or severe vehicle trauma, 
              <strong> untrained workers and citizens must strictly stay 30+ feet away</strong>. 
              Do not attempt capture or veterinary diagnosis. Call municipal animal rescue immediately.
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <a
                href="tel:1962"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Emergency Toll-Free 1962</span>
              </a>
              <span className="text-xs text-rose-700 dark:text-rose-400">
                Municipal Veterinary Rapid Ambulance Dispatch
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'worker-guidance') {
    return (
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-800 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Worker Scope of Service Boundary
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              Ordinary community tasks include feeding, welfare checks, hydration, and safe shelter transport. 
              Medical diagnoses and invasive veterinary interventions must only be carried out under certified supervision.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sage-100/70 dark:bg-night-800 border border-sage-200 dark:border-night-700 rounded-2xl p-4 text-slate-800 dark:text-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-forest-100 dark:bg-forest-900/50 rounded-lg text-forest-700 dark:text-forest-300 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
              Sahaay Safety & Escalation Charter
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              We connect compassionate citizens with trained community helpers. Urgent and dangerous cases are routed directly to accredited NGOs and municipal veterinarians.
            </p>
          </div>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
