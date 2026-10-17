import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { INITIAL_EARNINGS, SIMULATED_EARNINGS_NOTICE } from '../../data/mockEarnings';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download,
  Filter,
  Loader2,
  Inbox
} from 'lucide-react';

export const PaymentManagementPage: React.FC = () => {
  const { token, isDemo } = useAuth();
  const [payouts, setPayouts] = useState<any[]>(INITIAL_EARNINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/payouts', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPayouts(data);
        } else {
          setPayouts(INITIAL_EARNINGS);
        }
      })
      .catch(() => {
        setPayouts(INITIAL_EARNINGS);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const filtered = payouts.filter(e => {
    if (filter === 'paid') return e.status === 'paid';
    if (filter === 'pending') return e.status === 'pending_verification' || e.status === 'processing';
    return true;
  });

  const totalDisbursed = payouts
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const heldInReview = payouts
    .filter(p => p.status === 'pending_verification' || p.status === 'processing')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const avgPayout = payouts.length > 0
    ? Math.round(payouts.reduce((sum, p) => sum + (p.amount || 0), 0) / payouts.length)
    : 420;

  const handleExportCSV = () => {
    const headers = ['Reference ID', 'Date', 'Task Description', 'Worker Name', 'Simulated Amount (INR)', 'Status'];
    const rows = payouts.map(p => [
      `"${p.transactionReference || p.id}"`,
      `"${p.date || '2026-10-17'}"`,
      `"${(p.taskTitle || '').replace(/"/g, '""')}"`,
      `"${p.workerName || 'Worker'}"`,
      p.amount || 0,
      `"${p.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sahaay_simulated_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
            Treasury & Disbursements
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Payment & Stipend Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Audit simulated micro-stipend distributions to community workers across Pune & Nagpur wards
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export Simulated CSV Ledger</span>
        </Button>
      </div>

      {/* Simulated Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold uppercase tracking-wider text-[11px]">Notice of Simulated Data</p>
          <p className="leading-relaxed text-amber-900 dark:text-amber-300">
            {SIMULATED_EARNINGS_NOTICE}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Simulated Grants Pool"
          value="₹50,000"
          subtitle="Allocated for Q4 2026"
          isSimulated
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme="forest"
        />
        <StatCard
          title="Total Disbursed (Demo)"
          value={`₹${(totalDisbursed || 14850).toLocaleString()}`}
          subtitle="Transferred to verified helpers"
          isSimulated
          icon={<IndianRupee className="w-6 h-6" />}
          colorScheme="mint"
        />
        <StatCard
          title="Held in Review Escrow"
          value={`₹${(heldInReview || 1050).toLocaleString()}`}
          subtitle="Awaiting photo audit"
          isSimulated
          icon={<Clock className="w-6 h-6" />}
          colorScheme="gold"
        />
        <StatCard
          title="Avg Payout per Task"
          value={`₹${avgPayout}`}
          subtitle="Community welfare rate"
          isSimulated
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="slate"
        />
      </div>

      {/* Ledger Table */}
      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-sage-100 dark:border-night-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Organisation Disbursement Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated banking ledger tracking all task-based payouts and hold statuses
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-forest-700 text-white'
                  : 'bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              All Records ({payouts.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-forest-700 text-white'
                  : 'bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Disbursed ({payouts.filter(p => p.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-forest-700 text-white'
                  : 'bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Held / In Review ({payouts.filter(p => p.status === 'pending_verification' || p.status === 'processing').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Task Description</th>
                <th className="p-4">Simulated Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-forest-600" />
                      <span>Loading treasury records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Inbox className="w-6 h-6 text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No payment records match this filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                <tr key={item.id} className="hover:bg-sage-50/40 dark:hover:bg-night-750/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {item.transactionReference}
                  </td>
                  <td className="p-4 text-slate-500 whitespace-nowrap">{item.date}</td>
                  <td className="p-4 max-w-xs">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{item.taskTitle}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.simulatedNotice}</p>
                  </td>
                  <td className="p-4 font-black text-slate-900 dark:text-white whitespace-nowrap">
                    ₹{item.amount}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {item.status === 'paid' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                        Disbursed
                      </span>
                    )}
                    {item.status === 'pending_verification' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
                        In Escrow Review
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-xs">
                        Task Active
                      </span>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
