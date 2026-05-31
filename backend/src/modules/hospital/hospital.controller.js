import catchAsync from '../../utils/catchAsync.js';
import * as hospitalService from './hospital.service.js';

export const getProfile = catchAsync(async (req, res) => {
  await hospitalService.ensureHospitalProfile(req.user._id);
  const profile = await hospitalService.getProfileByUserId(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Hospital profile retrieved',
    data: { profile },
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  await hospitalService.ensureHospitalProfile(req.user._id);
  const profile = await hospitalService.updateProfile(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Hospital profile updated',
    data: { profile },
  });
});

export const getRequests = catchAsync(async (req, res) => {
  await hospitalService.ensureHospitalProfile(req.user._id);
  const result = await hospitalService.getHospitalRequests(req.user._id, req.query);
  res.status(200).json({
    success: true,
    message: 'Hospital blood requests retrieved',
    data: result,
  });
});
