import React, { useState } from 'react';
import { INITIAL_WORKERS } from '../../data/mockWorkers';
import { WorkerProfile } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { 
  Users, 
  ShieldCheck, 
  Award, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  GraduationCap,
  Eye,
  Search
} from 'lucide-react';

export const WorkerManagementPage: React.FC = () => {
  const [workers, setWorkers] = useState<WorkerProfile[]>(INITIAL_WORKERS);
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [search, setSearch] = useState('');
  const [tierUpgradeToast, setTierUpgradeToast] = useState<string | null>(null);

  const filtered = workers.filter(w => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!w.name.toLowerCase().includes(q) && !w.city.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleVerifyWorker = (workerId: string) => {
    setWorkers(prev =>
      prev.map(w =>
        w.id === workerId
          ? { ...w, verificationStatus: 'verified', safetyTier: 'Certified Animal Handler' }
          : w
      )
    );
    setSelectedWorker(null);
    setTierUpgradeToast(`Worker upgraded to Certified Animal Handler!`);
    setTimeout(() => setTierUpgradeToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Field Force Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Community Worker Roster & Accreditation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verify responder training modules, manage active duty availability, and audit field ratings
          </p>
        </div>
      </div>

      {tierUpgradeToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{tierUpgradeToast}</span>
        </div>
      )}

      {/* Search */}
      <div className="p-4 bg-white dark:bg-night-800 rounded-2xl border border-sage-200 dark:border-night-700 shadow-soft">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search workers by name, ward, or qualification..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Workers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(w => (
          <Card key={w.id} hover className="p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={w.avatar}
                    alt={w.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-forest-500/20 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{w.name}</h3>
                    <p className="text-xs text-forest-700 dark:text-forest-400 font-semibold">{w.safetyTier}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{w.city}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    w.availability
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 dark:bg-night-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${w.availability ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {w.availability ? 'Available' : 'Paused'}
                </span>
              </div>

              {/* Stats pill */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Rating</span>
                  <span className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{w.rating}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Tasks</span>
                  <span className="font-bold text-slate-900 dark:text-white">{w.tasksCompleted}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Modules</span>
                  <span className="font-bold text-slate-900 dark:text-white">{w.completedModules.length} / 5</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Simulated Earned: <strong>₹{w.simulatedEarnings.totalLifetime}</strong>
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWorker(w)}
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>Accreditation File</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Worker Accreditation File Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Responder Dossier: ${selectedWorker.name}`}
          subtitle={`Current Tier: ${selectedWorker.safetyTier}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700">
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="space-y-0.5">
                <p className="font-bold text-base text-slate-900 dark:text-white">{selectedWorker.name}</p>
                <p className="text-xs text-slate-500">{selectedWorker.email} • {selectedWorker.phone}</p>
                <p className="text-xs text-forest-700 dark:text-forest-400 font-semibold">{selectedWorker.city}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                Completed Safety Modules
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {selectedWorker.completedModules.map((m, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedWorker.verificationStatus === 'pending' && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs">
                Worker has submitted first contact safety test and is awaiting coordinator interview.
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-sage-100 dark:border-night-700">
              <Button variant="outline" size="sm" onClick={() => setSelectedWorker(null)}>
                Close
              </Button>
              {selectedWorker.verificationStatus === 'pending' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleVerifyWorker(selectedWorker.id)}
                >
                  <Award className="w-3.5 h-3.5 mr-1" />
                  <span>Verify as Tier 2 Handler</span>
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
