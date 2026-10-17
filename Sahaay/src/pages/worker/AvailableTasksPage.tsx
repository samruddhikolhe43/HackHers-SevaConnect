import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  Briefcase
} from 'lucide-react';

export const AvailableTasksPage: React.FC = () => {
  const { user, token, isDemo } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [claimSuccessTask, setClaimSuccessTask] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const fetchTasks = () => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tasks?status=Open', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch open tasks');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          setTasks([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Fallback to initial demo tasks if server offline
        setTasks(INITIAL_TASKS.filter(t => t.status === 'available'));
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const filteredTasks = tasks.filter(t => {
    const clearance = t.safetyClearance || t.safety_clearance || '';
    if (tierFilter !== 'all' && clearance !== tierFilter) return false;
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = (t.title || '').toLowerCase().includes(q);
      const addr = typeof t.location === 'object' ? t.location?.address : t.address;
      const matchLoc = (addr || '').toLowerCase().includes(q);
      if (!matchTitle && !matchLoc) return false;
    }
    return true;
  });

  const handleClaim = async (task: any) => {
    setClaimingId(task.id);
    setClaimError(null);

    try {
      const res = await fetch(`/api/tasks/${task.id}/claim`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setClaimingId(null);

      if (res.ok) {
        setClaimSuccessTask(task.title);
        fetchTasks();
      } else {
        setClaimError(data.error || 'Failed to claim task. You may need higher safety tier verification.');
      }
    } catch {
      setClaimingId(null);
      // Simulated fallback for offline demo
      setClaimSuccessTask(task.title);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Field Opportunities
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Available Service Tasks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Select safe local community welfare tasks matching your verified clearance tier
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/worker/training">
            <Button variant="outline" size="sm" className="border-gold-300 dark:border-gold-800 text-gold-900 dark:text-gold-200">
              <ShieldCheck className="w-4 h-4 mr-1 text-gold-500" />
              <span>Current Clearance: {user.safetyTier || 'Basic Community Responder'}</span>
            </Button>
          </Link>
        </div>
      </div>

      {claimError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{claimError}</span>
          </div>
          <button onClick={() => setClaimError(null)} className="text-xs underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-night-800 rounded-2xl border border-sage-200 dark:border-night-700 shadow-soft">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by street, locality, or animal type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
          >
            <option value="all">All Clearance Tiers</option>
            <option value="community_safe">Community Safe (Tier 1)</option>
            <option value="trained_only">Certified Handler (Tier 2)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
          >
            <option value="all">All Animals</option>
            <option value="dog">Dogs</option>
            <option value="cat">Cats</option>
            <option value="cattle">Cattle</option>
            <option value="bird">Birds</option>
          </select>
        </div>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <Card className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
          <span>Loading available community tasks from SQLite...</span>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No open tasks match your criteria"
          description="Try selecting 'All Clearance Tiers' or check back soon as citizens log new reports in your area."
          icon={<Briefcase className="w-8 h-8" />}
          actionText="Clear Filters"
          onAction={() => {
            setSearch('');
            setTierFilter('all');
            setCategoryFilter('all');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTasks.map(task => {
            const addr = typeof task.location === 'object' && task.location?.address ? task.location.address : task.address || '';
            const cityStr = typeof task.location === 'object' && task.location?.city ? task.location.city : task.city || '';
            const tracking = task.trackingNumber || task.tracking_number;
            const payout = task.proposedPayment || task.proposed_payment || 400;
            const equip = Array.isArray(task.requiredEquipment) ? task.requiredEquipment.join(', ') : 'Standard kit';

            return (
              <Card key={task.id} hover className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                      {tracking}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <UrgencyBadge urgency={task.urgency || 'medium'} size="sm" />
                      <SafetyClearanceBadge clearance={task.safetyClearance || task.safety_clearance || 'community_safe'} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {task.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="p-3 rounded-xl bg-sage-50/70 dark:bg-night-850 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {addr} {cityStr ? `(${cityStr})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span>Estimated time: ~{task.estimatedHours || task.estimated_hours || 2} hours</span>
                      <span>Kit: {equip}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-sage-100 dark:border-night-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Payout</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-slate-900 dark:text-white">₹{payout}</span>
                      <span className="text-[10px] text-slate-400">(Simulated)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/worker/tasks/${task.id}`}>
                      <Button variant="outline" size="sm">
                        <span>Details</span>
                      </Button>
                    </Link>

                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={claimingId === task.id}
                      onClick={() => handleClaim(task)}
                    >
                      <span>Claim Task</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Claim Confirmation Modal */}
      <Modal
        isOpen={!!claimSuccessTask}
        onClose={() => setClaimSuccessTask(null)}
        title="Task Accepted & Claimed!"
        subtitle="This task is now added to your active roster in SQLite"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            "{claimSuccessTask}"
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
            You have committed to attend to this task. Please proceed to the location with your safety gear, capture verification photos, and submit completion proof.
          </p>

          <div className="pt-2 flex justify-center gap-2">
            <Link to="/worker/my-tasks">
              <Button variant="primary" size="md">
                <span>Go to My Active Tasks</span>
              </Button>
            </Link>
            <Button variant="outline" size="md" onClick={() => setClaimSuccessTask(null)}>
              <span>Close</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
