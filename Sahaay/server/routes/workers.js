import express from 'express';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../auth.js';

const router = express.Router();

function formatWorker(w) {
  return {
    id: w.id,
    userId: w.user_id,
    name: w.name,
    phone: w.phone,
    city: w.city,
    avatar: w.avatar,
    badge: w.badge,
    isAvailable: Boolean(w.is_available),
    rating: w.rating,
    tasksCompleted: w.tasks_completed,
    trainingCompleted: Boolean(w.training_completed),
    safetyTier: w.safety_tier,
    completedModules: w.completed_modules ? JSON.parse(w.completed_modules) : [],
    verificationStatus: w.verification_status,
    simulatedBalance: w.simulated_balance,
    createdAt: w.created_at,
  };
}

// 1. GET ALL WORKERS (for Organisations)
router.get('/', authenticateToken, requireRole(['organisation']), (req, res) => {
  try {
    const { city, available } = req.query;
    let query = 'SELECT * FROM workers WHERE 1=1';
    const params = [];

    if (city && city !== 'All Cities') {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
    }

    if (available === 'true') {
      query += ' AND is_available = 1';
    }

    query += ' ORDER BY tasks_completed DESC, rating DESC';
    const workers = db.prepare(query).all(...params);
    res.json(workers.map(formatWorker));
  } catch (err) {
    console.error('Fetch workers error:', err);
    res.status(500).json({ error: 'Failed to retrieve workers list.' });
  }
});

// 2. GET CURRENT WORKER PROFILE & TRAINING STATE
router.get('/me', authenticateToken, requireRole(['worker']), (req, res) => {
  try {
    const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker profile not found.' });
    }
    res.json(formatWorker(worker));
  } catch (err) {
    console.error('Fetch worker me error:', err);
    res.status(500).json({ error: 'Failed to fetch worker profile.' });
  }
});

// 3. TOGGLE AVAILABILITY
router.patch('/availability', authenticateToken, requireRole(['worker']), (req, res) => {
  try {
    const { isAvailable } = req.body;
    db.prepare('UPDATE workers SET is_available = ? WHERE user_id = ?').run(
      isAvailable ? 1 : 0,
      req.user.id
    );

    const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
    res.json({ message: 'Availability status updated.', isAvailable: Boolean(worker.is_available) });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Failed to update availability.' });
  }
});

// 4. SUBMIT / UPDATE TRAINING COMPLETION & QUIZ RESULTS
router.post('/training', authenticateToken, requireRole(['worker']), (req, res) => {
  try {
    const { moduleId, moduleIds, quizScore, score, completedAll } = req.body;

    const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker record not found.' });
    }

    let modules = worker.completed_modules ? JSON.parse(worker.completed_modules) : [];
    if (moduleId && !modules.includes(moduleId)) {
      modules.push(moduleId);
    }
    if (Array.isArray(moduleIds)) {
      moduleIds.forEach(id => {
        if (!modules.includes(id)) modules.push(id);
      });
    }

    const finalScore = quizScore ?? score;

    // Determine safety tier honestly: passing civic animal safety training qualifies as
    // 'Certified Animal Handler' (Tier 2), NOT veterinary doctor.
    let newTier = worker.safety_tier;
    let isFullyTrained = worker.training_completed;

    if (completedAll || modules.length >= 3 || (finalScore !== undefined && finalScore >= 80)) {
      isFullyTrained = 1;
      newTier = 'Certified Animal Handler';
    }

    db.prepare(`
      UPDATE workers
      SET completed_modules = ?,
          training_completed = ?,
          safety_tier = ?
      WHERE user_id = ?
    `).run(JSON.stringify(modules), isFullyTrained, newTier, req.user.id);

    // Also update users table
    db.prepare(`
      UPDATE users
      SET training_completed = ?,
          training_quiz_score = COALESCE(?, training_quiz_score),
          safety_tier = ?
      WHERE id = ?
    `).run(isFullyTrained, finalScore || null, newTier, req.user.id);

    const updated = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(req.user.id);
    const formatted = formatWorker(updated);
    res.json({
      message: 'Training progress recorded successfully.',
      trainingCompleted: Boolean(isFullyTrained),
      safetyTier: newTier,
      worker: formatted,
    });
  } catch (err) {
    console.error('Update training error:', err);
    res.status(500).json({ error: 'Failed to record training progress.' });
  }
});

export default router;
