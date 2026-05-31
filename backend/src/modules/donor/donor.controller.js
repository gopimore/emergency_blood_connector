import catchAsync from '../../utils/catchAsync.js';
import * as donorService from './donor.service.js';

export const setupProfile = catchAsync(async (req, res) => {
  const profile = await donorService.setupProfile(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Donor profile created',
    data: { profile },
  });
});

export const getProfile = catchAsync(async (req, res) => {
  await donorService.ensureDonorProfile(req.user._id);
  const profile = await donorService.getProfileByUserId(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Donor profile retrieved',
    data: { profile },
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  await donorService.ensureDonorProfile(req.user._id);
  const profile = await donorService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Donor profile updated',
    data: { profile },
  });
});

export const toggleAvailability = catchAsync(async (req, res) => {
  await donorService.ensureDonorProfile(req.user._id);
  const profile = await donorService.toggleAvailability(req.user._id);
  res.status(200).json({
    success: true,
    message: `Availability set to ${profile.isAvailable}`,
    data: { profile },
  });
});

export const getNearbyDonors = catchAsync(async (req, res) => {
  const result = await donorService.findNearbyDonors(req.query);
  res.status(200).json({
    success: true,
    message: 'Nearby donors retrieved',
    data: result,
  });
});

export const getDonationHistory = catchAsync(async (req, res) => {
  await donorService.ensureDonorProfile(req.user._id);
  const result = await donorService.getDonationHistory(req.user._id, req.query);
  res.status(200).json({
    success: true,
    message: 'Donation history retrieved',
    data: result,
  });
});
