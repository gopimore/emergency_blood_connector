import catchAsync from '../../utils/catchAsync.js';
import * as bloodRequestService from './bloodRequest.service.js';

export const createRequest = catchAsync(async (req, res) => {
  const request = await bloodRequestService.createRequest(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Blood request created',
    data: { request },
  });
});

export const listRequests = catchAsync(async (req, res) => {
  const result = await bloodRequestService.listRequests(req.query);
  res.status(200).json({
    success: true,
    message: 'Blood requests retrieved',
    data: result,
  });
});

export const getNearbyRequests = catchAsync(async (req, res) => {
  const result = await bloodRequestService.findNearbyRequests(req.user._id, req.query);
  res.status(200).json({
    success: true,
    message: 'Nearby blood requests retrieved',
    data: result,
  });
});

export const getRequest = catchAsync(async (req, res) => {
  const request = await bloodRequestService.getRequestById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Blood request retrieved',
    data: { request },
  });
});

export const respondToRequest = catchAsync(async (req, res) => {
  const request = await bloodRequestService.respondToRequest(req.user._id, req.params.id);
  res.status(200).json({
    success: true,
    message: 'Response recorded successfully',
    data: { request },
  });
});

export const updateStatus = catchAsync(async (req, res) => {
  const request = await bloodRequestService.updateRequestStatus(
    req.user._id,
    req.params.id,
    req.body
  );
  res.status(200).json({
    success: true,
    message: 'Blood request status updated',
    data: { request },
  });
});
