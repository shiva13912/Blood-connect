import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(all('SELECT id, name, email, role, createdAt FROM users ORDER BY name ASC'));
});

router.get('/email/:email', (req, res) => {
  res.json(get('SELECT id, name, email, role, createdAt FROM users WHERE email = $email', { $email: req.params.email }) || null);
});

router.put('/:id', (req, res) => {
  const { name, role } = req.body;
  if (name !== undefined) run('UPDATE users SET name = $name WHERE id = $id', { $name: name, $id: req.params.id });
  if (role !== undefined) run('UPDATE users SET role = $role WHERE id = $id', { $role: role, $id: req.params.id });
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM users WHERE id = $id', { $id: req.params.id });
  res.json({ success: true });
});

export default router;
