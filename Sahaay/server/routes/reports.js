import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { optionalAuth, authenticateToken, requireRole } from '../auth.js';
import { assessIncident } from '../services/aiClassifier.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${uniqueSuffix}${ext || '.jpg'}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

const router = express.Router();

// Helper to format report object from DB row
function formatReport(r) {
  return {
    id: r.id,
    trackingNumber: r.tracking_number,
    title: r.title,
    category: r.category,
    type: r.type,
    urgency: r.urgency,
    status: r.status,
    safetyClearance: r.safety_clearance,
    isEmergencyEscalation: Boolean(r.is_emergency_escalation),
    emergencyContactNote: r.emergency_contact_note,
    address: r.address,
    city: r.city,
    landmark: r.landmark,
    lat: r.lat,
    lng: r.lng,
    description: r.description,
    photos: r.photos ? JSON.parse(r.photos) : [],
    reporterId: r.reporter_id,
    reporterName: r.reporter_name,
    reporterPhone: r.reporter_phone,
    reporterEmail: r.reporter_email,
    isAnonymous: Boolean(r.is_anonymous),
    assignedWorkerId: r.assigned_worker_id,
    assignedWorkerName: r.assigned_worker_name,
    assignedOrgId: r.assigned_org_id,
    assignedOrgName: r.assigned_org_name,
    statusHistory: r.status_history ? JSON.parse(r.status_history) : [],
    isDemo: Boolean(r.is_demo),
    // AI Assessment fields
    aiCategory: r.ai_category,
    aiUrgency: r.ai_urgency,
    aiExplanation: r.ai_explanation,
    aiConfidence: r.ai_confidence,
    aiMissingInfo: r.ai_missing_info,
    aiAmbiguityFlag: Boolean(r.ai_ambiguity_flag),
    imageVerificationStatus: r.image_verification_status,
    imageVerificationNotes: r.image_verification_notes,
    locationConsistencyStatus: r.location_consistency_status,
    locationConsistencyNotes: r.location_consistency_notes,
    deviceLat: r.device_lat,
    deviceLng: r.device_lng,
    photoLat: r.photo_lat,
    photoLng: r.photo_lng,
    humanReviewStatus: r.human_review_status,
    humanReviewerNotes: r.human_reviewer_notes,
    reviewedBy: r.reviewed_by,
    reviewedAt: r.reviewed_at,
    inputLanguage: r.input_language,
    createdAt: r.created_at,
  };
}

// 1. GET ALL REPORTS (with filtering & personal data segregation)
router.get('/', optionalAuth, (req, res) => {
  try {
    const { city, urgency, status, myReports, search } = req.query;

    let query = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    // If myReports=true is requested, ensure user is authenticated and filter by reporter_id
    if (myReports === 'true') {
      if (!req.user) {
        return res.status(401).json({ error: 'Please sign in to view your reports.' });
      }
      query += ' AND reporter_id = ?';
      params.push(req.user.id);
    }

    if (city && city !== 'All Cities') {
      query += ' AND LOWER(city) = LOWER(?)';
      params.push(city);
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
    res.json(rows.map(formatReport));
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ error: 'Failed to retrieve incident reports.' });
  }
});

// 2. GET SINGLE REPORT BY ID OR TRACKING NUMBER
router.get('/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    const report = db.prepare(
      'SELECT * FROM reports WHERE id = ? OR LOWER(tracking_number) = LOWER(?)'
    ).get(identifier, identifier);

    if (!report) {
      return res.status(404).json({ error: 'Incident report not found.' });
    }

    res.json(formatReport(report));
  } catch (err) {
    console.error('Fetch single report error:', err);
    res.status(500).json({ error: 'Error fetching report details.' });
  }
});

// 2.5 LIVE AI ASSESSMENT PREVIEW (Fast real-time feedback while citizen types/speaks)
router.post('/assess-preview', async (req, res) => {
  try {
    const { description, categoryHint, lat, lng, deviceLat, deviceLng, photoLat, photoLng, photoUrls } = req.body;
    const assessment = await assessIncident({
      description: description || '',
      categoryHint,
      lat: lat != null ? parseFloat(lat) : null,
      lng: lng != null ? parseFloat(lng) : null,
      deviceLat: deviceLat != null ? parseFloat(deviceLat) : null,
      deviceLng: deviceLng != null ? parseFloat(deviceLng) : null,
      photoLat: photoLat != null ? parseFloat(photoLat) : null,
      photoLng: photoLng != null ? parseFloat(photoLng) : null,
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
    });
    res.json(assessment);
  } catch (err) {
    console.error('Assessment preview error:', err);
    res.status(500).json({ error: 'Failed to generate assessment preview.' });
  }
});

