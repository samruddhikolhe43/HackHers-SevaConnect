import React from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { MOCK_ANALYTICS } from '../../data/mockAnalytics';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  IndianRupee,
  AlertCircle
} from 'lucide-react';

export const ImpactAnalyticsPage: React.FC = () => {
  const { overview, byCategory, byUrgency, zones, monthlyTrend } = MOCK_ANALYTICS;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-forest-600 dark:text-forest-400">
          Executive Data Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Municipal Impact & Rescue Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Aggregated reporting metrics, ward response times, and animal welfare distribution in Pune
        </p>
      </div>

      {/* Simulated Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-center justify-between">
        <span className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Simulated analytics dataset based on test models across Pune municipal wards.</span>
        </span>
        <span className="font-mono text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300">
          Sample Data
        </span>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Reports Triaged"
          value={overview.totalReports}
          subtitle="94.2% resolution rate"
          isSimulated
          icon={<BarChart3 className="w-6 h-6" />}
          colorScheme="forest"
          trend={{ value: '+14% vs last mo', isPositive: true }}
        />
        <StatCard
          title="Avg Dispatch Latency"
          value={`${overview.averageResponseMinutes} min`}
          subtitle="Citizen report to on-site arrival"
          isSimulated
          icon={<Clock className="w-6 h-6" />}
          colorScheme="gold"
          trend={{ value: '4 min faster', isPositive: true }}
        />
        <StatCard
          title="Verified Community Workers"
          value={overview.verifiedWorkers}
          subtitle="Active on flexible schedule"
          isSimulated
          icon={<ShieldCheck className="w-6 h-6" />}
          colorScheme="mint"
        />
        <StatCard
          title="Simulated Payouts"
          value={`₹${(overview.totalSimulatedDisbursements / 100000).toFixed(1)}L`}
          subtitle="Direct community worker income"
          isSimulated
          icon={<IndianRupee className="w-6 h-6" />}
          colorScheme="slate"
        />
      </div>

      {/* Species & Urgency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Species Breakdown */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Incident Breakdown by Species
          </h3>

          <div className="space-y-3">
            {byCategory.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{cat.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-sage-100 dark:bg-night-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Urgency Distribution */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Triage Distribution by Urgency
          </h3>

          <div className="space-y-3">
            {byUrgency.map((urg, i) => {
              const total = byUrgency.reduce((acc, u) => acc + u.count, 0);
              const pct = ((urg.count / total) * 100).toFixed(1);

              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{urg.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {urg.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-sage-100 dark:bg-night-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: urg.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 pt-2 border-t border-sage-100 dark:border-night-700">
            Note: All 62 Critical (Rabies / Extreme Bite Risk) incidents were transferred to municipal ambulances with zero field worker injuries.
          </p>
        </Card>
      </div>

      {/* Ward Efficiency Table */}
      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-sage-100 dark:border-night-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ward-Level Operational Efficiency (Pune Municipal Corporation)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Response metrics and coverage density across active trial zones
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Pune Ward / Zone</th>
                <th className="p-4">Total Incidents Handled</th>
                <th className="p-4">Average Field Arrival Time</th>
                <th className="p-4">Active Roster Size</th>
                <th className="p-4">Efficiency Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              {zones.map((zone, i) => (
                <tr key={i} className="hover:bg-sage-50/40 dark:hover:bg-night-750/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    <span>{zone.zone}</span>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">{zone.reports}</td>
                  <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{zone.avgTime}</td>
                  <td className="p-4">{zone.activeWorkers} verified helpers</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                      Optimal
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
