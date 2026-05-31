import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';

import logger from './src/config/logger.js';
import authRoutes from './src/modules/auth/auth.routes.js';
import donorRoutes from './src/modules/donor/donor.routes.js';
import hospitalRoutes from './src/modules/hospital/hospital.routes.js';
import bloodRequestRoutes from './src/modules/blood-request/bloodRequest.routes.js';
import notificationRoutes from './src/modules/notification/notification.routes.js';
import adminRoutes from './src/modules/admin/admin.routes.js';
import { globalErrorHandler, notFound } from './src/middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, '../frontend/dist');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  })
);

const corsOrigin = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production'
  ? 'https://emergencybloodconnector-six.vercel.app'
  : 'http://localhost:3000');
logger.info(`CORS origin set to: ${corsOrigin}`);
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', data: null });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/donors', donorRoutes);
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/blood-requests', bloodRequestRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));

  app.get(/^(?!\/api).*/, (req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use(notFound);
app.use(globalErrorHandler);

export default app;
