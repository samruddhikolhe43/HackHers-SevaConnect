import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  CheckSquare, 
  IndianRupee, 
  Power, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Award,
  Loader2
} from 'lucide-react';
import { SafetyNoticeBanner } from '../../components/common/SafetyNoticeBanner';

export const WorkerDashboard: React.FC = () => {
  const { user, token, isDemo, isWorkerAvailable, toggleWorkerAvailability } = useAuth();
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    Promise.all([
      fetch('/api/tasks?status=Open', { headers }).then(r => r.json()).catch(() => []),
      fetch('/api/tasks?myTasks=true', { headers }).then(r => r.json()).catch(() => []),
      fetch('/api/workers/me', { headers }).then(r => r.json()).catch(() => null),
    ]).then(([openTasks, personalTasks, profile]) => {
      if (isMounted) {
        if (Array.isArray(openTasks)) {
          setAvailableTasks(openTasks);
        } else {
          setAvailableTasks([]);
        }

        if (Array.isArray(personalTasks)) {
          setMyTasks(personalTasks);
        } else {
          setMyTasks([]);
        }

        if (profile && profile.id) {
          setWorkerProfile(profile);
        }

        setIsLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        if (isDemo) {
          setAvailableTasks(INITIAL_TASKS.filter(t => t.status === 'available'));
          setMyTasks(INITIAL_TASKS.filter(t => t.assignedWorkerId === 'wrk-101'));
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [token, isDemo]);

  const activeTask = myTasks.find(t => {
    const s = (t.status || '').toLowerCase();
    return s === 'in_progress' || s === 'in progress' || s === 'claimed';
  });

  const simulatedBalance = workerProfile?.simulatedBalance ?? (isDemo ? 2450 : 0);
  const rating = workerProfile?.rating ?? (isDemo ? 4.92 : 5.0);
  const tasksCompletedCount = workerProfile?.tasksCompleted ?? (isDemo ? 38 : myTasks.filter(t => (t.status || '').toLowerCase() === 'completed').length);

  return (
    <div className="space-y-8">
      {/* Top Banner with Availability Switch */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all shadow-md ${
        isWorkerAvailable
          ? 'bg-gradient-to-r from-forest-800 to-forest-900 border-forest-700 text-white'
          : 'bg-white dark:bg-night-800 border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-100'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isWorkerAvailable ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${isWorkerAvailable ? 'text-gold-300' : 'text-slate-500'}`}>
                {isWorkerAvailable ? 'Duty Status: Online & Accepting Tasks' : 'Duty Status: Off-Duty / Paused'}
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isWorkerAvailable ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Hello, {user.name}
            </h2>
            <p className={`text-xs sm:text-sm max-w-xl ${isWorkerAvailable ? 'text-forest-200' : 'text-slate-500 dark:text-slate-400'}`}>
              {isDemo ? (
                'You are inspecting Rahul Verma\'s demonstration console in Nagpur & Pune hubs.'
              ) : isWorkerAvailable ? (
                `Your service beacon is active in ${user.city || 'your registered area'}. Open tasks are broadcast to your account.`
              ) : (
                'You are currently paused. Switch online whenever you have spare hours to receive task dispatches.'
              )}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={toggleWorkerAvailability}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all ${
                isWorkerAvailable
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 ring-2 ring-emerald-300'
                  : 'bg-forest-700 hover:bg-forest-800 text-white'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isWorkerAvailable ? 'Go Off-Duty' : 'Go Online & Available'}</span>
            </button>
          </div>
        </div>
      </div>

      <SafetyNoticeBanner type="worker-guidance" />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Open Tasks Nearby"
          value={String(availableTasks.length)}
          subtitle={user.city ? `Open in ${user.city} network` : "Broadcast in network"}
          icon={<Briefcase className="w-6 h-6" />}
          colorScheme="forest"
        />
        <StatCard
          title="Active Tasks Claimed"
          value={String(myTasks.filter(t => ['in_progress', 'In Progress', 'claimed'].includes(t.status)).length)}
          subtitle={activeTask ? 'Currently assigned to you' : 'No active assignment'}
          icon={<CheckSquare className="w-6 h-6" />}
          colorScheme="gold"
          trend={{ value: activeTask ? 'Action required' : 'Ready to claim', isPositive: true }}
        />
        <StatCard
          title="Simulated Balance"
          value={`₹${simulatedBalance}`}
          subtitle="Simulated earnings ledger"
          isSimulated
          icon={<IndianRupee className="w-6 h-6" />}
          colorScheme="mint"
        />
        <StatCard
          title="Verified Safety Rating"
          value={`${rating} ★`}
          subtitle={`${tasksCompletedCount} verified rescues`}
          icon={<Award className="w-6 h-6" />}
          colorScheme="slate"
        />
      </div>

      {/* Active Task Highlight (if any) */}
      {activeTask && (
        <Card className="p-6 border-l-4 border-l-gold-500 bg-gold-50/30 dark:bg-night-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-gold-100 dark:bg-gold-950 text-gold-800 dark:text-gold-300 font-bold text-xs">
                  CURRENT ACTIVE TASK
                </span>
                <UrgencyBadge urgency={activeTask.urgency || 'medium'} size="sm" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {activeTask.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                <span>
                  {typeof activeTask.location === 'object' && activeTask.location?.address
                    ? activeTask.location.address
                    : activeTask.address || ''}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-slate-400 block">Proposed Stipend</span>
                <span className="text-lg font-black text-gold-700 dark:text-gold-400">
                  ₹{activeTask.proposedPayment || activeTask.proposed_payment || 400}
                </span>
              </div>
              <Link to={`/worker/tasks/${activeTask.id}`}>
                <Button variant="gold" size="md">
                  <span>Update Progress / Upload Proof</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Next Step Guidance: Training & Safety */}
      <Card className="p-6 bg-forest-50/50 dark:bg-night-850 border border-forest-200 dark:border-forest-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-forest-600 dark:text-forest-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Safety Tier Verification & Qualification
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              Current safety tier: <strong>{user.safetyTier || 'Basic Community Responder'}</strong>.
              Passing the community safety modules qualifies you for Tier 2 handling tasks. Verification status is audited separately by welfare coordinators.
            </p>
          </div>

          <Link to="/worker/training" className="shrink-0">
            <Button variant="primary" size="sm">
              <span>View Training Modules</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
