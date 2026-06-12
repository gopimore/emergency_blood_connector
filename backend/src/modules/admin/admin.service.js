import User from '../../models/User.model.js';
import DonorProfile from '../../models/DonorProfile.model.js';
import Hospital from '../../models/Hospital.model.js';
import BloodRequest from '../../models/BloodRequest.model.js';
import Notification from '../../models/Notification.model.js';
import AppError from '../../utils/AppError.js';
import APIFeatures from '../../utils/apiFeatures.js';

export const listUsers = async (queryString) => {
  const baseQuery = User.find().select('-passwordHash');
  const features = new APIFeatures(baseQuery, queryString).filter().sort().paginate();
  const users = await features.query;
  const total = await User.countDocuments();

  return {
    users,
    pagination: {
      page: Number(queryString.page) || 1,
      limit: Number(queryString.limit) || 10,
      total,
    },
  };
};

export const banUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') {
    throw new AppError('Cannot ban an admin account', 400);
  }
  const updated = await User.findByIdAndUpdate(
    userId,
    { isBanned: true, refreshTokens: [] },
    { new: true }
  );
  return updated;
};

export const unbanUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  user.isBanned = false;
  await user.save({ validateBeforeSave: false });
  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') {
    throw new AppError('Cannot delete an admin account', 400);
  }

  await DonorProfile.deleteOne({ userId });
  const hospital = await Hospital.findOne({ userId });
  if (hospital) {
    await BloodRequest.deleteMany({ hospitalId: hospital._id });
    await Hospital.deleteOne({ userId });
  }
  await Notification.deleteMany({ userId });
  await User.deleteOne({ _id: userId });

  return { deleted: true };
};

export const getStats = async () => {
  const [users, donors, hospitals, openRequests, fulfilledRequests, notifications] =
    await Promise.all([
      User.countDocuments(),
      DonorProfile.countDocuments(),
      Hospital.countDocuments(),
      BloodRequest.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
      BloodRequest.countDocuments({ status: 'fulfilled' }),
      Notification.countDocuments(),
    ]);

  return {
    users,
    donors,
    hospitals,
    openRequests,
    fulfilledRequests,
    notifications,
  };
};

export const seedAdminIfNeeded = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '123456789';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  const existing = await User.findOne({ email: adminEmail.toLowerCase() });
  if (existing) return;

  await User.create({
    name: adminName,
    email: adminEmail.toLowerCase(),
    passwordHash: adminPassword,
    role: 'admin',
    isEmailVerified: true,
  });
};
