import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { authenticateToken, optionalAuth, requireRole } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || '.jpg'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = express.Router();

function formatTask(t) {
  const normStatus = (t.status || '').toLowerCase().trim();
  let status = t.status;
  if (normStatus === 'open' || normStatus === 'available') status = 'available';
  else if (normStatus === 'in progress' || normStatus === 'in_progress') status = 'in_progress';
  else if (normStatus === 'under review' || normStatus === 'submitted_for_review') status = 'submitted_for_review';
  else if (normStatus === 'completed') status = 'completed';
  else if (normStatus === 'claimed') status = 'claimed';

  return {
    id: t.id,
    reportId: t.report_id,
    trackingNumber: t.tracking_number,
    title: t.title,
    category: t.category,
    urgency: t.urgency,
    status: status,
    rawStatus: t.status,
    safetyClearance: t.safety_clearance,
    address: t.address,
    city: t.city,
    lat: t.lat,
    lng: t.lng,
    location: {
      address: t.address,
      city: t.city,
      lat: t.lat,
      lng: t.lng,
    },
    description: t.description,
    instructions: t.instructions ? JSON.parse(t.instructions) : [],
    requiredEquipment: t.required_equipment ? JSON.parse(t.required_equipment) : [],
    proposedPayment: t.proposed_payment,
    paymentStatus: t.payment_status,
    estimatedHours: t.estimated_hours,
    assignedWorkerId: t.assigned_worker_id,
    assignedWorkerName: t.assigned_worker_name,
    completionNotes: t.completion_notes,
    completionProofPhotos: t.completion_proof_photos ? JSON.parse(t.completion_proof_photos) : [],
    isDemo: Boolean(t.is_demo),
    createdAt: t.created_at,
    completedAt: t.completed_at,
  };
}

