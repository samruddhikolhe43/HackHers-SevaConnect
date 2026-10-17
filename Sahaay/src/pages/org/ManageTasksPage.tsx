import React, { useState, useEffect } from 'react';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { INITIAL_WORKERS } from '../../data/mockWorkers';
import { Task, SafetyClearance } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardList, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  IndianRupee, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  Send,
  Loader2
} from 'lucide-react';

export const ManageTasksPage: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [workers, setWorkers] = useState<any[]>(INITIAL_WORKERS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'dog' | 'cat' | 'cattle' | 'bird'>('dog');
  const [proposedPayment, setProposedPayment] = useState(350);
  const [safetyClearance, setSafetyClearance] = useState<SafetyClearance>('community_safe');
  const [assignedWorkerId, setAssignedWorkerId] = useState('wrk-101');
  const [address, setAddress] = useState('Lane 4, Near Balewadi High Street, Pune');
  const [description, setDescription] = useState('');
  const [instructionsText, setInstructionsText] = useState('1. Inspect animal from safe distance\n2. Provide clean drinking water\n3. Take 2 clear verification photos');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tasks', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        }
      })
      .catch(() => {});

    fetch('/api/workers', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWorkers(data);
          if (data[0]?.id) setAssignedWorkerId(data[0].id);
        }
      })
      .catch(() => {});
  }, [token]);

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const addr = typeof t.location === 'object' && t.location?.address ? t.location.address : (t as any).address || '';
      if (!t.title.toLowerCase().includes(q) && !(t.trackingNumber || '').toLowerCase().includes(q) && !addr.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const selectedWorker = workers.find(w => w.id === assignedWorkerId);

    try {
      const payload = {
        title,
        category,
        urgency: 'medium',
        safetyClearance,
        proposedPayment,
        assignedWorkerId: assignedWorkerId || undefined,
        assignedWorkerName: selectedWorker?.name || undefined,
        address,
        city: 'Pune',
        description,
        instructions: instructionsText.split('\n').filter(Boolean),
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to dispatch task');
      }

      const data = await res.json();
      setTasks(prev => [data.task, ...prev]);
      setCreateModalOpen(false);
      setSuccessToast(`Task "${title}" dispatched successfully to ${selectedWorker?.name || 'Worker'}!`);
      setTitle('');
      setDescription('');
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.warn('Backend task create fallback:', err);
      const newTask: Task = {
        id: `tsk-${Math.floor(300 + Math.random() * 600)}`,
        reportId: 'rep-001',
        trackingNumber: `SHY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        category,
        urgency: 'medium',
        status: assignedWorkerId ? 'claimed' : 'available',
        safetyClearance,
        location: {
          address,
          city: 'Pune',
          lat: 18.5590,
          lng: 73.7868,
        },
        description,
        instructions: instructionsText.split('\n').filter(Boolean),
        proposedPayment,
        paymentStatus: 'pending',
        estimatedHours: 1.5,
        assignedWorkerId: selectedWorker?.id,
        assignedWorkerName: selectedWorker?.name,
        createdAt: 'Just now',
      };

      setTasks(prev => [newTask, ...prev]);
      setCreateModalOpen(false);
      setSuccessToast(`Task "${title}" dispatched locally!`);
      setTitle('');
      setDescription('');
      setTimeout(() => setSuccessToast(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Dispatch Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Manage Tasks & Assign Workers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Create field tasks, set simulated compensation rates, and assign authorized responders
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setCreateModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          <span>+ Create & Dispatch Task</span>
        </Button>
      </div>

      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-night-800 rounded-2xl border border-sage-200 dark:border-night-700 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks by title, tracking number, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 text-xs sm:text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
        >
          <option value="all">All Task Statuses ({tasks.length})</option>
          <option value="available">Available (Unassigned)</option>
          <option value="claimed">Claimed</option>
          <option value="in_progress">In Progress</option>
          <option value="submitted_for_review">Under Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tasks Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Task Tracking</th>
                <th className="p-4">Task Title & Location</th>
                <th className="p-4">Safety Tier</th>
                <th className="p-4">Assigned Worker</th>
                <th className="p-4">Simulated Stipend</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-sage-50/40 dark:hover:bg-night-750/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-forest-700 dark:text-forest-400 whitespace-nowrap">
                    {task.trackingNumber}
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{task.title}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{typeof task.location === 'object' && task.location?.address ? task.location.address : (task as any).address || 'Pune Area'}</span>
                    </p>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <SafetyClearanceBadge clearance={task.safetyClearance} size="sm" />
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {task.assignedWorkerName ? (
                      <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-forest-600" />
                        <span>{task.assignedWorkerName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Open / Unclaimed</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    ₹{task.proposedPayment}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full bg-sage-100 text-slate-800 dark:bg-night-700 dark:text-slate-200 text-xs font-semibold capitalize">
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create & Dispatch New Field Task"
        subtitle="Broadcast task to nearby registered community workers"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Stray dog limb dressing & hydration transport"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Species Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="cattle">Cattle</option>
                <option value="bird">Bird</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Required Safety Clearance *
              </label>
              <select
                value={safetyClearance}
                onChange={e => setSafetyClearance(e.target.value as SafetyClearance)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              >
                <option value="community_safe">Community Safe (Feeding/Census)</option>
                <option value="trained_only">Certified Handler Only (Injured transport)</option>
                <option value="vet_escort_required">Vet Escort Required</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proposed Stipend Amount (INR - Simulated) *
              </label>
              <input
                type="number"
                value={proposedPayment}
                onChange={e => setProposedPayment(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
                min={150}
                max={2000}
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assign Directly to Worker
              </label>
              <select
                value={assignedWorkerId}
                onChange={e => setAssignedWorkerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.safetyTier || 'Basic Community Responder'} - {w.isAvailable ?? w.availability ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Field Location Address
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Brief & Description *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="State what needs to be done..."
              className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-sage-100 dark:border-night-700">
            <Button variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{isSubmitting ? 'Dispatching...' : 'Broadcast & Dispatch'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
