// server/test_e2e_suite.js
// Automated End-to-End Verification Test Suite for Sahaay API & Persistence

import { db } from './db.js';

const BASE_URL = 'http://localhost:5000';
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, ok: res.ok, body };
}

async function runTests() {
  console.log('=====================================================');
  console.log('   SAHAAY END-TO-END BACKEND & PERSISTENCE TEST SUITE');
  console.log('=====================================================\n');

  const timestamp = Date.now();
  const citizenEmail = `citizen.${timestamp}@test.sahaay.org`;
  const workerEmail = `worker.${timestamp}@test.sahaay.org`;
  const orgEmail = `org.${timestamp}@test.sahaay.org`;

  let citizenToken = '';
  let citizenUser = null;
  let workerToken = '';
  let workerUser = null;
  let orgToken = '';
  let orgUser = null;

  // 1. Citizen Registration
  console.log('TEST 1: Citizen Registration');
  const regCitRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aarav Mehta',
      email: citizenEmail,
      password: 'Password123!',
      role: 'citizen',
      phone: '+91 98220 12345',
      city: 'Pune',
    }),
  });
  assert(regCitRes.status === 201, 'Citizen registration returns 201 Created');
  assert(regCitRes.body.token, 'Token returned on registration');
  assert(regCitRes.body.user?.role === 'citizen', 'User role is citizen');
  assert(regCitRes.body.user?.isDemo === false, 'User is NOT marked as demo');
  citizenToken = regCitRes.body.token;
  citizenUser = regCitRes.body.user;

  // 2. Duplicate Registration Rejection
  console.log('\nTEST 2: Duplicate Registration Protection');
  const dupRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate',
      email: citizenEmail,
      password: 'Password123!',
      role: 'citizen',
    }),
  });
  assert(dupRes.status === 409, 'Duplicate email registration rejected with 409 Conflict');

  // 3. Citizen Login with Real Credentials
  console.log('\nTEST 3: Citizen Login with Real Credentials');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: citizenEmail,
      password: 'Password123!',
    }),
  });
  assert(loginRes.status === 200, 'Login with valid credentials returns 200 OK');
  assert(loginRes.body.token, 'Login returns JWT');
  assert(loginRes.body.user?.name === 'Aarav Mehta', 'Login returns correct user profile');

  // 4. Invalid Password Rejection
  console.log('\nTEST 4: Invalid Password Rejection');
  const badLogin = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: citizenEmail,
      password: 'WrongPassword!',
    }),
  });
  assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

  // 5. Session Verification (/api/auth/me)
  console.log('\nTEST 5: Authenticated Session Verification');
  const meRes = await request('/api/auth/me', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(meRes.status === 200, '/api/auth/me returns 200 OK');
  assert(meRes.body.user?.id === citizenUser.id, '/api/auth/me matches registered citizen ID');

  // 6. Citizen Report History Isolation (Must be Empty for new user, not Priya's)
  console.log('\nTEST 6: Citizen Account Data Isolation');
  const myReportsRes = await request('/api/reports?myReports=true', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(myReportsRes.status === 200, 'GET /api/reports?myReports=true returns 200');
  assert(Array.isArray(myReportsRes.body), 'Report list is an array');
  assert(myReportsRes.body.length === 0, 'New citizen starts with 0 reports (isolated from demo reports)');

  // 7. Citizen Submits a Report
  console.log('\nTEST 7: Citizen Report Creation & Persistence');
  const newReportRes = await request('/api/reports', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: JSON.stringify({
      title: 'Injured stray dog near Kothrud bus depot',
      category: 'dog',
      type: 'injured_animal',
      urgency: 'high',
      address: 'Near Kothrud Stand, Paud Road',
      city: 'Pune',
      landmark: 'Opposite Dominoes',
      lat: 18.5074,
      lng: 73.8077,
      description: 'Limping front leg, resting peacefully under shop awning.',
    }),
  });
  assert(newReportRes.status === 201, 'POST /api/reports returns 201 Created');
  assert(newReportRes.body.report?.trackingNumber, 'Report assigned standardized tracking number');
  const createdReportId = newReportRes.body.report.id;

  // Verify it appears in citizen's myReports
  const myReportsAfter = await request('/api/reports?myReports=true', {
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  assert(myReportsAfter.body.length === 1, 'Report appears in new citizen myReports list');
  assert(myReportsAfter.body[0].id === createdReportId, 'Persisted report matches created report ID');

  // 8. Worker Registration with Skills & Profile
  console.log('\nTEST 8: Worker Registration & Safety Tier Initialization');
  const regWorkerRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Sunil Jadhav',
      email: workerEmail,
      password: 'Password123!',
      role: 'worker',
      phone: '+91 97654 32100',
      city: 'Pune',
      skills: ['Basic Handling', 'First Aid'],
      experience: '2 years community stray feeder',
    }),
  });
  assert(regWorkerRes.status === 201, 'Worker registration returns 201 Created');
  workerToken = regWorkerRes.body.token;
  workerUser = regWorkerRes.body.user;
  assert(workerUser.safetyTier === 'Basic Community Responder', 'Initial worker tier is Basic Community Responder');

  // 9. Worker Profile in SQLite workers table
  console.log('\nTEST 9: Worker Profile in SQLite workers table');
  const workerRow = db.prepare('SELECT * FROM workers WHERE user_id = ?').get(workerUser.id);
  assert(workerRow !== undefined, 'Worker entry created in SQLite workers table');
  assert(workerRow.is_available === 1, 'Worker initialized as available');
  assert(workerRow.safety_tier === 'Basic Community Responder', 'Worker tier persisted in DB');

  // 10. Worker Training Progression & Tier Upgrade
  console.log('\nTEST 10: Worker Training Progression & Safety Tier Promotion');
  const trainRes = await request('/api/workers/training', {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({
      score: 100,
      moduleIds: ['mod-1', 'mod-2', 'mod-3'],
    }),
  });
  assert(trainRes.status === 200, 'POST /api/workers/training returns 200 OK');
  assert(trainRes.body.trainingCompleted === true, 'Training marked completed');
  assert(trainRes.body.safetyTier === 'Certified Animal Handler', 'Worker promoted to Certified Animal Handler');

  // 11. Worker Claims a Task
  console.log('\nTEST 11: Worker Task Discovery & Claiming');
  // First, find an open task in the DB
  const openTask = db.prepare("SELECT * FROM tasks WHERE status = 'available' OR status = 'Open' LIMIT 1").get();
  assert(openTask !== undefined, 'Found open community task in database');

  const claimRes = await request(`/api/tasks/${openTask.id}/claim`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  assert(claimRes.status === 200, 'Worker claim endpoint returns 200 OK');
  assert(claimRes.body.task?.status === 'in_progress' || claimRes.body.task?.status === 'claimed', 'Task status transitioned');

  // 12. Worker Task Isolation (myTasks)
  console.log('\nTEST 12: Worker Task Isolation');
  const workerTasks = await request('/api/tasks?myTasks=true', {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  assert(workerTasks.status === 200, 'GET /api/tasks?myTasks=true returns 200');
  assert(workerTasks.body.some(t => t.id === openTask.id), 'Claimed task appears in worker personal list');

  // 13. Organisation Registration
  console.log('\nTEST 13: Organisation Registration & Role Enforcement');
  const regOrgRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Pune Street Animal Care Foundation',
      email: orgEmail,
      password: 'Password123!',
      role: 'organisation',
      phone: '+91 20 2567 1122',
      city: 'Pune',
      orgRegNumber: 'MAH/PUN/2024/0987',
      serviceArea: 'Kothrud, Baner, Shivajinagar',
    }),
  });
  assert(regOrgRes.status === 201, 'Organisation registration returns 201 Created');
  orgToken = regOrgRes.body.token;
  orgUser = regOrgRes.body.user;

  // 14. Organisation Task Creation & Dispatch
  console.log('\nTEST 14: Organisation Task Dispatch');
  const orgTaskRes = await request('/api/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify({
      title: 'Community sterilisation census follow-up',
      category: 'dog',
      urgency: 'medium',
      safetyClearance: 'community_safe',
      address: 'FC Road, Deccan Gymkhana',
      city: 'Pune',
      description: 'Check ear-notches on 3 resident indie dogs.',
      proposedPayment: 350,
    }),
  });
  assert(orgTaskRes.status === 201, 'Organisation task creation returns 201 Created');
  assert(orgTaskRes.body.task?.title === 'Community sterilisation census follow-up', 'Task persisted accurately');

  // 15. Role-Based Access Control: Worker barred from dispatching tasks
  console.log('\nTEST 15: RBAC - Worker Barred from Dispatching Tasks');
  const rbacTaskRes = await request('/api/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${workerToken}` },
    body: JSON.stringify({
      title: 'Unauthorized task creation attempt',
      address: 'Somewhere',
      description: 'Should fail',
    }),
  });
  assert(rbacTaskRes.status === 403, 'Worker task dispatch rejected with 403 Forbidden');

  // 16. Role-Based Access Control: Citizen barred from approving completions
  console.log('\nTEST 16: RBAC - Citizen Barred from Reviewing Tasks');
  const rbacReviewRes = await request(`/api/tasks/${openTask.id}/review`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: JSON.stringify({ action: 'approve' }),
  });
  assert(rbacReviewRes.status === 403, 'Citizen task review rejected with 403 Forbidden');

  // 17. Demo Mode Separation (Demo Login Portal)
  console.log('\nTEST 17: Demo Account Separation');
  const demoLoginRes = await request('/api/auth/demo-login', {
    method: 'POST',
    body: JSON.stringify({ role: 'citizen' }),
  });
  assert(demoLoginRes.status === 200, 'Demo login returns 200 OK');
  assert(demoLoginRes.body.user?.isDemo === true, 'Demo user flagged isDemo = true');
  assert(demoLoginRes.body.user?.email === 'priya.sharma@example.com', 'Demo persona is Priya Sharma');
  assert(demoLoginRes.body.user?.id !== citizenUser.id, 'Demo user ID distinct from registered citizen ID');

  // 18. Direct SQLite Database Integrity Verification
  console.log('\nTEST 18: Direct SQLite Database Verification');
  const dbUser = db.prepare('SELECT id, email, role, password_hash, is_demo FROM users WHERE email = ?').get(citizenEmail);
  assert(dbUser !== undefined, 'User record found in SQLite `users` table');
  assert(dbUser.password_hash.startsWith('$2'), 'Password stored as bcrypt hash ($2)');
  assert(dbUser.is_demo === 0, 'Database is_demo is 0 for registered user');

  const dbReport = db.prepare('SELECT * FROM reports WHERE id = ?').get(createdReportId);
  assert(dbReport !== undefined, 'Report record found in SQLite `reports` table');
  assert(dbReport.reporter_id === citizenUser.id, 'Report correctly attributed to new citizen');

  // 19. Multilingual AI Triage: Hindi Input & Trauma Urgency
  console.log('\nTEST 19: Multilingual AI Triage - Hindi Input');
  const hindiRes = await request('/api/reports/assess-preview', {
    method: 'POST',
    body: JSON.stringify({
      description: 'शिवाजी नगर बस स्टैंड के पास घायल कुत्ता पड़ा है, बहुत खून बह रहा है और वह तड़प रहा है।',
      lat: 18.5204,
      lng: 73.8567,
      deviceLat: 18.5210,
      deviceLng: 73.8570
    })
  });
  assert(hindiRes.status === 200, 'Hindi AI assess-preview returns 200 OK');
  assert(hindiRes.body.aiCategory === 'dog', `Hindi input correctly classified as dog (got: ${hindiRes.body.aiCategory})`);
  assert(hindiRes.body.aiUrgency === 'critical', `Severe bleeding correctly classified as critical (got: ${hindiRes.body.aiUrgency})`);
  assert(hindiRes.body.inputLanguage === 'hi', 'Language correctly detected as Hindi (hi)');

  // 20. Multilingual AI Triage: Marathi Input
  console.log('\nTEST 20: Multilingual AI Triage - Marathi Input');
  const marathiRes = await request('/api/reports/assess-preview', {
    method: 'POST',
    body: JSON.stringify({
      description: 'रस्त्यावर जखमी गाय बसलेली आहे, गाडीने धडक दिली आहे, पाय खूप सुजला आहे.',
      lat: 18.5204,
      lng: 73.8567
    })
  });
  assert(marathiRes.status === 200, 'Marathi AI assess-preview returns 200 OK');
  assert(marathiRes.body.aiCategory === 'cattle', `Marathi input correctly classified as cattle (got: ${marathiRes.body.aiCategory})`);
  assert(marathiRes.body.inputLanguage === 'mr', 'Language correctly detected as Marathi (mr)');

  // 21. AI Triage: "Other" Category & Ambiguous Descriptions
  console.log('\nTEST 21: Category "Other" & Ambiguous Input');
  const otherRes = await request('/api/reports/assess-preview', {
    method: 'POST',
    body: JSON.stringify({
      description: 'Large broken drainage pipe leaking water onto sidewalk near market area.',
      lat: 18.5204,
      lng: 73.8567
    })
  });
  assert(otherRes.status === 200, 'Other category assess-preview returns 200 OK');
  assert(otherRes.body.aiCategory === 'other', `Civic infrastructure without animal mapped to other (got: ${otherRes.body.aiCategory})`);

  // 22. Geolocation Consistency Evaluation
  console.log('\nTEST 22: Geolocation Consistency Evaluation');
  // 22a. Consistent (within 2.5km)
  const locConsistentRes = await request('/api/reports/assess-preview', {
    method: 'POST',
    body: JSON.stringify({
      description: 'Injured bird with broken wing found on garden lawn.',
      lat: 18.5204,
      lng: 73.8567,
      deviceLat: 18.5215, // ~150 meters away
      deviceLng: 73.8572
    })
  });
  assert(locConsistentRes.body.locationConsistency?.status === 'Location Evidence Incomplete' || 
         locConsistentRes.body.locationConsistency?.status === 'Location Evidence Consistent',
         'Proximity within 2.5km deemed consistent');

  // 22b. Mismatch (> 2.5km away)
  const locMismatchRes = await request('/api/reports/assess-preview', {
    method: 'POST',
    body: JSON.stringify({
      description: 'Stray puppy needing vaccination near park.',
      lat: 18.5204,
      lng: 73.8567,
      deviceLat: 18.6500, // ~15 km away
      deviceLng: 73.7800
    })
  });
  assert(locMismatchRes.body.locationConsistency?.status === 'Location Mismatch — Review Required',
         `Distance > 2.5km correctly flagged: "${locMismatchRes.body.locationConsistency?.status}"`);

  // 23. Server-Enforced AI Report Creation
  console.log('\nTEST 23: Server-Enforced AI Report Creation & Persistence');
  const aiReportRes = await request('/api/reports', {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: JSON.stringify({
      title: 'Stray dog with paw wound',
      description: 'Injured street dog limping heavily on rear right leg near FC Road cafe.',
      address: 'FC Road, Deccan, Pune',
      city: 'Pune',
      lat: 18.5204,
      lng: 73.8567,
      deviceLat: 18.5210,
      deviceLng: 73.8570,
      photoUrls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1']
    })
  });
  assert(aiReportRes.status === 201, 'AI-triaged report creation returns 201 Created');
  assert(aiReportRes.body.report?.aiCategory === 'dog', 'Database persisted ai_category as dog');
  assert(aiReportRes.body.report?.locationConsistencyStatus !== undefined, 'Location consistency status recorded');
  const newReportId = aiReportRes.body.report?.id;

  // 24. Organisation Human Review Action
  console.log('\nTEST 24: Organisation Human Review Action');
  const reviewRes = await request(`/api/reports/${newReportId}/review`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${orgToken}` },
    body: JSON.stringify({
      decision: 'approved',
      notes: 'Visual symptoms confirmed by on-duty coordinator Dr. Sunita Kulkarni. First aid dispatched.'
    })
  });
  assert(reviewRes.status === 200, 'Human review submission returns 200 OK');
  assert(reviewRes.body.report?.humanReviewStatus === 'approved', 'Report humanReviewStatus successfully updated to approved');
  assert(reviewRes.body.report?.reviewedBy === orgUser.name, 'Reviewer attributed to authenticated organisation officer');

  console.log('\n=====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
