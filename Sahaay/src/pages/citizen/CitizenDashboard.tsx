import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { useAuth } from '../../context/AuthContext';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  PhoneCall, 
  ArrowRight, 
  AlertTriangle,
  Heart,
  Sparkles,
  Inbox,
  Compass
} from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

export const CitizenDashboard: React.FC = () => {
  const { user, token, isDemo } = useAuth();
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/reports?myReports=true', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch personal reports');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setReports(data);
          } else {
            setReports([]);
          }
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // If in demo mode and backend request fails, fall back to initial demo reports
          if (isDemo) {
            setReports(INITIAL_REPORTS.slice(0, 3));
          } else {
            setReports([]);
          }
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, isDemo]);

  const activeReportsCount = reports.filter(r => 
    ['in_progress', 'In Progress', 'Assigned', 'worker_assigned'].includes(r.status)
  ).length;

  const underReviewCount = reports.filter(r => 
    ['submitted', 'Reported', 'under_review', 'Under Review'].includes(r.status)
  ).length;

  const resolvedCount = reports.filter(r => 
    ['resolved', 'Resolved'].includes(r.status)
  ).length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-forest-950/60 text-gold-300 text-xs font-semibold">
            {isDemo ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Account: Priya Sharma</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>{user.badge || 'Registered Citizen'}</span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user.name}!
          </h2>
          <p className="text-xs sm:text-sm text-forest-200 max-w-xl">
            {isDemo ? (
              'You are exploring Priya Sharma\'s demonstration workspace with pre-loaded Pune incident records.'
            ) : reports.length > 0 ? (
              `You have logged ${reports.length} community incident ${reports.length === 1 ? 'report' : 'reports'} in ${user.city || 'your area'}.`
            ) : (
              `Your citizen account is active in ${user.city || 'your city'}. You have not reported any incidents yet.`
            )}
          </p>
        </div>

        <div className="shrink-0">
          <Link to="/citizen/report">
            <Button variant="gold" size="lg" className="w-full sm:w-auto font-bold shadow-md">
              <PlusCircle className="w-5 h-5 mr-2" />
              <span>Report Animal Issue</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Reports Submitted"
          value={String(reports.length)}
          subtitle={isDemo ? 'Sample reports seeded' : `Personal submissions for ${user.email}`}
          icon={<FileText className="w-6 h-6" />}
          colorScheme="forest"
        />
        <StatCard
          title="Under Review / Triage"
          value={String(underReviewCount)}
          subtitle="Awaiting organisation assessment"
          icon={<Clock className="w-6 h-6" />}
          colorScheme="gold"
        />
        <StatCard
          title="Responders En Route"
          value={String(activeReportsCount)}
          subtitle="Assigned to community handlers"
          icon={<AlertTriangle className="w-6 h-6" />}
          colorScheme="rose"
        />
        <StatCard
          title="Successfully Resolved"
          value={String(resolvedCount)}
          subtitle="Treated & verified outcomes"
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="mint"
        />
      </div>

      {/* Main Content Split: Recent Reports & Emergency Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Active Incident Reports */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                My Recent Reports
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track live triage status, assigned worker, and resolution proof
              </p>
            </div>
            {reports.length > 0 && (
              <Link
                to="/citizen/reports"
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <Card className="p-8 text-center text-xs text-slate-500">
              Loading your incident records from SQLite...
            </Card>
          ) : reports.length === 0 ? (
            <Card className="p-8 text-center space-y-3 border-dashed border-sage-300 dark:border-night-700">
              <div className="w-12 h-12 mx-auto rounded-full bg-sage-100 dark:bg-night-800 text-slate-400 flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                No incident reports filed yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Whenever you encounter an injured animal or public community issue, submit a report to alert verified responders in your area.
              </p>
              <Link to="/citizen/report">
                <Button variant="primary" size="sm" className="mt-2">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  <span>File Your First Report</span>
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 3).map((r: any) => {
                const photos = Array.isArray(r.photos) ? r.photos : [];
                const img = photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';
                const addr = typeof r.location === 'object' && r.location?.address ? r.location.address : r.address || '';
                const cityStr = typeof r.location === 'object' && r.location?.city ? r.location.city : r.city || '';

                return (
                  <Card key={r.id} className="p-4 hover:border-forest-400 transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={img}
                          alt={r.title}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-sage-200 dark:border-night-700"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-950/70 px-2 py-0.5 rounded">
                              {r.trackingNumber || r.tracking_number}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-night-750 px-2 py-0.5 rounded capitalize">
                              {r.aiCategory || r.category || 'other'}
                            </span>
                            <UrgencyBadge urgency={r.urgency || 'medium'} size="sm" />
                            <StatusBadge status={r.status || 'Reported'} size="sm" />
                            {r.locationConsistencyStatus && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 flex items-center gap-1">
                                <Compass className="w-3 h-3" />
                                <span>{r.locationConsistencyStatus}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {r.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{addr} {cityStr ? `(${cityStr})` : ''}</span>
                          </p>
                        </div>
                      </div>

                      <Link
                        to={`/citizen/reports`}
                        className="w-full sm:w-auto shrink-0"
                      >
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Emergency Support Hotline */}
        <div className="space-y-4">
          <Card className="p-5 border-rose-200 dark:border-rose-900/60 bg-gradient-to-b from-rose-50/50 to-white dark:from-rose-950/20 dark:to-night-800">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Veterinary Emergency Hotlines</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              For active rabies suspicion, severe vehicular accidents, or animals trapped in water/wells, contact direct rapid response units immediately:
            </p>

            <div className="space-y-2">
              <a
                href="tel:1962"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-rose-200 dark:border-rose-900/80 hover:border-rose-400 text-xs font-semibold text-rose-900 dark:text-rose-200 transition-colors"
              >
                <span>National Animal Ambulance</span>
                <span className="font-bold text-rose-600">Dial 1962</span>
              </a>
              <a
                href="tel:02025501000"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 hover:border-forest-500 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span>PMC Animal Control (Pune)</span>
                <span className="text-slate-600 dark:text-slate-400">020-25501000</span>
              </a>
              <a
                href="tel:07122567035"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-night-850 border border-sage-200 dark:border-night-700 hover:border-forest-500 text-xs font-medium text-slate-800 dark:text-slate-200 transition-colors"
              >
                <span>NMC Veterinary Dept (Nagpur)</span>
                <span className="text-slate-600 dark:text-slate-400">0712-2567035</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
