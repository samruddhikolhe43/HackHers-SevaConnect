import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.js';
import { signToken, authenticateToken } from '../auth.js';

const router = express.Router();

// Helper to sanitize user object for client response (remove password_hash)
function formatUserResponse(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    phone: u.phone || '',
    city: u.city || 'Pune',
    avatar: u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
    title: u.title || (u.role === 'citizen' ? 'Civic Reporter' : u.role === 'worker' ? 'Community Worker' : 'Welfare Partner'),
    badge: u.badge || (u.role === 'citizen' ? 'Registered Citizen' : u.role === 'worker' ? 'Verified Field Worker' : 'Registered Organisation'),
    verificationStatus: u.verification_status || 'verified',
    skills: u.skills ? JSON.parse(u.skills) : [],
    experience: u.experience || '',
    orgRegNumber: u.org_reg_number || '',
    serviceArea: u.service_area || '',
    trainingCompleted: Boolean(u.training_completed),
    trainingQuizScore: u.training_quiz_score || 0,
    safetyTier: u.safety_tier || 'Basic Community Responder',
    isDemo: Boolean(u.is_demo),
    createdAt: u.created_at,
  };
}

// 1. REGISTER NEW USER
router.post('/register', (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      city,
      skills,
      experience,
      orgRegNumber,
      serviceArea,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and account role are required.' });
    }

    if (!['citizen', 'worker', 'organisation'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check email uniqueness
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`;

    let verificationStatus = 'verified';
    let safetyTier = 'Basic Community Responder';
    let title = 'Active Citizen';
    let badge = 'Civic Reporter';

    if (role === 'worker') {
      verificationStatus = 'pending';
      safetyTier = 'Basic Community Responder';
      title = 'Field Worker (Pending Verification)';
      badge = 'Community Tier 1';
    } else if (role === 'organisation') {
      verificationStatus = 'pending';
      title = 'Registered Welfare Organisation';
      badge = 'Partner NGO (Review Pending)';
    }

    db.prepare(`
      INSERT INTO users (
        id, name, email, password_hash, role, phone, city, avatar, title, badge,
        verification_status, skills, experience, org_reg_number, service_area,
        safety_tier, training_completed, is_demo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      userId,
      name.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      role,
      phone ? phone.trim() : '',
      city ? city.trim() : 'Pune',
      avatar,
      title,
      badge,
      verificationStatus,
      skills ? JSON.stringify(Array.isArray(skills) ? skills : [skills]) : '[]',
      experience ? experience.trim() : '',
      orgRegNumber ? orgRegNumber.trim() : '',
      serviceArea ? serviceArea.trim() : '',
      safetyTier,
      0
    );

    // If worker, register in workers table too
    if (role === 'worker') {
      db.prepare(`
        INSERT INTO workers (
          id, user_id, name, phone, city, avatar, badge, is_available, rating,
          tasks_completed, training_completed, safety_tier, completed_modules,
          verification_status, simulated_balance
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 5.0, 0, 0, ?, '[]', ?, 0)
      `).run(
        userId,
        userId,
        name.trim(),
        phone || '',
        city || 'Pune',
        avatar,
        badge,
        safetyTier,
        verificationStatus
      );
    }

    const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const token = signToken(createdUser);

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: formatUserResponse(createdUser),
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// 2. NORMAL LOGIN
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please try again or create an account.' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    }

    const token = signToken(user);
    res.json({
      message: 'Signed in successfully.',
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during sign in.' });
  }
});

// 3. EXPLORE DEMO LOGIN (Dedicated, separate flow clearly marked as Demo)
router.post('/demo-login', (req, res) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'worker', 'organisation'].includes(role)) {
      return res.status(400).json({ error: 'Invalid demo role requested.' });
    }

    const demoUser = db.prepare('SELECT * FROM users WHERE role = ? AND is_demo = 1 LIMIT 1').get(role);
    if (!demoUser) {
      return res.status(404).json({ error: 'Demo persona not available.' });
    }

    const token = signToken(demoUser);
    res.json({
      message: `Loaded Demo ${role.toUpperCase()} Workspace (${demoUser.name})`,
      token,
      user: formatUserResponse(demoUser),
      isDemo: true,
    });
  } catch (err) {
    console.error('Demo login error:', err);
    res.status(500).json({ error: 'Failed to initialize demo session.' });
  }
});

// 4. GET CURRENT AUTHENTICATED USER (SESSION VALIDATION)
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({ user: formatUserResponse(user) });
  } catch (err) {
    console.error('Session fetch error:', err);
    res.status(500).json({ error: 'Failed to verify session.' });
  }
});

export default router;
