import Hospital from '../../models/Hospital.model.js';
import BloodRequest from '../../models/BloodRequest.model.js';
import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import APIFeatures from '../../utils/apiFeatures.js';
import { toGeoPoint } from '../../utils/geoHelper.js';

const formatProfile = (hospital) => {
  if (!hospital) return null;
  const doc = hospital.toObject ? hospital.toObject() : hospital;
  return {
    ...doc,
    user: doc.userId,
    userId: doc.userId?._id || doc.userId,
  };
};

export const ensureHospitalProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'hospital') {
    throw new AppError('Only hospitals can access this resource', 403);
  }
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) {
    throw new AppError('Hospital profile not found', 404);
  }
  return hospital;
};

export const getProfileByUserId = async (userId) => {
  const hospital = await Hospital.findOne({ userId }).populate(
    'userId',
    'name email role isEmailVerified'
  );
  if (!hospital) {
    throw new AppError('Hospital profile not found', 404);
  }
  return formatProfile(hospital);
};

export const updateProfile = async (userId, updates) => {
  const hospital = await Hospital.findOne({ userId });
  if (!hospital) {
    throw new AppError('Hospital profile not found', 404);
  }

  const allowed = ['hospitalName', 'registrationNo', 'contactPhone', 'address'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      hospital[field] = updates[field];
    }
  });

  if (updates.location !== undefined) {
    const point = toGeoPoint(updates.location?.coordinates);
    hospital.location = point;
    if (!point) hospital.markModified('location');
  }

  await hospital.save();
  await hospital.populate('userId', 'name email role isEmailVerified');
  return formatProfile(hospital);
};

export const getHospitalRequests = async (userId, queryString) => {
  const hospital = await ensureHospitalProfile(userId);
  const baseQuery = BloodRequest.find({ hospitalId: hospital._id }).populate(
    'hospitalId',
    'hospitalName contactPhone'
  );

  const features = new APIFeatures(baseQuery, queryString).filter().sort().paginate();
  const requests = await features.query;
  const total = await BloodRequest.countDocuments({ hospitalId: hospital._id });

  return {
    requests,
    pagination: {
      page: Number(queryString.page) || 1,
      limit: Number(queryString.limit) || 10,
      total,
    },
  };
};

export const getHospitalByUserId = async (userId) => {
  return Hospital.findOne({ userId });
};
