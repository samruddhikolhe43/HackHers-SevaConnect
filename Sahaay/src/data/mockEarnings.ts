import { EarningRecord } from '../types';

export const SIMULATED_EARNINGS_NOTICE = 'SIMULATED DEMONSTRATION DATA: All compensation amounts, disbursements, and account figures are simulated for prototype evaluation only. No real banking or currency transactions have been initiated.';

export const INITIAL_EARNINGS: EarningRecord[] = [
  {
    id: 'earn-501',
    taskId: 'tsk-205',
    taskTitle: 'Cattle wound cleaning and sanctuary transport escort',
    date: '2026-10-15',
    amount: 750,
    status: 'paid',
    transactionReference: 'SIM-UPI-2026-99014',
    simulatedNotice: 'Simulated UPI transfer to Demo Worker Account (HDFC Bank •••• 4120)',
  },
  {
    id: 'earn-502',
    taskId: 'tsk-206',
    taskTitle: 'Post-op medication administration for neutered indie dog',
    date: '2026-10-15',
    amount: 300,
    status: 'pending_verification',
    transactionReference: 'SIM-HOLD-2026-88120',
    simulatedNotice: 'Under organisation photo review. Verified upon proof approval.',
  },
  {
    id: 'earn-503',
    taskId: 'tsk-198',
    taskTitle: 'Community stray cat vaccination drive assistant (4 hrs)',
    date: '2026-10-12',
    amount: 900,
    status: 'paid',
    transactionReference: 'SIM-UPI-2026-98124',
    simulatedNotice: 'Simulated direct deposit transfer completed.',
  },
  {
    id: 'earn-504',
    taskId: 'tsk-192',
    taskTitle: 'Emergency puppy rescue during monsoon drain flooding',
    date: '2026-10-09',
    amount: 500,
    status: 'paid',
    transactionReference: 'SIM-UPI-2026-97602',
    simulatedNotice: 'Simulated stipend disbursement completed.',
  },
  {
    id: 'earn-505',
    taskId: 'tsk-201',
    taskTitle: 'Welfare check & transport support for injured dog (Current)',
    date: '2026-10-16',
    amount: 450,
    status: 'processing',
    transactionReference: 'SIM-ACTIVE-2026-0012',
    simulatedNotice: 'Active task in progress. Will transition to review upon submission.',
  }
];