// 3. CREATE NEW REPORT (Citizen or Public with optional photo uploads)
// Enforces server-side AI categorization, urgency assessment, and evidence cross-check
router.post('/', optionalAuth, upload.array('photos', 5), async (req, res) => {
  try {
    const {
      title,
      type = 'Injured Stray',
      address,
      city = 'Pune',
      landmark = '',
      lat,
      lng,
      deviceLat,
      deviceLng,
      photoLat,
      photoLng,
      description,
      isAnonymous = 'false',
      reporterName = '',
      reporterPhone = '',
      reporterEmail = '',
      safetyClearance = 'Community Level (Tier 1)',
      isEmergencyEscalation = 'false',
      emergencyContactNote = '',
    } = req.body;

    if (!address || !description || !lat || !lng) {
      return res.status(400).json({ error: 'Address, latitude, longitude, and description are required.' });
    }

    const reportId = `rep-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingNumber = `SHY-2026-${randomSuffix}`;

    // Handle photo paths
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = req.files.map(f => `/uploads/${f.filename}`);
    } else if (req.body.photoUrls) {
      try {
        photoUrls = JSON.parse(req.body.photoUrls);
      } catch {
        photoUrls = Array.isArray(req.body.photoUrls) ? req.body.photoUrls : [req.body.photoUrls];
      }
    }

    // Default fallback image if none provided
    if (photoUrls.length === 0) {
      photoUrls = ['https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80'];
    }

    // Determine reporter info
    let finalReporterId = null;
    let finalReporterName = reporterName || 'Anonymous Citizen';
    let finalReporterPhone = reporterPhone || '';
    let finalReporterEmail = reporterEmail || '';
    const anon = isAnonymous === 'true' || isAnonymous === true;

    if (req.user) {
      finalReporterId = req.user.id;
      if (!anon) {
        finalReporterName = req.user.name;
        finalReporterEmail = req.user.email;
      }
    }

    // Execute genuine server-side AI incident assessment
    // Citizens cannot overwrite or spoof the final AI assessment directly!
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    const parsedDevLat = deviceLat != null && deviceLat !== '' ? parseFloat(deviceLat) : null;
    const parsedDevLng = deviceLng != null && deviceLng !== '' ? parseFloat(deviceLng) : null;
    const parsedPhotoLat = photoLat != null && photoLat !== '' ? parseFloat(photoLat) : null;
    const parsedPhotoLng = photoLng != null && photoLng !== '' ? parseFloat(photoLng) : null;

    const assessment = await assessIncident({
      description,
      lat: parsedLat,
      lng: parsedLng,
      deviceLat: parsedDevLat,
      deviceLng: parsedDevLng,
      photoLat: parsedPhotoLat,
      photoLng: parsedPhotoLng,
      photoUrls
    });

    // Format display category & urgency
    const categoryCapitalized = assessment.aiCategory.charAt(0).toUpperCase() + assessment.aiCategory.slice(1);
    const urgencyCapitalized = assessment.aiUrgency === 'needs_review' 
      ? 'Needs Review' 
      : assessment.aiUrgency.charAt(0).toUpperCase() + assessment.aiUrgency.slice(1);

    const initialHistory = [
      {
        status: 'Reported',
        note: 'Incident registered in Sahaay civic ledger.',
        timestamp: new Date().toISOString(),
      },
      {
        status: 'AI Triage Completed',
        note: `AI classified as ${categoryCapitalized} with ${urgencyCapitalized} urgency (${Math.round(assessment.aiConfidence * 100)}% confidence). Location evidence: ${assessment.locationConsistency.status}.`,
        timestamp: new Date().toISOString(),
      }
    ];

    if (assessment.aiUrgency === 'critical' || assessment.aiAmbiguityFlag || !assessment.locationConsistency.consistent) {
      initialHistory.push({
        status: 'Flagged for Human Review',
        note: `Assigned priority queue for Organisation inspection. Reason: ${assessment.aiUrgency === 'critical' ? 'Critical trauma' : assessment.aiExplanation}`,
        timestamp: new Date().toISOString(),
      });
    }

    const finalTitle = title || `${type} (${categoryCapitalized}) reported at ${address.split(',')[0]}`;

    db.prepare(`
      INSERT INTO reports (
        id, tracking_number, title, category, type, urgency, status,
        safety_clearance, is_emergency_escalation, emergency_contact_note,
        address, city, landmark, lat, lng, description, photos,
        reporter_id, reporter_name, reporter_phone, reporter_email,
        is_anonymous, status_history, is_demo,
        ai_category, ai_urgency, ai_explanation, ai_confidence, ai_missing_info, ai_ambiguity_flag,
        image_verification_status, image_verification_notes,
        location_consistency_status, location_consistency_notes,
        device_lat, device_lng, photo_lat, photo_lng,
        human_review_status, input_language
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 'Reported',
        ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, 0,
        ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?,
        ?, ?, ?, ?,
        'pending', ?
      )
    `).run(
      reportId,
      trackingNumber,
      finalTitle,
      categoryCapitalized,
      type,
      urgencyCapitalized,
      safetyClearance,
      isEmergencyEscalation === 'true' || isEmergencyEscalation === true ? 1 : 0,
      emergencyContactNote || null,
      address,
      city,
      landmark || null,
      parsedLat,
      parsedLng,
      description,
      JSON.stringify(photoUrls),
      finalReporterId,
      finalReporterName,
      finalReporterPhone,
      finalReporterEmail,
      anon ? 1 : 0,
      JSON.stringify(initialHistory),
      assessment.aiCategory,
      assessment.aiUrgency,
      assessment.aiExplanation,
      assessment.aiConfidence,
      assessment.aiMissingInfo,
      assessment.aiAmbiguityFlag ? 1 : 0,
      assessment.imageVerification.status,
      assessment.imageVerification.notes,
      assessment.locationConsistency.status,
      assessment.locationConsistency.notes,
      parsedDevLat,
      parsedDevLng,
      parsedPhotoLat,
      parsedPhotoLng,
      assessment.inputLanguage
    );

    // Automatically create a corresponding task in SQLite so community workers can act
    const taskId = `tsk-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const proposedPayment = assessment.aiUrgency === 'critical' ? 700 : assessment.aiUrgency === 'high' ? 500 : 350;

    db.prepare(`
      INSERT INTO tasks (
        id, report_id, tracking_number, title, category, urgency, status,
        safety_clearance, address, city, lat, lng, description, instructions,
        required_equipment, proposed_payment, payment_status, estimated_hours, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 2, 0)
    `).run(
      taskId,
      reportId,
      trackingNumber,
      `Attend: ${finalTitle}`,
      categoryCapitalized,
      urgencyCapitalized,
      safetyClearance,
      address,
      city,
      parsedLat,
      parsedLng,
      description,
      JSON.stringify(['Visit location and assess condition', 'Provide immediate basic assistance or first aid', 'Photograph condition and upload completion proof']),
      JSON.stringify(['Safety Gloves', 'First Aid Kit', 'Clean Water / Leash']),
      proposedPayment
    );

    const created = db.prepare('SELECT * FROM reports WHERE id = ?').get(reportId);

    res.status(201).json({
      message: 'Incident reported successfully. A community response task has been generated.',
      trackingNumber,
      report: formatReport(created),
    });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Failed to record incident report.' });
  }
});

