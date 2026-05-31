import BloodRequest from '../../models/BloodRequest.model.js';
import DonorProfile from '../../models/DonorProfile.model.js';
import AppError from '../../utils/AppError.js';
import APIFeatures from '../../utils/apiFeatures.js';
import { computeEligibility } from '../../utils/eligibilityHelper.js';
import { createNotification } from '../../services/notification.service.js';
import { emitToUser } from '../../services/socket.service.js';
import * as hospitalService from '../hospital/hospital.service.js';
import * as donorService from '../donor/donor.service.js';

const DEFAULT_RADIUS_METERS = 15000;
const REQUEST_EXPIRY_HOURS = 48;

const notifyNearbyDonors = async (request) => {
  const [lng, lat] = request.location.coordinates;
  const nearbyDonors = await DonorProfile.find({
    bloodGroup: request.bloodGroup,
    isAvailable: true,
    isEligible: true,
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: DEFAULT_RADIUS_METERS,
      },
    },
  }).populate('userId', '_id');

  const payload = {
    request: {
      _id: request._id,
      bloodGroup: request.bloodGroup,
      unitsRequired: request.unitsRequired,
      urgency: request.urgency,
      status: request.status,
      location: request.location,
      hospitalId: request.hospitalId,
    },
  };

  await Promise.all(
    nearbyDonors.map(async (donor) => {
      const userId = donor.userId?._id || donor.userId;
      if (!userId) return;

      await createNotification({
        userId,
        type: 'blood_request',
        title: 'Urgent blood request nearby',
        message: `${request.bloodGroup} blood needed (${request.urgency} urgency)`,
        relatedId: request._id,
        relatedModel: 'BloodRequest',
      });

      emitToUser(userId.toString(), 'new_blood_request', payload);
    })
  );
};

export const createRequest = async (userId, body) => {
  const hospital = await hospitalService.ensureHospitalProfile(userId);
  const { bloodGroup, unitsRequired, urgency, location, expiresAt } = body;

  const [lng, lat] = location.coordinates.map(Number);
  const request = await BloodRequest.create({
    hospitalId: hospital._id,
    bloodGroup,
    unitsRequired,
    urgency: urgency || 'medium',
    location: { type: 'Point', coordinates: [lng, lat] },
    expiresAt:
      expiresAt || new Date(Date.now() + REQUEST_EXPIRY_HOURS * 60 * 60 * 1000),
  });

  await request.populate('hospitalId', 'hospitalName contactPhone address');
  await notifyNearbyDonors(request);

  return request;
};

export const listRequests = async (queryString) => {
  const features = new APIFeatures(
    BloodRequest.find().populate('hospitalId', 'hospitalName contactPhone address'),
    queryString
  )
    .filter()
    .sort()
    .paginate();

  const requests = await features.query;
  const total = await BloodRequest.countDocuments(features.query.getFilter());

  return {
    requests,
    pagination: {
      page: Number(queryString.page) || 1,
      limit: Number(queryString.limit) || 10,
      total,
    },
  };
};

export const getRequestById = async (id) => {
  const request = await BloodRequest.findById(id).populate(
    'hospitalId',
    'hospitalName contactPhone address location'
  );
  if (!request) {
    throw new AppError('Blood request not found', 404);
  }
  return request;
};

export const findNearbyRequests = async (userId, query) => {
  const profile = await donorService.ensureDonorProfile(userId);
  const {
    longitude,
    latitude,
    radius = DEFAULT_RADIUS_METERS,
    bloodGroup,
    page = 1,
    limit = 10,
  } = query;

  const lng = Number(longitude);
  const lat = Number(latitude);

  const filter = {
    status: { $in: ['open', 'in-progress'] },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: Number(radius),
      },
    },
  };

  if (bloodGroup) {
    filter.bloodGroup = bloodGroup;
  } else {
    filter.bloodGroup = profile.bloodGroup;
  }

  const requests = await BloodRequest.find(filter)
    .populate('hospitalId', 'hospitalName contactPhone address')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: requests.length,
    },
  };
};