// 1. GET TASKS (with filters & worker isolation)
router.get('/', optionalAuth, (req, res) => {
  try {
    const { city, category, urgency, status, myTasks, search } = req.query;

    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    // Worker myTasks filter
    if (myTasks === 'true') {
      if (!req.user) {
        return res.status(401).json({ error: 'Sign in to access your assigned tasks.' });
      }
      query += ' AND assigned_worker_id = ?';
      params.push(req.user.id);
    }

    if (city && city !== 'All Cities') {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
    }

    if (category && category !== 'all') {
      query += ' AND LOWER(category) = LOWER(?)';
      params.push(category);
    }

    if (urgency && urgency !== 'all') {
      query += ' AND LOWER(urgency) = LOWER(?)';
      params.push(urgency);
    }

    if (status && status !== 'all') {
      query += ' AND LOWER(status) = LOWER(?)';
      params.push(status);
    }

    if (search) {
      query += ' AND (tracking_number LIKE ? OR title LIKE ? OR address LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatTask));
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// 2. GET SINGLE TASK
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    res.json(formatTask(task));
  } catch (err) {
    console.error('Fetch task detail error:', err);
    res.status(500).json({ error: 'Failed to retrieve task details.' });
  }
});

// 3. CREATE TASK (Organisation manual dispatch)
router.post('/', authenticateToken, requireRole(['organisation']), (req, res) => {
  try {
    const {
      reportId,
      trackingNumber,
      title,
      category,
      urgency = 'medium',
      safetyClearance = 'community_safe',
      address,
      city = 'Pune',
      lat = 18.5204,
      lng = 73.8567,
      description,
      instructions = [],
      requiredEquipment = [],
      proposedPayment = 400,
      estimatedHours = 2,
      assignedWorkerId,
      assignedWorkerName,
    } = req.body;

    if (!title || !address || !description) {
      return res.status(400).json({ error: 'Task title, address, and description are required.' });
    }

    const taskId = `tsk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const finalTracking = trackingNumber || `SHY-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let finalStatus = 'available';
    let workerId = null;
    let workerName = null;

    if (assignedWorkerId) {
      workerId = assignedWorkerId;
      if (assignedWorkerName) {
        workerName = assignedWorkerName;
      } else {
        const workerRow = db.prepare('SELECT name FROM workers WHERE id = ?').get(assignedWorkerId) ||
                          db.prepare('SELECT name FROM users WHERE id = ?').get(assignedWorkerId);
        workerName = workerRow?.name || 'Assigned Worker';
      }
      finalStatus = 'claimed';
    }

    db.prepare(`
      INSERT INTO tasks (
        id, report_id, tracking_number, title, category, urgency, status,
        safety_clearance, address, city, lat, lng, description, instructions,
        required_equipment, proposed_payment, payment_status, estimated_hours,
        assigned_worker_id, assigned_worker_name, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 0)
    `).run(
      taskId,
      reportId || 'ad-hoc',
      finalTracking,
      title,
      category || 'dog',
      urgency,
      finalStatus,
      safetyClearance,
      address,
      city,
      parseFloat(lat) || 18.5204,
      parseFloat(lng) || 73.8567,
      description,
      JSON.stringify(Array.isArray(instructions) ? instructions : [instructions].filter(Boolean)),
      JSON.stringify(Array.isArray(requiredEquipment) ? requiredEquipment : []),
      parseFloat(proposedPayment) || 350,
      parseFloat(estimatedHours) || 1.5,
      workerId,
      workerName
    );

    const created = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
    res.status(201).json({ message: 'Task dispatched successfully.', task: formatTask(created) });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// 4. CLAIM TASK (Worker accepts task)
router.patch('/:id/claim', authenticateToken, requireRole(['worker']), (req, res) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;
    const workerName = req.user.name;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.status.toLowerCase() !== 'open' && task.status.toLowerCase() !== 'available') {
      return res.status(400).json({ error: `Task is already ${task.status} and cannot be claimed.` });
    }

    // Check if worker needs specific clearance
    const worker = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(workerId);
    if (task.safety_clearance && task.safety_clearance.includes('Veterinary') && (!worker || worker.safety_tier !== 'Professional Veterinary Staff')) {
      return res.status(403).json({ error: 'This task requires Professional Veterinary Staff clearance.' });
    }

    db.prepare(`
      UPDATE tasks
      SET status = 'In Progress',
          assigned_worker_id = ?,
          assigned_worker_name = ?
      WHERE id = ?
    `).run(workerId, workerName, id);

    // Update linked report if exists
    if (task.report_id && task.report_id !== 'ad-hoc') {
      const rep = db.prepare('SELECT * FROM reports WHERE id = ?').get(task.report_id);
      if (rep) {
        const history = rep.status_history ? JSON.parse(rep.status_history) : [];
        history.push({
          status: 'Assigned',
          note: `Claimed by community worker ${workerName}`,
          timestamp: new Date().toISOString(),
        });
        db.prepare(`
          UPDATE reports
          SET status = 'Assigned',
              assigned_worker_id = ?,
              assigned_worker_name = ?,
              status_history = ?
          WHERE id = ?
        `).run(workerId, workerName, JSON.stringify(history), task.report_id);
      }
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({ message: 'Task claimed successfully!', task: formatTask(updated) });
  } catch (err) {
    console.error('Claim task error:', err);
    res.status(500).json({ error: 'Failed to claim task.' });
  }
});

// 5. SUBMIT TASK PROOF OF COMPLETION (Worker)
router.patch('/:id/submit-proof', authenticateToken, requireRole(['worker']), upload.array('proofPhotos', 4), (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.assigned_worker_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not assigned to this task.' });
    }

    let proofUrls = [];
    if (req.files && req.files.length > 0) {
      proofUrls = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.body.proofUrls) {
      try {
        proofUrls = JSON.parse(req.body.proofUrls);
      } catch {
        proofUrls = Array.isArray(req.body.proofUrls) ? req.body.proofUrls : [req.body.proofUrls];
      }
    }

    if (proofUrls.length === 0) {
      proofUrls = ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'];
    }

    db.prepare(`
      UPDATE tasks
      SET status = 'Under Review',
          completion_notes = ?,
          completion_proof_photos = ?
      WHERE id = ?
    `).run(notes || 'Work completed per safety guidelines.', JSON.stringify(proofUrls), id);

    // Also update report timeline
    if (task.report_id && task.report_id !== 'ad-hoc') {
      const rep = db.prepare('SELECT * FROM reports WHERE id = ?').get(task.report_id);
      if (rep) {
        const history = rep.status_history ? JSON.parse(rep.status_history) : [];
        history.push({
          status: 'Under Review',
          note: `Completion proof submitted by ${req.user.name}. Pending review.`,
          timestamp: new Date().toISOString(),
        });
        db.prepare(`UPDATE reports SET status = 'Under Review', status_history = ? WHERE id = ?`).run(
          JSON.stringify(history),
          task.report_id
        );
      }
    }

    const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json({ message: 'Proof submitted successfully for organisation review.', task: formatTask(updated) });
  } catch (err) {
    console.error('Submit proof error:', err);
    res.status(500).json({ error: 'Failed to submit task proof.' });
  }
});

