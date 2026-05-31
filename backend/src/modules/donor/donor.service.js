import DonorProfile from '../../models/DonorProfile.model.js';
import BloodRequest from '../../models/BloodRequest.model.js';
import User from '../../models/User.model.js';
import AppError from '../../utils/AppError.js';
import APIFeatures from '../../utils/apiFeatures.js';
import { computeEligibility } from '../../utils/eligibilityHelper.js';
import { toGeoPoint } from '../../utils/geoHelper.js';

const DEFAULT_RADIUS_METERS = 10000;

const formatProfile = (profile) => {
  if (!profile) return null;
  const doc = profile.toObject ? profile.toObject() : profile;
  return {
    ...doc,
    user: doc.userId,
    userId: doc.userId?._id || doc.userId,
  };
};

export const getProfileByUserId = async (userId) => {
  const profile = await DonorProfile.findOne({ userId }).populate(
    'userId',
    'name email role isEmailVerified'
  );
  if (!profile) {
    throw new AppError('Donor profile not found', 404);
  }
  return formatProfile(profile);
};

export const updateProfile = async (userId, updates) => {
  const profile = await DonorProfile.findOne({ userId });
  if (!profile) {
    throw new AppError('Donor profile not found', 404);
  }

  const allowed = ['bloodGroup', 'isAvailable', 'lastDonated', 'medicalConditions'];
  allowed.forEach((field) => {
    if (updates[field] !== undefined) {
      profile[field] = updates[field];
    }
  });

  if (updates.location !== undefined) {
    const point = toGeoPoint(updates.location?.coordinates);
    profile.location = point;
    if (!point) profile.markModified('location');
  }

  if (updates.lastDonated !== undefined) {
    profile.isEligible = computeEligibility(profile.lastDonated);
  } else {
    profile.isEligible = computeEligibility(profile.lastDonated);
  }

  await profile.save();
  await profile.populate('userId', 'name email role isEmailVerified');
  return formatProfile(profile);
};

export const toggleAvailability = async (userId) => {
  const profile = await DonorProfile.findOne({ userId });
  if (!profile) {
    throw new AppError('Donor profile not found', 404);
  }
  profile.isAvailable = !profile.isAvailable;
  await profile.save();
  await profile.populate('userId', 'name email role isEmailVerified');
  return formatProfile(profile);
};

export const findNearbyDonors = async (query) => {
  const {
    bloodGroup,
    longitude,
    latitude,
    radius = DEFAULT_RADIUS_METERS,
    page = 1,
    limit = 10,
  } = query;

  const lng = Number(longitude);
  const lat = Number(latitude);
  const maxDistance = Number(radius);

  const filter = {
    bloodGroup,
    isAvailable: true,
    isEligible: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: maxDistance,
      },
    },
  };

  const total = await DonorProfile.countDocuments({
    bloodGroup,
    isAvailable: true,
    isEligible: true,
    'location.coordinates': { $exists: true, $ne: [] },
  });

  const donors = await DonorProfile.find(filter)
    .populate('userId', 'name email isEmailVerified')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    donors: donors.map(formatProfile),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
  };
};

export const getDonationHistory = async (userId, queryString) => {
  const profile = await DonorProfile.findOne({ userId });
  if (!profile) {
    throw new AppError('Donor profile not found', 404);
  }

  const baseQuery = BloodRequest.find({
    status: 'fulfilled',
    'respondents.donorId': profile._id,
    'respondents.status': { $in: ['accepted', 'fulfilled'] },
  }).populate({
    path: 'hospitalId',
    select: 'hospitalName contactPhone address',
  });

  const features = new APIFeatures(baseQuery, queryString)
    .sort()
    .paginate();

  const history = await features.query;

  const total = await BloodRequest.countDocuments({
    status: 'fulfilled',
    'respondents.donorId': profile._id,
    'respondents.status': { $in: ['accepted', 'fulfilled'] },
  });

  const formatted = history.map((request) => {
    const respondent = request.respondents.find(
      (r) => r.donorId.toString() === profile._id.toString()
    );
    return {
      requestId: request._id,
      bloodGroup: request.bloodGroup,
      unitsRequired: request.unitsRequired,
      urgency: request.urgency,
      hospital: request.hospitalId,
      respondedAt: respondent?.respondedAt,
      fulfilledAt: request.updatedAt,
    };
  });

  return {
    history: formatted,
    donationCount: profile.donationCount,
    pagination: {
      page: Number(queryString.page) || 1,
      limit: Number(queryString.limit) || 10,
      total,
    },
  };
};

export const ensureDonorProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'donor') {
    throw new AppError('Only donors can access this resource', 403);
  }
  const profile = await DonorProfile.findOne({ userId });
  if (!profile) {
    throw new AppError(
      'Donor profile not found. Complete setup at POST /api/v1/donors/setup',
      404
    );
  }
  return profile;
};

export const setupProfile = async (userId, { bloodGroup }) => {
  const user = await User.findById(userId);
  if (!user || user.role !== 'donor') {
    throw new AppError('Only donors can create a donor profile', 403);
  }
  const existing = await DonorProfile.findOne({ userId });
  if (existing) {
    throw new AppError('Donor profile already exists', 400);
  }
  const profile = new DonorProfile({ userId, bloodGroup });
  await profile.save();
  await profile.populate('userId', 'name email role isEmailVerified');
  return formatProfile(profile);
};
