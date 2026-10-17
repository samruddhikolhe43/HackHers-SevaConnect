import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { INITIAL_TASKS } from '../../data/mockTasks';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  Map, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  ArrowRight,
  ShieldAlert,
  MapPin,
  Eye
} from 'lucide-react';

export const OrgDashboard: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>(INITIAL_REPORTS);
  const [tasks, setTasks] = useState<any[]>(INITIAL_TASKS);
  const [workersCount, setWorkersCount] = useState<number>(14);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/reports', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setReports(data);
      })
      .catch(() => {});

    fetch('/api/tasks', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTasks(data);
      })
      .catch(() => {});

    fetch('/api/workers?available=true', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setWorkersCount(data.length);
      })
      .catch(() => {});
  }, [token]);

  const activeReportsCount = reports.filter(r => (r.status || '').toLowerCase() !== 'resolved').length;
  const awaitingAssignmentCount = reports.filter(r => (r.status || '').toLowerCase() === 'submitted' || (r.status || '').toLowerCase() === 'under_review').length;
  const emergencyCount = reports.filter(r => (r.urgency || '').toLowerCase() === 'critical' || r.isEmergencyEscalation || r.is_emergency_escalation).length;
  const reviewTasks = tasks.filter(t => (t.status || '').toLowerCase() === 'submitted_for_review' || (t.status || '').toLowerCase() === 'under review');
  const criticalReports = reports.filter(r => (r.urgency || '').toLowerCase() === 'critical' || (r.urgency || '').toLowerCase() === 'high');

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-forest-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-gold-300 text-xs font-bold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Sahaay Dispatch Hub • Pune & Nagpur Regional Operations</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dispatch & Incident Operations
          </h2>
          <p className="text-xs sm:text-sm text-forest-200 max-w-xl">
            Real-time urban coordination across Pune and Nagpur municipal wards. Oversee citizen intake, field dispatches, and verification audits.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link to="/org/map">
            <Button variant="gold" size="md">
              <Map className="w-4 h-4 mr-1.5" />
              <span>Open Geospatial Map</span>
            </Button>
          </Link>
          <Link to="/org/tasks">
            <Button variant="secondary" size="md">
              <ClipboardList className="w-4 h-4 mr-1.5" />
              <span>Dispatch Task</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Operations Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Reports Logged"
          value={String(activeReportsCount)}
          subtitle={`${awaitingAssignmentCount} awaiting assignment`}
          icon={<Clock className="w-6 h-6" />}
          colorScheme="forest"
        />
        <StatCard
          title="Emergency Escalations"
          value={String(emergencyCount)}
          subtitle={emergencyCount > 0 ? "Municipal Rapid Units alerted" : "All wards stable"}
          icon={<ShieldAlert className="w-6 h-6" />}
          colorScheme="rose"
          trend={{ value: emergencyCount > 0 ? 'Active Red-Line' : 'Clear', isPositive: emergencyCount === 0 }}
        />
        <StatCard
          title="Pending Completion Reviews"
          value={String(reviewTasks.length)}
          subtitle="Photos ready for sign-off"
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="gold"
          trend={{ value: reviewTasks.length > 0 ? 'Action Required' : 'Up to date', isPositive: reviewTasks.length === 0 }}
        />
        <StatCard
          title="Active Available Workers"
          value={String(workersCount)}
          subtitle="Across Pune & Nagpur wards"
          icon={<Users className="w-6 h-6" />}
          colorScheme="mint"
        />
      </div>

      {/* Critical Incidents Awaiting Action */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Priority & Critical Incidents Queue</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-urgency street incidents requiring verified handler escort or emergency municipal routing.
            </p>
          </div>

          <Link
            to="/org/reports"
            className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criticalReports.map(report => (
            <Card key={report.id} hover className="p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                    {report.trackingNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <UrgencyBadge urgency={report.urgency} size="sm" />
                    <StatusBadge status={report.status} size="sm" />
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {report.title}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {report.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{typeof report.location === 'object' && report.location?.address ? report.location.address : report.address || 'Pune / Nagpur'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-between">
                <SafetyClearanceBadge clearance={report.safetyClearance || report.safety_clearance || 'community_safe'} size="sm" />

                <Link to="/org/reports">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    <span>Manage Dispatch</span>
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Review Proofs Teaser */}
      {reviewTasks.length > 0 && (
        <Card className="p-6 border-forest-300 dark:border-forest-800 bg-forest-50/40 dark:bg-forest-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-forest-800 dark:text-forest-200 uppercase tracking-wider">
                Photo Proof Ready for Review
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {reviewTasks[0].title} (Worker: {reviewTasks[0].assignedWorkerName || 'Community Worker'})
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Worker uploaded treatment photo. Verify to release simulated stipend (₹{reviewTasks[0].proposedPayment}).
              </p>
            </div>

            <Link to="/org/review-completion" className="shrink-0">
              <Button variant="primary" size="sm">
                <span>Review Proof Photos</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};
