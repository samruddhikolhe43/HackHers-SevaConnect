import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

const router = express.Router();

function formatPayout(p) {
  const isPaid = (p.status || '').toLowerCase().includes('completed') || (p.status || '').toLowerCase().includes('disbursed');
  return {
    id: p.id,
    workerId: p.worker_id,
    workerName: p.worker_name,
    taskId: p.task_id,
    taskTitle: p.task_title,
    amount: p.amount,
    date: p.created_at ? p.created_at.slice(0, 10) : '2026-10-17',
    status: isPaid ? 'paid' : (p.status === 'pending' ? 'pending_verification' : p.status),
    rawStatus: p.status,
    method: p.method,
    payoutRef: p.payout_ref,
    transactionReference: p.payout_ref || `SIM-UPI-${p.id}`,
    simulatedNotice: `Simulated UPI transfer to ${p.worker_name || 'Worker'} (Demo State)`,
    isSimulated: Boolean(p.is_simulated),
    createdAt: p.created_at,
    processedAt: p.processed_at,
  };
}

// 1. GET PAYOUTS (Simulated civic payouts ledger)
router.get('/', authenticateToken, (req, res) => {
  try {
    let query = 'SELECT * FROM payouts';
    const params = [];

    // Workers only see their own payouts; Organisations see all
    if (req.user.role === 'worker') {
      query += ' WHERE worker_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatPayout));
  } catch (err) {
    console.error('Fetch payouts error:', err);
    res.status(500).json({ error: 'Failed to retrieve payout ledger.' });
  }
});

// 2. PROCESS SIMULATED PAYOUT (Organisation only)
router.patch('/:id/process', authenticateToken, requireRole(['organisation']), (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE payouts
      SET status = 'Completed (Simulated)',
          processed_at = ?,
          payout_ref = COALESCE(payout_ref, 'SIM-UPI-' || hex(randomblob(4)))
      WHERE id = ?
    `).run(now, id);

    const updated = db.prepare('SELECT * FROM payouts WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Payout record not found.' });
    }

    res.json({
      message: 'Simulated payout processed. Note: No actual financial transaction occurred.',
      payout: formatPayout(updated),
    });
  } catch (err) {
    console.error('Process payout error:', err);
    res.status(500).json({ error: 'Failed to process payout.' });
  }
});

export default router;
