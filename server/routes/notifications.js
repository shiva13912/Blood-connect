import { Router } from 'express';
import { all, get, run } from '../db.js';

const router = Router();

router.post('/', (req, res) => {
  const n = req.body;
  const result = run(`INSERT INTO notifications (recipientId, recipientEmail, recipientName, type, title, message, requestId, requestData) VALUES ($rid, $remail, $rname, $type, $title, $msg, $reqId, $data)`, {
    $rid: n.recipientId || null, $remail: n.recipientEmail || '', $rname: n.recipientName || '',
    $type: n.type || 'info', $title: n.title || '', $msg: n.message || '',
    $reqId: n.requestId || null, $data: n.requestData ? JSON.stringify(n.requestData) : null,
  });
  res.status(201).json({ id: result.lastInsertRowid, ...n, isRead: false });
});

router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { email } = req.query;
  let rows;
  if (email) {
    rows = all('SELECT * FROM notifications WHERE recipientEmail = $email ORDER BY createdAt DESC LIMIT 50', { $email: email });
  } else {
    rows = all('SELECT * FROM notifications WHERE recipientId = $id ORDER BY createdAt DESC LIMIT 50', { $id: userId });
  }
  res.json(rows.map(r => ({ ...r, requestData: r.requestData ? JSON.parse(r.requestData) : null })));
});

router.put('/:id/read', (req, res) => {
  run('UPDATE notifications SET isRead = 1 WHERE id = $id', { $id: req.params.id });
  res.json({ success: true });
});

export default router;
