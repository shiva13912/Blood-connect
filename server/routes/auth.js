import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { get, run } from '../db.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password, role = 'donor' } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, password required' });

  const existing = get('SELECT id FROM users WHERE email = $email', { $email: email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const result = run('INSERT INTO users (name, email, password, role) VALUES ($name, $email, $pass, $role)', {
    $name: name, $email: email, $pass: hash, $role: role,
  });
  const user = { id: result.lastInsertRowid, name, email, role };

  if (role === 'donor') {
    run(`INSERT INTO donors (name, email, profileImage) VALUES ($name, $email, $img)`, {
      $name: name, $email: email,
      $img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });
  }

  const token = generateToken(user);
  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const row = get('SELECT id, name, email, password, role FROM users WHERE email = $email', { $email: email });
  if (!row || !bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'Invalid credentials' });

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = generateToken(user);
  res.json({ user, token });
});

router.post('/google', (req, res) => {
  const { name, email, photoURL } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  let row = get('SELECT id, name, email, role FROM users WHERE email = $email', { $email: email });
  if (!row) {
    const displayName = name || email.split('@')[0];
    const hash = bcrypt.hashSync(Math.random().toString(36), 10);
    const result = run('INSERT INTO users (name, email, password, role) VALUES ($n, $e, $p, $r)', {
      $n: displayName, $e: email, $p: hash, $r: 'donor',
    });
    row = { id: result.lastInsertRowid, name: displayName, email, role: 'donor' };
    run(`INSERT INTO donors (name, email, profileImage) VALUES ($n, $e, $i)`, {
      $n: displayName, $e: email,
      $i: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`,
    });
  }

  const token = generateToken(row);
  res.json({ user: row, token });
});

router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  const row = get('SELECT id FROM users WHERE email = $email', { $email: email });
  if (!row) return res.status(404).json({ error: 'Email not found' });
  res.json({ message: 'Password reset link sent (simulated)' });
});

export default router;
