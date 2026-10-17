import React, { useState, useEffect } from 'react';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { INITIAL_EARNINGS, SIMULATED_EARNINGS_NOTICE } from '../../data/mockEarnings';
import { useAuth } from '../../context/AuthContext';
import { 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  AlertCircle, 
  CreditCard,
  Building,
  HelpCircle,
  Download,
  Loader2,
  Inbox
} from 'lucide-react';

export const EarningsPage: React.FC = () => {
  const { user, token, isDemo } = useAuth();
  const [earnings, setEarnings] = useState<any[]>(isDemo ? INITIAL_EARNINGS : []);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const p1 = fetch('/api/payouts', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setEarnings(data);
          } else if (isDemo) {
            setEarnings(INITIAL_EARNINGS);
          } else {
            setEarnings([]);
          }
        }
      })
      .catch(() => {
        if (isDemo) setEarnings(INITIAL_EARNINGS);
      });

    const p2 = fetch('/api/workers/me', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setWorkerProfile(data);
      })
      .catch(() => {});

    Promise.all([p1, p2]).finally(() => setIsLoading(false));
  }, [token, isDemo]);

  const filteredEarnings = earnings.filter(e => {
    if (filter === 'paid') return e.status === 'paid';
    if (filter === 'pending') return e.status === 'pending_verification' || e.status === 'processing';
    return true;
  });

  const availableBalance = workerProfile?.simulatedBalance ?? (isDemo ? 2450 : 0);
  const inReviewAmount = earnings
    .filter(e => e.status === 'pending_verification' || e.status === 'processing')
    .reduce((sum, e) => sum + (e.amount || 0), isDemo && earnings.length === 0 ? 750 : 0);
  const totalLifetimeDisbursed = isDemo
    ? 14850
    : earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0);
  const avgCompensation = earnings.length > 0
    ? Math.round(earnings.reduce((sum, e) => sum + (e.amount || 0), 0) / earnings.length)
    : 390;

  const handleSimulateWithdraw = () => {
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
            Worker Compensation Roster
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Simulated Earnings & Disbursements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track task compensation, pending photo verification, and simulated account deposits
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={() => setWithdrawModalOpen(true)}
          className="shadow-sm"
        >
          <ArrowUpRight className="w-4 h-4 mr-1.5" />
          <span>Simulate Payout Transfer</span>
        </Button>
      </div>

      {/* Mandatory Simulated Data Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold uppercase tracking-wider text-[11px]">Notice of Simulated Data</p>
          <p className="leading-relaxed text-amber-900 dark:text-amber-300">
            {SIMULATED_EARNINGS_NOTICE}
          </p>
        </div>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Available Balance"
          value={`₹${availableBalance.toLocaleString()}`}
          subtitle="Ready for simulated transfer"
          isSimulated
          icon={<IndianRupee className="w-6 h-6" />}
          colorScheme="gold"
        />
        <StatCard
          title="In Verification Review"
          value={`₹${inReviewAmount.toLocaleString()}`}
          subtitle="Held until photo check"
          isSimulated
          icon={<Clock className="w-6 h-6" />}
          colorScheme="slate"
        />
        <StatCard
          title="Total Lifetime Disbursed"
          value={`₹${totalLifetimeDisbursed.toLocaleString()}`}
          subtitle={isDemo ? "Across 38 verified rescues" : "From completed field tasks"}
          isSimulated
          icon={<CheckCircle2 className="w-6 h-6" />}
          colorScheme="mint"
        />
        <StatCard
          title="Avg Task Compensation"
          value={`₹${avgCompensation}`}
          subtitle="Based on task complexity"
          isSimulated
          icon={<CreditCard className="w-6 h-6" />}
          colorScheme="forest"
        />
      </div>

      {/* Payment Concepts Explanation Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">1. Proposed Task Payments</span>
          <p className="text-slate-500 leading-relaxed">
            Visible on open task cards. Indicates the stipend allocated by the organisation before task claim.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">2. In Verification Review</span>
          <p className="text-slate-500 leading-relaxed">
            Held in escrow while the NGO coordinator inspects the worker's uploaded treatment photos.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-night-800 border border-sage-200 dark:border-night-700 space-y-1">
          <span className="font-bold text-slate-900 dark:text-white block">3. Approved & Disbursed</span>
          <p className="text-slate-500 leading-relaxed">
            Released directly into the worker's designated balance with a simulated transaction reference.
          </p>
        </div>
      </div>

      {/* Payment History Table */}
      <Card className="overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-sage-100 dark:border-night-700 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Simulated Payment Records & Audit Log
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed chronological ledger of all task payouts and pending approvals
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
              All Records ({earnings.length})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-forest-700 text-white'
                  : 'bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              Disbursed ({earnings.filter(e => e.status === 'paid').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filter === 'pending'
                  ? 'bg-forest-700 text-white'
                  : 'bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              In Review ({earnings.filter(e => e.status === 'pending_verification' || e.status === 'processing').length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Task Description</th>
                <th className="p-4">Simulated Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Reference Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-100 dark:divide-night-700 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gold-600" />
                      <span>Loading payout records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEarnings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <Inbox className="w-6 h-6 text-slate-400" />
                      <p className="font-semibold text-slate-700 dark:text-slate-300">No payout records found</p>
                      <p className="text-xs text-slate-400">Complete community service tasks to receive simulated payouts.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEarnings.map(item => (
                <tr key={item.id} className="hover:bg-sage-50/40 dark:hover:bg-night-750/40 transition-colors">
                  <td className="p-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="p-4 font-medium text-slate-900 dark:text-white max-w-xs">
                    <p className="truncate">{item.taskTitle}</p>
                    <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                      {item.simulatedNotice}
                    </p>
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
                        Held for Review
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold text-xs">
                        Active In Progress
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {item.transactionReference}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Simulated Payout Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        title="Simulated Payout Request"
        subtitle="Prototype demonstration of worker balance withdrawal"
      >
        <div className="space-y-4 py-2">
          {withdrawSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-950 dark:text-emerald-100 text-base">
                Simulated Transfer Initiated!
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                ₹2,450 has been marked as transferred to Demo Bank Account (HDFC Bank •••• 4120).
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                Notice: Prototype demonstration only. No real money has been transferred.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-sage-50 dark:bg-night-850 border border-sage-200 dark:border-night-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Available Balance:</span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white">₹2,450</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Destination:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    HDFC Bank •••• 4120 (Demo Worker)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs">
                <strong>Simulated Payout:</strong> Clicking confirm will simulate an instant UPI payout release.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setWithdrawModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gold" size="sm" onClick={handleSimulateWithdraw}>
                  <span>Confirm Simulated Transfer</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
