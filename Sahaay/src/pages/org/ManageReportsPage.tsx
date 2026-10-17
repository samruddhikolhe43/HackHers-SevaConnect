import React, { useState, useEffect } from 'react';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { Report, ReportStatus, AnimalCategory, UrgencyLevel } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { 
  Search, 
  Filter, 
  MapPin, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  Send,
  PhoneCall,
  Sparkles,
  Compass,
  FileCheck,
  ShieldCheck,
  Camera,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n/LanguageContext';

export const ManageReportsPage: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');

  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [statusUpdatedSuccess, setStatusUpdatedSuccess] = useState<string | null>(null);

  // Human review form state
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'modified' | 'rejected'>('approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [revisedCategory, setRevisedCategory] = useState<string>('');
  const [revisedUrgency, setRevisedUrgency] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchReports = () => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/reports', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          setReports([]);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setReports(INITIAL_REPORTS);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  useEffect(() => {
    if (selectedReport) {
      setReviewerNotes(selectedReport.humanReviewerNotes || '');
      setRevisedCategory(selectedReport.category || 'dog');
      setRevisedUrgency(selectedReport.urgency?.toLowerCase() || 'medium');
    }
  }, [selectedReport]);

  const filtered = reports.filter(r => {
    const s = (r.status || '').toLowerCase();
    const u = (r.urgency || '').toLowerCase();
    if (statusFilter !== 'all' && s !== statusFilter.toLowerCase()) return false;
    if (urgencyFilter !== 'all' && u !== urgencyFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const track = r.trackingNumber || r.tracking_number || '';
      const matchTrack = track.toLowerCase().includes(q);
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const addr = typeof r.location === 'object' ? r.location?.address : r.address || '';
      const matchLoc = addr.toLowerCase().includes(q);
      if (!matchTrack && !matchTitle && !matchLoc) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: newStatus,
          note: `Marked as ${newStatus} by ${user.name} (${user.role})`,
        }),
      });

      setStatusUpdatedSuccess(`Report status updated to ${newStatus.toUpperCase()}`);
      fetchReports();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
      setTimeout(() => setStatusUpdatedSuccess(null), 3000);
    } catch {
      setStatusUpdatedSuccess(`Status updated to ${newStatus.toUpperCase()}`);
    }
  };

  const handleRecordHumanReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsSubmittingReview(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/reports/${selectedReport.id}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          decision: reviewDecision,
          notes: reviewerNotes.trim(),
          revisedCategory: reviewDecision === 'modified' ? revisedCategory : undefined,
          revisedUrgency: reviewDecision === 'modified' ? revisedUrgency : undefined
        }),
      });

      const data = await res.json();
      setIsSubmittingReview(false);

      if (res.ok) {
        setStatusUpdatedSuccess(`Human review decision recorded: ${reviewDecision.toUpperCase()}`);
        fetchReports();
        if (data.report) setSelectedReport(data.report);
        setTimeout(() => setStatusUpdatedSuccess(null), 3500);
      } else {
        alert(data.error || 'Failed to record human review');
      }
    } catch (err) {
      setIsSubmittingReview(false);
      alert('Could not submit review to backend.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            {t.org.welcome}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t.org.manageReportsTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.org.welcomeSub}
          </p>
        </div>
      </div>

      {statusUpdatedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusUpdatedSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-night-800 rounded-2xl border border-sage-200 dark:border-night-700 shadow-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking number, location, or symptom..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="submitted">Submitted</option>
            <option value="reported">Reported</option>
            <option value="under_review">Under Review</option>
            <option value="task_created">Task Created</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850"
          >
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="needs_review">Needs Review</option>
          </select>
        </div>
      </div>

      {/* Reports Table Card */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Tracking ID</th>
                <th className="p-4">Incident Details</th>
                <th className="p-4">AI Assessment</th>
                <th className="p-4">Location Evidence</th>
                <th className="p-4">Human Review</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              {filtered.map(report => {
                const addressStr = typeof report.location === 'object' ? report.location?.address : report.address || '';
                const locStatus = report.locationConsistencyStatus || 'Location Not Available';
                const revStatus = report.humanReviewStatus || 'pending';

                return (
                  <tr key={report.id} className="hover:bg-sage-50/40 dark:hover:bg-night-750/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-forest-700 dark:text-forest-400 whitespace-nowrap">
                      {report.trackingNumber || report.tracking_number}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{report.title}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{addressStr}</span>
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                            {report.aiCategory || report.category}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({Math.round((report.aiConfidence || 0.8) * 100)}%)
                          </span>
                        </div>
                        <UrgencyBadge urgency={(report.aiUrgency || report.urgency || 'medium').toLowerCase()} size="sm" />
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        locStatus.includes('Consistent') 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : locStatus.includes('Mismatch')
                          ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                      }`}>
                        <Compass className="w-3 h-3" />
                        <span>{locStatus}</span>
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        revStatus === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                          : revStatus === 'modified'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : revStatus === 'rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      }`}>
                        {revStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Inspect & Review</span>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Triage & Human Review Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Triage & Human Review: ${selectedReport.trackingNumber || selectedReport.tracking_number}`}
          subtitle={selectedReport.title}
          maxWidth="lg"
        >
          <div className="space-y-5 text-xs sm:text-sm">
            {/* Top row: Evidence Photo & Description */}
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={(selectedReport.photos && selectedReport.photos[0]) || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'}
                alt="Incident evidence"
                className="w-full sm:w-48 h-36 object-cover rounded-xl border border-sage-200 dark:border-night-700 shrink-0"
              />
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-forest-700 bg-forest-50 px-2 py-0.5 rounded">
                    Category: {selectedReport.category}
                  </span>
                  <UrgencyBadge urgency={(selectedReport.urgency || 'medium').toLowerCase()} size="sm" />
                  <StatusBadge status={selectedReport.status || 'Reported'} size="sm" />
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-night-800 border border-slate-200 dark:border-night-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Original Citizen Description</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {selectedReport.description}
                  </p>
                </div>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>{typeof selectedReport.location === 'object' ? selectedReport.location?.address : selectedReport.address}</span>
                </p>
              </div>
            </div>

            {/* AI Findings Card */}
            <div className="p-3.5 rounded-xl bg-forest-50/70 dark:bg-forest-950/30 border border-forest-200 dark:border-forest-800/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-forest-900 dark:text-forest-200">
                <Sparkles className="w-4 h-4 text-forest-600" />
                <span>AI Automated Assessment Findings</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <strong className="text-slate-600 dark:text-slate-400">Assessed Category: </strong>
                  <span className="font-bold capitalize">{selectedReport.aiCategory || selectedReport.category}</span>
                </div>
                <div>
                  <strong className="text-slate-600 dark:text-slate-400">Assessed Urgency: </strong>
                  <span className="font-bold capitalize">{selectedReport.aiUrgency || selectedReport.urgency}</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>AI Explanation: </strong>{selectedReport.aiExplanation || 'Categorized based on detected civic/welfare markers.'}
              </p>
              {selectedReport.aiMissingInfo && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Missing / Unclear: </strong>{selectedReport.aiMissingInfo}
                </p>
              )}
            </div>

            {/* Location & Image Consistency Evidence */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white dark:bg-night-800 border border-slate-200 dark:border-night-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Telemetry Evidence</span>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100">
                  {selectedReport.locationConsistencyStatus || 'Location Evidence Incomplete'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {selectedReport.locationConsistencyNotes || 'Telemetry captured with user permission.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-night-800 border border-slate-200 dark:border-night-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Image Verification Status</span>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100">
                  {selectedReport.imageVerificationStatus === 'consistent' ? 'Consistent with Description' : 'Needs Human Review'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {selectedReport.imageVerificationNotes || 'Inspection required by authorised coordinator.'}
                </p>
              </div>
            </div>

            {/* Human Review Decision Form */}
            <form onSubmit={handleRecordHumanReview} className="p-4 rounded-xl border-2 border-forest-300 dark:border-forest-800 bg-white dark:bg-night-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-forest-900 dark:text-forest-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-forest-600" />
                  <span>Authorised Officer Human Review Decision</span>
                </span>
                <span className="text-[10px] text-slate-400">Current status: {selectedReport.humanReviewStatus || 'pending'}</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={reviewDecision === 'approved'}
                    onChange={() => setReviewDecision('approved')}
                    className="text-forest-600 focus:ring-forest-500"
                  />
                  <span className="font-semibold text-xs text-emerald-700 dark:text-emerald-400">Approve AI Assessment</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="modified"
                    checked={reviewDecision === 'modified'}
                    onChange={() => setReviewDecision('modified')}
                    className="text-forest-600 focus:ring-forest-500"
                  />
                  <span className="font-semibold text-xs text-purple-700 dark:text-purple-400">Modify Triage</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={reviewDecision === 'rejected'}
                    onChange={() => setReviewDecision('rejected')}
                    className="text-forest-600 focus:ring-forest-500"
                  />
                  <span className="font-semibold text-xs text-rose-700 dark:text-rose-400">Reject / Invalidate</span>
                </label>
              </div>

              {reviewDecision === 'modified' && (
                <div className="grid grid-cols-2 gap-3 p-2 rounded-lg bg-slate-50 dark:bg-night-800 border border-slate-200 dark:border-night-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Adjust Category</label>
                    <select
                      value={revisedCategory}
                      onChange={e => setRevisedCategory(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-night-900"
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="cattle">Cattle</option>
                      <option value="bird">Bird</option>
                      <option value="wildlife">Wildlife</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Adjust Urgency</label>
                    <select
                      value={revisedUrgency}
                      onChange={e => setRevisedUrgency(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-night-900"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="needs_review">Needs Review</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.org.officerNotesLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.org.officerNotesPlaceholder}
                  value={reviewerNotes}
                  onChange={e => setReviewerNotes(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-night-700 bg-white dark:bg-night-900"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingReview}>
                  <span>Record Officer Decision</span>
                </Button>
              </div>
            </form>

            {/* Quick Status Update Buttons */}
            <div className="space-y-2 pt-2 border-t border-sage-100 dark:border-night-700">
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                Update Dispatch Stage:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'under_review')}
                >
                  Mark Under Review
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'task_created')}
                >
                  Create Community Task
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  <span>Mark Resolved</span>
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleUpdateStatus(selectedReport.id, 'escalated')}
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                  <span>Escalate to Municipal Van</span>
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
