import mongoose from 'mongoose';
import logger from './logger.js';
import User from '../models/User.model.js';
import DonorProfile from '../models/DonorProfile.model.js';
import Hospital from '../models/Hospital.model.js';
import { cleanupInvalidGeoLocations } from '../utils/geoHelper.js';

const logOrphanAccounts = async () => {
  const donors = await User.find({ role: 'donor' }).select('_id email');
  let orphanDonors = 0;
  for (const donor of donors) {
    const hasProfile = await DonorProfile.exists({ userId: donor._id });
    if (!hasProfile) {
      orphanDonors += 1;
      logger.warn(`Donor account without profile: ${donor.email} — use /donor/setup after login`);
    }
  }
  if (orphanDonors > 0) {
    logger.info(`${orphanDonors} donor account(s) need profile setup`);
  }
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined');
  }

  logger.info(`Connecting to MongoDB Atlas, MONGO_URI present: ${Boolean(mongoUri)}`);
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  });
  logger.info(`MongoDB connected: ${conn.connection.host}`);

  const cleanups = await Promise.all([
    cleanupInvalidGeoLocations(DonorProfile, 'DonorProfile'),
    cleanupInvalidGeoLocations(Hospital, 'Hospital'),
  ]);

  cleanups.filter(Boolean).forEach(({ label, modifiedCount }) => {
    logger.info(`Removed invalid ${label} location fields from ${modifiedCount} document(s)`);
  });

  await logOrphanAccounts();
};

export default connectDB;