export const respondToRequest = async (userId, requestId) => {
  const profile = await donorService.ensureDonorProfile(userId);
  const request = await BloodRequest.findById(requestId).populate({
    path: 'hospitalId',
    populate: { path: 'userId', select: '_id' },
  });

  if (!request) {
    throw new AppError('Blood request not found', 404);
  }
  if (!['open', 'in-progress'].includes(request.status)) {
    throw new AppError('This request is no longer accepting responses', 400);
  }
  if (!profile.isAvailable || !profile.isEligible) {
    throw new AppError('You are not eligible or available to donate', 400);
  }

  const alreadyResponded = request.respondents.some(
    (r) => r.donorId.toString() === profile._id.toString()
  );
  if (alreadyResponded) {
    throw new AppError('You have already responded to this request', 400);
  }

  request.respondents.push({
    donorId: profile._id,
    status: 'pending',
    respondedAt: new Date(),
  });
  if (request.status === 'open') {
    request.status = 'in-progress';
  }
  await request.save();

  const hospitalUserId = request.hospitalId?.userId?._id || request.hospitalId?.userId;
  if (hospitalUserId) {
    await createNotification({
      userId: hospitalUserId,
      type: 'donor_response',
      title: 'Donor responded to your request',
      message: `A donor responded to your ${request.bloodGroup} blood request`,
      relatedId: request._id,
      relatedModel: 'BloodRequest',
    });

    emitToUser(hospitalUserId.toString(), 'donor_responded', {
      requestId: request._id,
      donorId: profile._id,
      bloodGroup: request.bloodGroup,
    });
  }

  return request;
};

export const updateRequestStatus = async (userId, requestId, { status, unitsFulfilled }) => {
  const hospital = await hospitalService.ensureHospitalProfile(userId);
  const request = await BloodRequest.findById(requestId);

  if (!request) {
    throw new AppError('Blood request not found', 404);
  }
  if (request.hospitalId.toString() !== hospital._id.toString()) {
    throw new AppError('You can only update your own blood requests', 403);
  }

  request.status = status;
  if (unitsFulfilled !== undefined) {
    request.unitsFulfilled = unitsFulfilled;
  }

  if (status === 'fulfilled') {
    request.unitsFulfilled = request.unitsFulfilled || request.unitsRequired;
    const acceptedRespondents = request.respondents.filter((r) =>
      ['pending', 'accepted'].includes(r.status)
    );

    await Promise.all(
      acceptedRespondents.map(async (respondent) => {
        respondent.status = 'fulfilled';
        const donorProfile = await DonorProfile.findById(respondent.donorId).populate(
          'userId',
          '_id'
        );
        if (!donorProfile) return;

        donorProfile.donationCount += 1;
        donorProfile.lastDonated = new Date();
        donorProfile.isEligible = computeEligibility(donorProfile.lastDonated);
        await donorProfile.save();

        const donorUserId = donorProfile.userId?._id || donorProfile.userId;
        if (donorUserId) {
          await createNotification({
            userId: donorUserId,
            type: 'request_fulfilled',
            title: 'Blood request fulfilled',
            message: 'Thank you! The blood request you responded to has been fulfilled.',
            relatedId: request._id,
            relatedModel: 'BloodRequest',
          });

          emitToUser(donorUserId.toString(), 'request_fulfilled', {
            requestId: request._id,
          });
        }
      })
    );
  }

  if (status === 'cancelled') {
    await Promise.all(
      request.respondents.map(async (respondent) => {
        const donorProfile = await DonorProfile.findById(respondent.donorId).populate(
          'userId',
          '_id'
        );
        const donorUserId = donorProfile?.userId?._id || donorProfile?.userId;
        if (!donorUserId) return;

        await createNotification({
          userId: donorUserId,
          type: 'request_cancelled',
          title: 'Blood request cancelled',
          message: 'A blood request you responded to has been cancelled.',
          relatedId: request._id,
          relatedModel: 'BloodRequest',
        });
      })
    );
  }

  await request.save();
  await request.populate('hospitalId', 'hospitalName contactPhone');
  return request;
};
