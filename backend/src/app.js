import express from 'express';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://intervue-live-poll-puce.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow Postman / curl / server-to-server
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

import pollRoutes from './routes/poll.routes.js';
app.use('/api', pollRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

export default app;
