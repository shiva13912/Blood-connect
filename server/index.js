import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { all, get, run, initDB } from './db.js';

import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import requestRoutes from './routes/requests.js';
import userRoutes from './routes/users.js';
import notificationRoutes from './routes/notifications.js';
import uploadRoutes from './routes/upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/stats', (req, res) => {
  const donorsCount = all('SELECT COUNT(*) as c FROM donors')[0]?.c || 0;
  const requestsCount = all('SELECT COUNT(*) as c FROM requests')[0]?.c || 0;
  const fulfilledCount = all("SELECT COUNT(*) as c FROM requests WHERE status = 'Fulfilled'")[0]?.c || 0;
  res.json({ donorsCount, requestsCount, fulfilledRequestsCount: fulfilledCount });
});

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`BloodConnect server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
