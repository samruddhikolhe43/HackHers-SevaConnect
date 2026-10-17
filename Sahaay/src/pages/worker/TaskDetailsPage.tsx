import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  AlertTriangle, 
  Wrench, 
  Camera, 
  Upload, 
  X,
  FileCheck
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const TaskDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [task, setTask] = useState<any>(() => INITIAL_TASKS.find(t => t.id === id) || INITIAL_TASKS[0]);
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [submittedForReview, setSubmittedForReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/tasks/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.id) {
          setTask(data);
          if (data.completionProofPhotos && data.completionProofPhotos.length > 0) {
            setProofPhoto(data.completionProofPhotos[0]);
          }
          if (data.status === 'Under Review' || data.status === 'Completed') {
            setSubmittedForReview(true);
          }
        }
      })
      .catch(() => {});
  }, [id]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('notes', notes || 'Completed on-site care and verification.');
      if (proofFile) {
        formData.append('proofPhotos', proofFile);
      } else if (proofPhoto) {
        formData.append('proofUrls', JSON.stringify([proofPhoto]));
      }

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/tasks/${task.id}/submit-proof`, {
        method: 'PATCH',
        headers,
        body: formData,
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok) {
        setSubmittedForReview(true);
      } else {
        setErrorMessage(data.error || 'Failed to submit proof.');
      }
    } catch {
      setIsSubmitting(false);
      setSubmittedForReview(true); // Offline fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/worker/tasks"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-forest-700 dark:text-forest-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
        <span className="text-xs text-slate-400">
          Tracking: <strong className="font-mono text-slate-800 dark:text-slate-200">{task.trackingNumber}</strong>
        </span>
      </div>

      {/* Main Task Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-950 dark:text-forest-300">
              {task.trackingNumber}
            </span>
            <UrgencyBadge urgency={task.urgency} />
            <SafetyClearanceBadge clearance={task.safetyClearance} />
          </div>

          <div className="p-2.5 rounded-xl bg-gold-50 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-gold-600 dark:text-gold-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Stipend Rate</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ₹{task.proposedPayment}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium ml-1">(Simulated)</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {task.title}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-sage-50/50 dark:bg-night-850 p-4 rounded-2xl border border-sage-200/80 dark:border-night-700">
          {task.description}
        </p>

        {/* Location & Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Location */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-forest-600" />
              <span>Location Details</span>
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">{task.location.address}</p>
              <p className="text-slate-500">City: {task.location.city}</p>
              <p className="text-[11px] font-mono text-slate-400 pt-1">
                GPS: {task.location.lat.toFixed(4)}° N, {task.location.lng.toFixed(4)}° E (Simulated)
              </p>
            </div>

            {/* Equipment Checklist */}
            <div className="space-y-2 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-forest-600" />
                <span>Required Equipment Checklist</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {task.requiredEquipment?.map((eq: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{eq}</span>
                  </li>
                )) || <li>Standard community welfare carrier and water</li>}
              </ul>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-forest-600" />
              <span>Step-by-Step Field Protocol</span>
            </h4>
            <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              {task.instructions?.map((inst: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-forest-100 dark:bg-forest-950 text-forest-700 dark:text-forest-300 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{inst}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Card>

      {/* Completion Proof Form (Only active if task is claimed or in_progress) */}
      <Card className="p-6 sm:p-8 space-y-5 border-forest-200 dark:border-forest-900">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-forest-600" />
            <span>Task Completion Proof Submission</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload clear photographic proof of animal assistance or shelter hand-over to trigger simulated stipend verification.
          </p>
        </div>

        {submittedForReview ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
              Submitted for Review!
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-sm mx-auto">
              Your photo proof has been queued for coordinator verification. Upon approval, ₹{task.proposedPayment} will be credited to your simulated account.
            </p>
            <div className="pt-2">
              <Link to="/worker/my-tasks">
                <Button variant="primary" size="sm">
                  <span>Return to My Tasks</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitProof} className="space-y-4">
            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Verification Photo *
              </label>

              {proofPhoto ? (
                <div className="relative rounded-2xl overflow-hidden border border-sage-200 dark:border-night-700 h-52 bg-slate-100">
                  <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProofPhoto(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/70 text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-sage-300 dark:border-night-600 rounded-2xl p-6 hover:bg-sage-50/50 cursor-pointer">
                  <Camera className="w-8 h-8 text-forest-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload on-site verification photo
                  </span>
                  <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Field Completion Notes
              </label>
              <textarea
                rows={3}
                placeholder="Detail what was done (e.g. fresh water provided, wound inspected, transported to foster volunteer Sunil)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
              />
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
              <span>Submit Proof for Coordinator Verification</span>
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
