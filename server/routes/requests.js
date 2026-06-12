import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(all('SELECT * FROM requests ORDER BY createdAt DESC'));
});

router.get('/blood-group/:bloodGroup', (req, res) => {
  const { bloodGroup } = req.params;
  const { city } = req.query;
  let sql = 'SELECT * FROM requests WHERE bloodGroup = $bg AND status = $status';
  const params = { $bg: bloodGroup, $status: 'Pending' };
  if (city) { sql += ' AND city = $city'; params.$city = city; }
  sql += ' ORDER BY createdAt DESC LIMIT 20';
  res.json(all(sql, params));
});

router.post('/', (req, res) => {
  const r = req.body;
  const result = run(`INSERT INTO requests (patientName, bloodGroup, hospital, city, contactNumber, urgency, status, createdBy) VALUES ($pn, $bg, $hosp, $city, $phone, $urg, $status, $by)`, {
    $pn: r.patientName || '', $bg: r.bloodGroup || 'O+', $hosp: r.hospital || '', $city: r.city || '',
    $phone: r.contactNumber || '', $urg: r.urgency || 'Medium', $status: 'Pending', $by: r.createdBy || 'anonymous',
  });
  res.status(201).json({ id: result.lastInsertRowid, ...r, status: 'Pending' });
});

router.put('/:id', (req, res) => {
  const d = req.body;
  const fieldMap = { patientName:'patientName',bloodGroup:'bloodGroup',hospital:'hospital',city:'city',
    contactNumber:'contactNumber',urgency:'urgency',status:'status',createdBy:'createdBy' };
  const sets = Object.keys(fieldMap).filter(k => d[k] !== undefined);
  if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
  const setSql = sets.map(k => `${fieldMap[k]} = $${k}`).join(', ');
  const params = { $id: req.params.id };
  sets.forEach(k => { params[`$${k}`] = d[k]; });
  run(`UPDATE requests SET ${setSql} WHERE id = $id`, params);
  res.json({ id: Number(req.params.id), ...d });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM requests WHERE id = $id', { $id: req.params.id });
  res.json({ success: true });
});

export default router;
