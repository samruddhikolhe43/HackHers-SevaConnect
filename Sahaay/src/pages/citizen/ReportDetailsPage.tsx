import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Building2, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  Calendar,
  Share2
} from 'lucide-react';

export const ReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Find report or default to first
  const report = INITIAL_REPORTS.find(r => r.id === id) || INITIAL_REPORTS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button and breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/reports"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-forest-700 dark:text-forest-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Reports</span>
        </Link>

        <span className="text-xs text-slate-400">
          Tracking ID: <strong className="font-mono text-slate-800 dark:text-slate-200">{report.trackingNumber}</strong>
        </span>
      </div>

      {/* Main Incident Summary Card */}
      <Card className="overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-black px-2.5 py-1 rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-950 dark:text-forest-300">
                {report.trackingNumber}
              </span>
              <UrgencyBadge urgency={report.urgency} />
              <StatusBadge status={report.status} />
              <SafetyClearanceBadge clearance={report.safetyClearance} />
            </div>

            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Reported on {report.reportedAt}</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {report.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incident Photo */}
            <div className="rounded-2xl overflow-hidden border border-sage-200 dark:border-night-700 bg-sage-100 dark:bg-night-750 max-h-80">
              <img
                src={report.photos[0]}
                alt={report.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Location & Reported By */}
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-forest-600" />
                  <span>Spot Location & Coordinates</span>
                </p>
                <p className="text-slate-700 dark:text-slate-300">{report.location.address}</p>
                {report.location.landmark && (
                  <p className="text-slate-500">Landmark: {report.location.landmark}</p>
                )}
                <p className="text-[11px] font-mono text-slate-400 pt-1">
                  GPS: {report.location.lat.toFixed(4)}° N, {report.location.lng.toFixed(4)}° E (Simulated)
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-slate-100">Incident Description:</p>
                <p className="leading-relaxed bg-white dark:bg-night-800 p-3 rounded-xl border border-sage-200 dark:border-night-700">
                  {report.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 rounded-lg bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700">
                  <span className="text-slate-400 block text-[11px]">Assigned Handler</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {report.assignedWorkerName || 'Assigning...'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-sage-50/70 dark:bg-night-850 border border-sage-200 dark:border-night-700">
                  <span className="text-slate-400 block text-[11px]">Coordination NGO</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {report.assignedOrgName || 'Pune Animal Welfare'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Multi-Step Vertical Status Timeline */}
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Live Incident Status & Verification Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stage transitions logged by citizens, triage dispatchers, and field workers.
          </p>
        </div>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-forest-300 dark:before:bg-forest-800">
          {report.statusHistory.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-forest-600 text-white flex items-center justify-center ring-4 ring-ivory-50 dark:ring-night-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={step.status} size="sm" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Logged by {step.actor}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{step.timestamp}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-sage-50/70 dark:bg-night-850 p-3 rounded-xl border border-sage-200/80 dark:border-night-700 leading-relaxed mt-1">
                  {step.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dispatcher Contact Assistance */}
      <div className="p-6 rounded-2xl bg-forest-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm sm:text-base">Need to add more information or photos?</h4>
          <p className="text-xs text-forest-300 mt-0.5">
            Contact the dispatch coordinator on duty for case {report.trackingNumber}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:1962"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call Dispatcher</span>
          </a>
        </div>
      </div>
    </div>
  );
};
