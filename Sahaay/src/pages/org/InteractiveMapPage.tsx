import React, { useState } from 'react';
import { IncidentMap } from '../../components/map/IncidentMap';
import { INITIAL_REPORTS } from '../../data/mockReports';
import { Report } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UrgencyBadge, StatusBadge, SafetyClearanceBadge } from '../../components/common/Badge';
import { 
  Map, 
  MapPin, 
  Layers, 
  AlertCircle, 
  Compass, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const InteractiveMapPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
            Geospatial Triage Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Live Incident & Rescue Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Interactive OpenStreetMap cluster tracking street incidents, worker dispatches, and emergency escalations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/citizen/report">
            <Button variant="primary" size="sm">
              <span>+ Log Incident on Map</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Map and Side Incident List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Leaflet Interactive Map */}
        <div className="lg:col-span-8 space-y-4">
          <IncidentMap
            reports={INITIAL_REPORTS}
            selectedReportId={selectedReport?.id}
            onSelectReport={report => setSelectedReport(report)}
            height="580px"
          />

          <div className="p-3.5 rounded-xl bg-sage-50 dark:bg-night-800 border border-sage-200 dark:border-night-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
                <span>Critical (Rabies / Escalation)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span>High Priority</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gold-500 inline-block" />
                <span>Standard</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-forest-600 inline-block" />
                <span>Routine Care</span>
              </span>
            </div>

            <span className="text-[11px] font-mono">OpenStreetMap Tiles</span>
          </div>
        </div>

        {/* Right: Selected Report Details & Active Hotspots */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-sage-100 dark:border-night-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-forest-600" />
                <span>Incident Inspector</span>
              </h3>
              {selectedReport && (
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-xs text-forest-700 dark:text-forest-400 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {selectedReport ? (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl overflow-hidden border border-sage-200 dark:border-night-700 h-36">
                  <img
                    src={selectedReport.photos[0]}
                    alt={selectedReport.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-forest-700 dark:text-forest-400">
                      {selectedReport.trackingNumber}
                    </span>
                    <UrgencyBadge urgency={selectedReport.urgency} size="sm" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedReport.title}
                  </h4>
                  <p className="text-slate-500 text-xs flex items-center gap-1 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedReport.location.address}</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedReport.description}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <StatusBadge status={selectedReport.status} size="sm" />
                  <Link
                    to={`/citizen/reports/${selectedReport.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
                  >
                    <span>Full Case Timeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 animate-bounce" />
                <p className="text-xs font-medium">Click any pin on the map to inspect incident details</p>
                <p className="text-[11px] text-slate-500">Or browse active incidents across city hubs below</p>
              </div>
            )}
          </Card>

          {/* Quick List of Reports in View */}
          <Card className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sample Incidents ({INITIAL_REPORTS.length})
              </h4>
              <span className="text-[10px] text-slate-400">Multi-City Hubs</span>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {INITIAL_REPORTS.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                    selectedReport?.id === r.id
                      ? 'border-forest-600 bg-forest-50/70 dark:bg-forest-950/40 ring-1 ring-forest-500'
                      : 'border-sage-200 dark:border-night-700 hover:bg-sage-50/50 dark:hover:bg-night-750'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-forest-700 dark:text-forest-400">
                        {r.trackingNumber}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sage-100 dark:bg-night-700 text-slate-600 dark:text-slate-300">
                        {r.location.city}
                      </span>
                    </div>
                    <UrgencyBadge urgency={r.urgency} size="sm" />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white truncate mt-0.5">
                    {r.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{r.location.address}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
