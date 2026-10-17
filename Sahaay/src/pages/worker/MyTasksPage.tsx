import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, 
  MapPin, 
  Clock, 
  IndianRupee, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  Briefcase
} from 'lucide-react';

export const MyTasksPage: React.FC = () => {
  const { user, token, isDemo } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'active' | 'review' | 'completed'>('all');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tasks?myTasks=true', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch personal tasks');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setTasks(data);
          } else {
            setTasks([]);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          if (isDemo) {
            setTasks(INITIAL_TASKS.filter(t => t.assignedWorkerId === 'wrk-101'));
          } else {
            setTasks([]);
          }
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, isDemo]);

  const activeCount = tasks.filter(t => ['in_progress', 'In Progress', 'claimed', 'Claimed'].includes(t.status)).length;
  const reviewCount = tasks.filter(t => ['submitted_for_review', 'Under Review'].includes(t.status)).length;
  const completedCount = tasks.filter(t => ['completed', 'Completed'].includes(t.status)).length;

  const filteredTasks = tasks.filter(t => {
    const s = (t.status || '').toLowerCase();
    if (tab === 'active') return s === 'in_progress' || s === 'claimed' || s === 'in progress';
    if (tab === 'review') return s === 'submitted_for_review' || s === 'under review' || s === 'under_review';
    if (tab === 'completed') return s === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Worker Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            My Tasks & Field History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isDemo
              ? 'Viewing Rahul Verma\'s demonstration task roster and verified photo proof history.'
              : `Active assignments for ${user.name} (${user.email}) stored in SQLite.`}
          </p>
        </div>

        <Link to="/worker/tasks">
          <Button variant="primary" size="sm">
            <span>Browse Available Tasks</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-sage-200 dark:border-night-700 space-x-4 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setTab('all')}
          className={`pb-3 border-b-2 transition-colors ${
            tab === 'all'
              ? 'border-forest-600 text-forest-800 dark:border-forest-400 dark:text-forest-200'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          All My Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setTab('active')}
          className={`pb-3 border-b-2 transition-colors ${
            tab === 'active'
              ? 'border-forest-600 text-forest-800 dark:border-forest-400 dark:text-forest-200'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Active / In Progress ({activeCount})
        </button>

        <button
          onClick={() => setTab('review')}
          className={`pb-3 border-b-2 transition-colors ${
            tab === 'review'
              ? 'border-forest-600 text-forest-800 dark:border-forest-400 dark:text-forest-200'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Under Review ({reviewCount})
        </button>

        <button
          onClick={() => setTab('completed')}
          className={`pb-3 border-b-2 transition-colors ${
            tab === 'completed'
              ? 'border-forest-600 text-forest-800 dark:border-forest-400 dark:text-forest-200'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Task List */}
      {isLoading ? (
        <Card className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
          <span>Retrieving your worker assignments from SQLite...</span>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? "You haven't claimed any tasks yet" : "No tasks in this category"}
          description={
            tasks.length === 0
              ? "Browse available tasks in your locality to claim community welfare requests and earn stipends."
              : "Check other tabs to review your field history."
          }
          icon={<CheckSquare className="w-8 h-8" />}
          actionText="Browse Available Tasks"
          onAction={() => {
            window.location.href = '/worker/tasks';
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const s = (task.status || '').toLowerCase();
            const isCompleted = s === 'completed';
            const isReview = s === 'submitted_for_review' || s === 'under review' || s === 'under_review';
            const isActive = s === 'in_progress' || s === 'in progress' || s === 'claimed';
            const addr = typeof task.location === 'object' && task.location?.address ? task.location.address : task.address || '';
            const payout = task.proposedPayment || task.proposed_payment || 400;
            const tracking = task.trackingNumber || task.tracking_number;

            return (
              <Card key={task.id} hover className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                        {tracking}
                      </span>
                      <UrgencyBadge urgency={task.urgency || 'medium'} size="sm" />
                      <SafetyClearanceBadge clearance={task.safetyClearance || task.safety_clearance || 'community_safe'} size="sm" />

                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                          Active In Progress
                        </span>
                      )}
                      {isReview && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-xs font-bold">
                          Proof Under Review
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Payout Disbursed (Simulated)</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{addr}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-sage-100 dark:border-night-700 shrink-0 gap-2">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">Proposed Stipend</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        ₹{payout}
                      </span>
                    </div>

                    <Link to={`/worker/tasks/${task.id}`}>
                      <Button variant={isActive ? 'gold' : 'outline'} size="sm">
                        <span>{isActive ? 'Submit Completion Proof' : 'View Details'}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