// 4. UPDATE REPORT STATUS (Organisation or Assigned Worker)
router.patch('/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assignedWorkerId, assignedWorkerName, assignedOrgName } = req.body;

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const history = report.status_history ? JSON.parse(report.status_history) : [];
    history.push({
      status: status || report.status,
      note: note || `Status updated by ${req.user.name} (${req.user.role})`,
      timestamp: new Date().toISOString(),
    });

    db.prepare(`
      UPDATE reports
      SET status = COALESCE(?, status),
          assigned_worker_id = COALESCE(?, assigned_worker_id),
          assigned_worker_name = COALESCE(?, assigned_worker_name),
          assigned_org_name = COALESCE(?, assigned_org_name),
          status_history = ?
      WHERE id = ?
    `).run(
      status || null,
      assignedWorkerId || null,
      assignedWorkerName || null,
      assignedOrgName || null,
      JSON.stringify(history),
      id
    );

    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    res.json({ message: 'Report updated successfully.', report: formatReport(updated) });
  } catch (err) {
    console.error('Update report error:', err);
    res.status(500).json({ error: 'Failed to update report status.' });
  }
});

// 5. HUMAN REVIEW DECISION (Authorised Organisation Staff)
router.post('/:id/review', authenticateToken, requireRole(['organisation']), (req, res) => {
  try {
    const { id } = req.params;
    const { decision, notes, revisedCategory, revisedUrgency } = req.body;

    if (!['approved', 'modified', 'rejected'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision. Must be approved, modified, or rejected.' });
    }

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const history = report.status_history ? JSON.parse(report.status_history) : [];
    history.push({
      status: `Human Review: ${decision.toUpperCase()}`,
      note: notes || `Reviewed by organisation officer ${req.user.name}`,
      timestamp: new Date().toISOString(),
    });

    db.prepare(`
      UPDATE reports
      SET human_review_status = ?,
          human_reviewer_notes = ?,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP,
          category = COALESCE(?, category),
          urgency = COALESCE(?, urgency),
          status_history = ?
      WHERE id = ?
    `).run(
      decision,
      notes || null,
      req.user.name,
      revisedCategory || null,
      revisedUrgency || null,
      JSON.stringify(history),
      id
    );

    const updated = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    res.json({ message: `Human review recorded: ${decision}.`, report: formatReport(updated) });
  } catch (err) {
    console.error('Record human review error:', err);
    res.status(500).json({ error: 'Failed to save human review decision.' });
  }
});

export default router;
