import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure db directory and uploads directory exist
const dbPath = path.join(__dirname, 'sahaay.db');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      avatar TEXT,
      title TEXT,
      badge TEXT,
      verification_status TEXT DEFAULT 'verified',
      skills TEXT,
      experience TEXT,
      org_reg_number TEXT,
      service_area TEXT,
      training_completed INTEGER DEFAULT 0,
      training_quiz_score INTEGER DEFAULT 0,
      safety_tier TEXT DEFAULT 'Basic Community Responder',
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      tracking_number TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      urgency TEXT NOT NULL,
      status TEXT NOT NULL,
      safety_clearance TEXT NOT NULL,
      is_emergency_escalation INTEGER DEFAULT 0,
      emergency_contact_note TEXT,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      landmark TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      description TEXT NOT NULL,
      photos TEXT, -- JSON array of strings
      reporter_id TEXT,
      reporter_name TEXT,
      reporter_phone TEXT,
      reporter_email TEXT,
      is_anonymous INTEGER DEFAULT 0,
      assigned_worker_id TEXT,
      assigned_worker_name TEXT,
      assigned_org_id TEXT,
      assigned_org_name TEXT,
      status_history TEXT, -- JSON array of timeline events
      is_demo INTEGER DEFAULT 0,
      ai_category TEXT,
      ai_urgency TEXT,
      ai_explanation TEXT,
      ai_confidence REAL,
      ai_missing_info TEXT,
      ai_ambiguity_flag INTEGER DEFAULT 0,
      image_verification_status TEXT,
      image_verification_notes TEXT,
      location_consistency_status TEXT,
      location_consistency_notes TEXT,
      device_lat REAL,
      device_lng REAL,
      photo_lat REAL,
      photo_lng REAL,
      human_review_status TEXT DEFAULT 'pending',
      human_reviewer_notes TEXT,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      input_language TEXT DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL,
      tracking_number TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      urgency TEXT NOT NULL,
      status TEXT NOT NULL,
      safety_clearance TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      description TEXT NOT NULL,
      instructions TEXT, -- JSON array
      required_equipment TEXT, -- JSON array
      proposed_payment REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      estimated_hours REAL,
      assigned_worker_id TEXT,
      assigned_worker_name TEXT,
      completion_notes TEXT,
      completion_proof_photos TEXT, -- JSON array
      is_demo INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      phone TEXT,
      city TEXT,
      avatar TEXT,
      badge TEXT,
      is_available INTEGER DEFAULT 1,
      rating REAL DEFAULT 5.0,
      tasks_completed INTEGER DEFAULT 0,
      training_completed INTEGER DEFAULT 0,
      safety_tier TEXT DEFAULT 'Basic Community Responder',
      completed_modules TEXT DEFAULT '[]', -- JSON array
      verification_status TEXT DEFAULT 'pending',
      simulated_balance REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      worker_name TEXT,
      task_id TEXT NOT NULL,
      task_title TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      method TEXT DEFAULT 'UPI',
      payout_ref TEXT,
      is_simulated INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME
    );
  `);

  // Safe backward-compatible migrations for existing databases
  safeMigrateReports();

  seedInitialData();
}

function safeMigrateReports() {
  try {
    const existingCols = db.prepare("PRAGMA table_info(reports)").all().map(c => c.name);
    const newCols = [
      { name: 'ai_category', type: 'TEXT' },
      { name: 'ai_urgency', type: 'TEXT' },
      { name: 'ai_explanation', type: 'TEXT' },
      { name: 'ai_confidence', type: 'REAL' },
      { name: 'ai_missing_info', type: 'TEXT' },
      { name: 'ai_ambiguity_flag', type: 'INTEGER DEFAULT 0' },
      { name: 'image_verification_status', type: 'TEXT' },
      { name: 'image_verification_notes', type: 'TEXT' },
      { name: 'location_consistency_status', type: 'TEXT' },
      { name: 'location_consistency_notes', type: 'TEXT' },
      { name: 'device_lat', type: 'REAL' },
      { name: 'device_lng', type: 'REAL' },
      { name: 'photo_lat', type: 'REAL' },
      { name: 'photo_lng', type: 'REAL' },
      { name: 'human_review_status', type: "TEXT DEFAULT 'pending'" },
      { name: 'human_reviewer_notes', type: 'TEXT' },
      { name: 'reviewed_by', type: 'TEXT' },
      { name: 'reviewed_at', type: 'DATETIME' },
      { name: 'input_language', type: "TEXT DEFAULT 'en'" },
    ];

    for (const col of newCols) {
      if (!existingCols.includes(col.name)) {
        db.exec(`ALTER TABLE reports ADD COLUMN ${col.name} ${col.type}`);
      }
    }
  } catch (err) {
    console.error('Migration warning (safeMigrateReports):', err.message);
  }
}

// Seed Demo Users, Reports, and Tasks if not already populated
function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync('password123', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, phone, city, avatar, title, badge, verification_status, is_demo, safety_tier, training_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 1. Citizen Demo (Priya Sharma)
    insertUser.run(
      'cit-001',
      'Priya Sharma',
      'priya.sharma@example.com',
      passwordHash,
      'citizen',
      '+91 98231 44552',
      'Pune',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'Active Citizen Reporter',
      'Civic Guardian Level 2',
      'verified',
      1,
      'Community Member',
      0
    );

    // 2. Worker Demo (Rahul Verma)
    insertUser.run(
      'wrk-101',
      'Rahul Verma',
      'rahul.verma@example.com',
      passwordHash,
      'worker',
      '+91 98221 00012',
      'Nagpur',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'Certified Community Service Worker',
      'Certified Tier 2 Handler',
      'verified',
      1,
      'Certified Animal Handler',
      1
    );

    // 3. Organisation Demo (Dr. Sunita Kulkarni / Sahaay Partner NGO)
    insertUser.run(
      'org-admin-1',
      'Dr. Sunita Kulkarni',
      'coordinator@sahaaytrust.org',
      passwordHash,
      'organisation',
      '+91 20 2567 8900',
      'Nagpur & Pune',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      'Field Operations Coordinator (Sahaay Partner NGO)',
      'Registered Welfare Organisation',
      'verified',
      1,
      'Organisation Administrator',
      1
    );

    // Insert Rahul into workers table
    db.prepare(`
      INSERT INTO workers (
        id, user_id, name, phone, city, avatar, badge, is_available, rating, tasks_completed, training_completed, safety_tier, completed_modules, verification_status, simulated_balance
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'wrk-101',
      'wrk-101',
      'Rahul Verma',
      '+91 98221 00012',
      'Nagpur',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'Certified Tier 2 Handler',
      1,
      4.92,
      38,
      1,
      'Certified Animal Handler',
      JSON.stringify(['mod-1', 'mod-2']),
      'verified',
      2450
    );
  }

  // Seed Initial Demo Reports if empty
  const reportCount = db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
  if (reportCount === 0) {
    const insertReport = db.prepare(`
      INSERT INTO reports (
        id, tracking_number, title, category, type, urgency, status, safety_clearance,
        is_emergency_escalation, emergency_contact_note, address, city, landmark, lat, lng,
        description, photos, reporter_id, reporter_name, reporter_phone, reporter_email,
        assigned_worker_id, assigned_worker_name, assigned_org_id, assigned_org_name, status_history, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // rep-001 (Pune)
    insertReport.run(
      'rep-001',
      'SHY-2026-0891',
      'Injured stray dog limping near Baner Hill Trail',
      'dog',
      'injured_animal',
      'high',
      'in_progress',
      'trained_only',
      0,
      null,
      'Near Cafe Peter, Baner Hill Foot, Baner',
      'Pune',
      'Next to Community Garden Gate 2',
      18.5590,
      73.7868,
      'Medium brown indie dog with visible swelling and limping on left hind leg. Friendly but hesitant.',
      JSON.stringify(['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80']),
      'cit-001',
      'Priya Sharma (Citizen Demo)',
      '+91 98231 44552',
      'priya.sharma@example.com',
      'wrk-101',
      'Rahul Verma (Certified Animal Handler)',
      'org-01',
      'Pune Animal Welfare Alliance',
      JSON.stringify([
        { status: 'submitted', timestamp: '2026-10-16 09:30 AM', note: 'Report submitted by citizen.', actor: 'Citizen (Priya Sharma)' },
        { status: 'in_progress', timestamp: '2026-10-16 10:30 AM', note: 'Worker Rahul Verma accepted task and is on-site.', actor: 'Worker (Rahul Verma)' }
      ]),
      1
    );

    // rep-002 (Pune)
    insertReport.run(
      'rep-002',
      'SHY-2026-0892',
      'Litter of 4 orphaned kittens in cardboard box',
      'cat',
      'puppies_kittens_care',
      'medium',
      'task_created',
      'community_safe',
      0,
      null,
      'Lane 7, Behind Blue Ridge Tower 4, Hinjawadi Phase 1',
      'Pune',
      'Behind electrical transformer shed',
      18.5913,
      73.7389,
      'Four very young kittens found without mother. Dehydrated and mewing. Immediate feeding needed.',
      JSON.stringify(['https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80']),
      'demo-cit-2',
      'Aditya Patil',
      '+91 97654 11223',
      'aditya.p@example.com',
      null,
      null,
      'org-01',
      'Pune Animal Welfare Alliance',
      JSON.stringify([
        { status: 'submitted', timestamp: '2026-10-16 11:15 AM', note: 'Report submitted.', actor: 'Citizen' },
        { status: 'task_created', timestamp: '2026-10-16 11:30 AM', note: 'Task created.', actor: 'Org System' }
      ]),
      1
    );

    // rep-003 (Pune) - Emergency Rabies
    insertReport.run(
      'rep-003',
      'SHY-2026-0893',
      'CRITICAL: Severe disorientation & aggression in street dog',
      'dog',
      'rabies_suspicion',
      'critical',
      'escalated',
      'emergency_escalation',
      1,
      'WARNING: Community workers strictly barred. Municipal Rapid Ambulance dispatched with catch-poles.',
      'Near Goodluck Chowk, FC Road, Shivajinagar',
      'Pune',
      'Opposite bus stop shade',
      18.5246,
      73.8415,
      'White indie dog showing hypersalivation, extreme agitation, unprovoked snapping. Rabies symptom profile.',
      JSON.stringify(['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80']),
      'demo-cit-3',
      'Dr. Sameer Joshi',
      '+91 94220 88990',
      'joshi.meds@example.com',
      null,
      null,
      'org-02',
      'Municipal Veterinary Rapid Response',
      JSON.stringify([
        { status: 'submitted', timestamp: '2026-10-16 01:20 PM', note: 'Emergency reported.', actor: 'Citizen' },
        { status: 'escalated', timestamp: '2026-10-16 01:22 PM', note: 'Automated Red-Line Escalation.', actor: 'Safety AI & Vet' }
      ]),
      1
    );

    // rep-007 (Nagpur)
    insertReport.run(
      'rep-007',
      'SHY-2026-0895',
      'Stray puppy trapped in open stormwater drain',
      'dog',
      'injured_animal',
      'high',
      'task_created',
      'community_safe',
      0,
      null,
      'Near Sitabuldi Metro Station Gate 2, Wardha Road',
      'Nagpur',
      'Beside Metro pillar 42',
      21.1447,
      79.0849,
      'Young puppy fell into dry concrete drain approximately 4 feet deep. Whining and unable to climb out.',
      JSON.stringify(['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80']),
      'demo-cit-4',
      'Vikas Meshram',
      '+91 98223 77881',
      'vikas.m@example.com',
      null,
      null,
      'org-03',
      'Nagpur Animal Rescue Mission',
      JSON.stringify([
        { status: 'submitted', timestamp: '2026-10-16 04:00 PM', note: 'Reported by metro commuter.', actor: 'Citizen' },
        { status: 'task_created', timestamp: '2026-10-16 04:15 PM', note: 'Task published.', actor: 'Org System' }
      ]),
      1
    );

    // rep-008 (Nagpur)
    insertReport.run(
      'rep-008',
      'SHY-2026-0896',
      'Injured street cow with fractured foreleg near Traffic Park',
      'cattle',
      'injured_animal',
      'high',
      'in_progress',
      'vet_escort_required',
      0,
      null,
      'West High Court Road, Dharampeth',
      'Nagpur',
      'Near Traffic Park South Gate',
      21.1415,
      79.0620,
      'Elderly cow hit by vehicle. Cannot bear weight on left foreleg. Lying calmly on footpath.',
      JSON.stringify(['https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80']),
      'demo-cit-5',
      'Anjali Deshpande',
      '+91 97640 55432',
      'anjali.d@example.com',
      'wrk-101',
      'Rahul Verma',
      'org-03',
      'Nagpur Animal Rescue Mission',
      JSON.stringify([
        { status: 'submitted', timestamp: '2026-10-16 04:30 PM', note: 'Reported.', actor: 'Citizen' },
        { status: 'in_progress', timestamp: '2026-10-16 04:50 PM', note: 'Worker on site.', actor: 'Worker' }
      ]),
      1
    );
  }

  // Seed Initial Demo Tasks if empty
  const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get().count;
  if (taskCount === 0) {
    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, report_id, tracking_number, title, category, urgency, status, safety_clearance,
        address, city, lat, lng, description, instructions, required_equipment, proposed_payment,
        payment_status, estimated_hours, assigned_worker_id, assigned_worker_name, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // tsk-201 (Pune)
    insertTask.run(
      'tsk-201',
      'rep-001',
      'SHY-2026-0891',
      'Welfare check & transport support for injured dog',
      'dog',
      'high',
      'in_progress',
      'trained_only',
      'Near Cafe Peter, Baner Hill Foot, Baner',
      'Pune',
      18.5590,
      73.7868,
      'Provide water, conduct calm physical inspection from safe distance, secure dog with gentle slip leash.',
      JSON.stringify([
        'Wear protective canvas gloves and high-visibility vest.',
        'Do not approach abruptly. Offer fresh drinking water and biscuits first.',
        'Take 2 clear photos of the affected paw/leg for the veterinary record.',
        'Upload proof photos and submit completion form.'
      ]),
      JSON.stringify(['Protective gloves', 'Slip leash', 'Water container', 'Bandage kit']),
      450,
      'pending',
      1.5,
      'wrk-101',
      'Rahul Verma',
      1
    );

    // tsk-202 (Pune) - Available
    insertTask.run(
      'tsk-202',
      'rep-002',
      'SHY-2026-0892',
      'Orphaned kitten feeding & safe foster shelter transfer',
      'cat',
      'medium',
      'available',
      'community_safe',
      'Lane 7, Behind Blue Ridge Tower 4, Hinjawadi Phase 1',
      'Pune',
      18.5913,
      73.7389,
      'Attend to 4 small kittens. Prepare warm kitten milk replacer, feed using small syringe/bottle, transfer to foster home.',
      JSON.stringify([
        'Gently wipe eyes and noses with warm damp cotton.',
        'Feed formula slowly; keep kittens positioned on bellies.',
        'Hand over to Foster volunteer Ananya and get sign-off code.'
      ]),
      JSON.stringify(['Pet carrier box', 'Warm towel', 'Dropper bottle']),
      350,
      'pending',
      1.0,
      null,
      null,
      1
    );

    // tsk-207 (Nagpur) - Available
    insertTask.run(
      'tsk-207',
      'rep-007',
      'SHY-2026-0895',
      'Drain rescue & foster transfer for trapped puppy',
      'dog',
      'high',
      'available',
      'community_safe',
      'Near Sitabuldi Metro Station Gate 2, Wardha Road',
      'Nagpur',
      21.1447,
      79.0849,
      'Access dry stormwater drain using step ladder, lift small indie puppy with towel wrap, inspect paws, transfer to foster unit.',
      JSON.stringify([
        'Use safety torch and inspect drain floor before stepping down.',
        'Speak softly to the puppy and wrap with clean towel.',
        'Provide fresh water and upload check-in photo.'
      ]),
      JSON.stringify(['Step stool / ladder', 'Towel wrap', 'Pet carrier / box']),
      350,
      'pending',
      1.0,
      null,
      null,
      1
    );
  }

  // Seed Initial Demo Payouts if empty
  const payoutCount = db.prepare('SELECT COUNT(*) as count FROM payouts').get().count;
  if (payoutCount === 0) {
    db.prepare(`
      INSERT INTO payouts (id, worker_id, worker_name, task_id, task_title, amount, status, method, payout_ref, is_simulated, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      'pay-101',
      'wrk-101',
      'Rahul Verma',
      'tsk-205',
      'Cattle wound cleaning and sanctuary transport escort',
      750,
      'disbursed',
      'UPI',
      'UPI-SIM-2026-98124',
      1
    );
  }
}
