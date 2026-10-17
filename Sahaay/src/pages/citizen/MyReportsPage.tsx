import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  PlusCircle, 
  ArrowRight, 
  FileText,
  Loader2
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { token, isDemo } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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
          if (isDemo) {
            setReports(INITIAL_REPORTS);
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

  const filteredReports = reports.filter(r => {
    const status = (r.status || '').toLowerCase();
    if (statusFilter !== 'all' && status !== statusFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchTrack = (r.trackingNumber || r.tracking_number || '').toLowerCase().includes(q);
      const addr = typeof r.location === 'object' ? r.location?.address : r.address;
      const matchAddress = (addr || '').toLowerCase().includes(q);
      if (!matchTitle && !matchTrack && !matchAddress) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Citizen Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            My Incident Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review active rescue progress, responder updates, and verified treatment outcomes
          </p>
        </div>

        <Link to="/citizen/report">
          <Button variant="primary" size="md">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>New Report</span>
          </Button>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-night-800 rounded-2xl border border-sage-200 dark:border-night-700 shadow-soft">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tracking number, location, or symptom..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-sage-50/50 dark:bg-night-850 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-850 text-xs sm:text-sm"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="reported">Reported / Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <Card className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
          <span>Retrieving your incident reports from SQLite database...</span>
        </Card>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          title={reports.length === 0 ? "You haven't filed any reports yet" : "No reports match your filter"}
          description={
            reports.length === 0
              ? "If you notice an injured animal or public community issue, submit a report to alert verified responders in your area."
              : "Try clearing your search term or select All Statuses."
          }
          icon={<FileText className="w-8 h-8" />}
          actionText={reports.length === 0 ? "File a Report Now" : "Clear Filters"}
          onAction={() => {
            if (reports.length === 0) {
              window.location.href = '/citizen/report';
            } else {
              setSearchQuery('');
              setStatusFilter('all');
            }
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => {
            const photos = Array.isArray(report.photos) ? report.photos : [];
            const img = photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80';
            const tracking = report.trackingNumber || report.tracking_number;
            const addr = typeof report.location === 'object' && report.location?.address ? report.location.address : report.address || '';
            const cityStr = typeof report.location === 'object' && report.location?.city ? report.location.city : report.city || '';
            const dateStr = report.reportedAt || report.createdAt || report.created_at || 'Recently';

            return (
              <Card key={report.id} hover className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {/* Photo thumbnail */}
                  <div className="md:w-56 h-48 md:h-auto shrink-0 relative bg-sage-100 dark:bg-night-700">
                    <img
                      src={img}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <UrgencyBadge urgency={report.urgency || 'medium'} size="sm" />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-forest-700 dark:text-forest-400">
                            {tracking}
                          </span>
                          <StatusBadge status={report.status || 'Reported'} size="sm" />
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {report.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{addr} {cityStr ? `(${cityStr})` : ''}</span>
                        </span>
                        {(report.assignedWorkerName || report.assigned_worker_name) && (
                          <span className="text-forest-700 dark:text-forest-400 font-medium">
                            Assigned: {report.assignedWorkerName || report.assigned_worker_name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-between">
                      <SafetyClearanceBadge clearance={report.safetyClearance || report.safety_clearance || 'community_safe'} size="sm" />

                      <Link
                        to={`/citizen/reports/${report.id}`}
                        className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-forest-700 dark:text-forest-400 hover:underline"
                      >
                        <span>View Live Timeline</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
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
