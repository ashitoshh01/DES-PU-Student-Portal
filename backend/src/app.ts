import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import forumRoutes from './routes/forum.routes';
import notificationsRoutes from './routes/notifications.routes';
import projectsRoutes from './routes/projects.routes';
import resourcesRoutes from './routes/resources.routes';
import userRoutes from './routes/user.routes';

const app: Express = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/forums', forumRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/resources', resourcesRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
