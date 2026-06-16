import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createSocketServer } from './sockets';

import webhookRoutes from './routes/webhooks';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import friendRoutes from './routes/friends';
import chatRoutes from './routes/chats';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import reportRoutes from './routes/reports';

const app = express();
const httpServer = createServer(app);

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: 1.0,
    integrations: [],
  });
}

app.use(helmet());
app.use(cors(config.cors));
app.use(compression());
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(cookieParser());

app.use('/api/webhooks', webhookRoutes);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFoundHandler);

if (config.sentry.dsn) {
  Sentry.setupExpressErrorHandler(app);
}

app.use(errorHandler);

async function connectDB() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

const io = createSocketServer(httpServer);

async function start() {
  await connectDB();
  httpServer.listen(config.port, () => {
    console.log('Server running on port ' + config.port);
    console.log('Environment: ' + config.nodeEnv);
    console.log('WebSocket server initialized');
  });
}

start();

export { app, httpServer, io };