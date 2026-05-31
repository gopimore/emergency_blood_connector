import catchAsync from '../../utils/catchAsync.js';
import * as adminService from './admin.service.js';

export const getUsers = catchAsync(async (req, res) => {
  const result = await adminService.listUsers(req.query);
  res.status(200).json({
    success: true,
    message: 'Users retrieved',
    data: result,
  });
});

export const banUser = catchAsync(async (req, res) => {
  const user = await adminService.banUser(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User banned successfully',
    data: { user },
  });
});

export const unbanUser = catchAsync(async (req, res) => {
  const user = await adminService.unbanUser(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User unbanned successfully',
    data: { user },
  });
});

export const deleteUser = catchAsync(async (req, res) => {
  const result = await adminService.deleteUser(req.params.id);
  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const getStats = catchAsync(async (req, res) => {
  const stats = await adminService.getStats();
  res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved',
    data: { stats },
  });
});
