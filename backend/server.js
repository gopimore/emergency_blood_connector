import dotenv from 'dotenv';
import dns from 'dns';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

dns.setServers(['8.8.8.8', '1.1.1.1', '9.9.9.9']);
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './src/config/db.js';
import logger from './src/config/logger.js';
import { initSocket } from './src/services/socket.service.js';
import registerSocketHandlers from './src/sockets/socket.handler.js';
import { startCronJobs } from './src/jobs/cron.js';
import { seedAdminIfNeeded } from './src/modules/admin/admin.service.js';

const PORT = process.env.PORT || 5000;

const requiredEnv = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLIENT_URL',
];

const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

initSocket(io);
registerSocketHandlers(io);

const start = async () => {
  await connectDB();
  await seedAdminIfNeeded();
  startCronJobs();
  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start().catch((err) => {
  logger.error(err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  server.close(() => process.exit(1));
});
