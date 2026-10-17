import React, { useState, useEffect } from 'react';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  UserCheck, 
  IndianRupee, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export const ReviewCompletionPage: React.FC = () => {
  const { token, isDemo } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [approvedSuccessMessage, setApprovedSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTasks = () => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/tasks', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Show tasks that are under review or completed
          const relevant = data.filter(t => {
            const s = (t.status || '').toLowerCase();
            return s.includes('review') || s === 'completed';
          });
          setTasks(relevant);
        } else {
          setTasks([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setTasks(INITIAL_TASKS.filter(t => t.status === 'submitted_for_review' || t.status === 'completed'));
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleApprove = async (taskId: string) => {
    setIsProcessing(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/tasks/${taskId}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'approve', feedback: 'Verified & approved by organisation coordinator.' }),
      });

      setIsProcessing(false);
      if (res.ok) {
        setSelectedTask(null);
        setApprovedSuccessMessage('Task proof approved! Simulated payout release queued and report resolved in SQLite.');
        fetchTasks();
        setTimeout(() => setApprovedSuccessMessage(null), 4000);
      }
    } catch {
      setIsProcessing(false);
      setSelectedTask(null);
      setApprovedSuccessMessage('Task proof approved (Offline demo mode).');
    }
  };

  const handleReject = async (taskId: string) => {
    setIsProcessing(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/tasks/${taskId}/review`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'reject', feedback: 'Additional proof or clearer photo requested.' }),
      });

      setIsProcessing(false);
      if (res.ok) {
        setSelectedTask(null);
        setApprovedSuccessMessage('Clarification requested. Task returned to In Progress for worker resubmission.');
        fetchTasks();
        setTimeout(() => setApprovedSuccessMessage(null), 4000);
      }
    } catch {
      setIsProcessing(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Verification & Quality Control
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Review Field Task Completion
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Inspect worker photographic evidence and field notes before releasing simulated compensation
        </p>
      </div>

      {approvedSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{approvedSuccessMessage}</span>
        </div>
      )}

      {/* Review Queue Cards */}
      {isLoading ? (
        <Card className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
          <span>Retrieving completion queue from SQLite...</span>
        </Card>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks pending review"
          description="When community workers attend to dispatches and upload completion proof, they will appear here for verification."
          icon={<CheckCircle2 className="w-8 h-8" />}
          actionText="Refresh Queue"
          onAction={fetchTasks}
        />
      ) : (
        <div className="space-y-4">
          {tasks.map(task => {
            const s = (task.status || '').toLowerCase();
            const isPending = s.includes('review') || s === 'submitted_for_review';
            const photos = Array.isArray(task.completionProofPhotos) ? task.completionProofPhotos : [];
            const proofImg = photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';
            const tracking = task.trackingNumber || task.tracking_number;
            const payout = task.proposedPayment || task.proposed_payment || 400;

            return (
              <Card key={task.id} hover className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Photo thumbnail */}
                    <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-night-700 shrink-0 border border-sage-200 dark:border-night-700">
                      <img
                        src={proofImg}
                        alt="Proof"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                          {tracking}
                        </span>
                        <UrgencyBadge urgency={task.urgency || 'medium'} size="sm" />
                        {isPending ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-xs font-bold">
                            Pending Audit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                            Approved & Disbursed
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </h3>

                      <div className="p-2.5 rounded-xl bg-sage-50 dark:bg-night-850 text-xs text-slate-600 dark:text-slate-300">
                        <strong>Worker Note:</strong> {task.completionNotes || task.completion_notes || 'Animal hydration administered and safe hand-over completed.'}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                          <UserCheck className="w-3.5 h-3.5 text-forest-600" />
                          <span>{task.assignedWorkerName || task.assigned_worker_name || 'Assigned Worker'}</span>
                        </span>
                        <span>Stipend: ₹{payout} (Simulated)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-sage-100 dark:border-night-700 shrink-0 gap-2">
                    <Button
                      variant={isPending ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTask(task)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>{isPending ? 'Inspect Proof & Decide' : 'View Audit Record'}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspect & Decision Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Audit Completion Proof: ${selectedTask.trackingNumber || selectedTask.tracking_number}`}
          subtitle={selectedTask.title}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Proof Image */}
            <div className="rounded-2xl overflow-hidden border border-sage-200 dark:border-night-700 max-h-72 bg-slate-100">
              <img
                src={
                  (Array.isArray(selectedTask.completionProofPhotos) && selectedTask.completionProofPhotos[0]) ||
                  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
                }
                alt="Uploaded proof"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Submitted Field Notes:</span>
              <p className="p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedTask.completionNotes || selectedTask.completion_notes || 'On-site care and photo proof completed per safety guidelines.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gold-50 dark:bg-gold-950/30 border border-gold-200 text-gold-900 dark:text-gold-200 flex items-center justify-between text-xs">
              <span>Proposed Worker Stipend:</span>
              <span className="font-black text-sm">
                ₹{selectedTask.proposedPayment || selectedTask.proposed_payment || 400} (Simulated)
              </span>
            </div>

            <div className="pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleReject(selectedTask.id)}
              >
                <XCircle className="w-4 h-4 mr-1 text-rose-600" />
                <span>Request Resubmission</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing}
                onClick={() => handleApprove(selectedTask.id)}
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                <span>Approve & Release Payout</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