// 6. REVIEW TASK COMPLETION (Organisation Approves/Rejects)
router.patch('/:id/review', authenticateToken, requireRole(['organisation']), (req, res) => {
  try {
    const { id } = req.params;
    const { action, feedback } = req.body; // action: 'approve' | 'reject'

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (action === 'approve') {
      const now = new Date().toISOString();

      db.prepare(`
        UPDATE tasks
        SET status = 'Completed',
            payment_status = 'Approved (Simulated Payout Queued)',
            completed_at = ?
        WHERE id = ?
      `).run(now, id);

      // Create simulated payout record
      const payoutId = `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      db.prepare(`
        INSERT INTO payouts (
          id, worker_id, worker_name, task_id, task_title, amount,
          status, method, payout_ref, is_simulated
        ) VALUES (?, ?, ?, ?, ?, ?, 'Completed (Simulated)', 'UPI-Direct', ?, 1)
      `).run(
        payoutId,
        task.assigned_worker_id || 'unknown',
        task.assigned_worker_name || 'Worker',
        task.id,
        task.title,
        task.proposed_payment,
        `SIM-PAY-${Math.floor(100000 + Math.random() * 900000)}`
      );

      // Increment worker's completed tasks and simulated balance
      if (task.assigned_worker_id) {
        db.prepare(`
          UPDATE workers
          SET tasks_completed = tasks_completed + 1,
              simulated_balance = simulated_balance + ?
          WHERE user_id = ?
        `).run(task.proposed_payment, task.assigned_worker_id);
      }

      // Mark report Resolved
      if (task.report_id && task.report_id !== 'ad-hoc') {
        const rep = db.prepare('SELECT * FROM reports WHERE id = ?').get(task.report_id);
        if (rep) {
          const history = rep.status_history ? JSON.parse(rep.status_history) : [];
          history.push({
            status: 'Resolved',
            note: `Verified & Approved by ${req.user.name}. ${feedback || 'Task satisfactorily completed.'}`,
            timestamp: now,
          });
          db.prepare(`UPDATE reports SET status = 'Resolved', status_history = ? WHERE id = ?`).run(
            JSON.stringify(history),
            task.report_id
          );
        }
      }

      res.json({ message: 'Task approved. Simulated payment released to worker balance.' });
    } else {
      // Rejection
      db.prepare(`
        UPDATE tasks
        SET status = 'In Progress',
            completion_notes = completion_notes || '\n[Reviewer note: ' || ? || ']'
        WHERE id = ?
      `).run(feedback || 'Additional proof or follow-up needed.', id);

      res.json({ message: 'Task marked for revision.' });
    }
  } catch (err) {
    console.error('Review task error:', err);
    res.status(500).json({ error: 'Failed to review task.' });
  }
});

export default router;
