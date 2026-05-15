import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { WebSocketServer } from 'ws';

import { authRouter } from './routes/auth';
import { casesRouter } from './routes/cases';
import { reportsRouter } from './routes/reports';
import { evidenceRouter } from './routes/evidence';
import { filesRouter } from './routes/files';
import { queueRouter } from './routes/queue';
import { adminRouter } from './routes/admin';
import { tenantMiddleware } from './middleware/tenant';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { rateLimiter } from './middleware/rateLimit';
import { setupWebSocket } from './services/websocket';
import { db } from './db/client';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.APP_ENV === 'production' ? 'combined' : 'dev'));

app.use('/v1/auth', rateLimiter, authRouter);

app.use('/v1', authMiddleware, tenantMiddleware);
app.use('/v1/cases', casesRouter);
app.use('/v1/reports', reportsRouter);
app.use('/v1/evidence', evidenceRouter);
app.use('/v1/files', filesRouter);
app.use('/v1/queue', queueRouter);
app.use('/v1/admin', adminRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const wss = new WebSocketServer({ server, path: '/queue/ws' });
setupWebSocket(wss);

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  await db.migrate.latest();
  server.listen(PORT, () => {
    console.log(`PatrolRMS API running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export { wss };
