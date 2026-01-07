import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true
}));

app.use(express.json());

import pollRoutes from './routes/poll.routes.js';
app.use('/api', pollRoutes);

app.get('/health', (req, res) =>{
    res.json({status: 'OK'});
})

export default app;