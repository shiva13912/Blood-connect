import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM donors ORDER BY name ASC'));
});

router.get('/blood-group/:bloodGroup', (req, res) => {
  const { bloodGroup } = req.params;
  const { city } = req.query;
  let sql = 'SELECT * FROM donors WHERE bloodGroup = $bg AND eligibility = 1 AND availability = 1';
  const params = { $bg: bloodGroup };
  if (city) { sql += ' AND city = $city'; params.$city = city; }
  sql += ' ORDER BY name ASC LIMIT 20';
  res.json(all(sql, params));
});

router.get('/email/:email', (req, res) => {
  res.json(get('SELECT * FROM donors WHERE email = $email', { $email: req.params.email }) || null);
});

router.get('/:id', (req, res) => {
  res.json(get('SELECT * FROM donors WHERE id = $id', { $id: req.params.id }) || null);
});

router.post('/', (req, res) => {
  const d = req.body;
  const existing = get('SELECT id FROM donors WHERE email = $email', { $email: d.email });
  if (existing) return res.status(409).json({ error: 'Donor with this email already exists' });
  const result = run(`INSERT INTO donors (name, age, gender, bloodGroup, city, phone, email, eligibility, lastDonationDate, totalDonations, availability, profileImage) VALUES ($name, $age, $gender, $bg, $city, $phone, $email, $elig, $last, $total, $avail, $img)`, {
    $name: d.name || '', $age: d.age || 30, $gender: d.gender || 'Male', $bg: d.bloodGroup || 'O+',
    $city: d.city || '', $phone: d.phone || '', $email: d.email || '', $elig: d.eligibility ?? 1,
    $last: d.lastDonationDate || '', $total: d.totalDonations || 0, $avail: d.availability ?? 1, $img: d.profileImage || '',
  });
  res.status(201).json({ id: result.lastInsertRowid, ...d });
});

router.put('/:id', (req, res) => {
  const d = req.body;
  const fieldMap = { name:'name',age:'age',gender:'gender',bloodGroup:'bloodGroup',city:'city',phone:'phone',
    email:'email',eligibility:'eligibility',lastDonationDate:'lastDonationDate',totalDonations:'totalDonations',
    availability:'availability',profileImage:'profileImage' };
  const sets = Object.keys(fieldMap).filter(k => d[k] !== undefined);
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  const setSql = sets.map(k => `${fieldMap[k]} = $${k}`).join(', ');
  const params = { $id: req.params.id };
  sets.forEach(k => { params[`$${k}`] = d[k]; });
  run(`UPDATE donors SET ${setSql} WHERE id = $id`, params);
  res.json({ id: Number(req.params.id), ...d });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM donors WHERE id = $id', { $id: req.params.id });
  res.json({ success: true });
});

export default router;
