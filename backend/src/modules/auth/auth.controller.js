import catchAsync from '../../utils/catchAsync.js';
import * as authService from './auth.service.js';

export const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, needsProfileSetup } =
    await authService.register(req.body);
  authService.setAuthCookies(res, accessToken, refreshToken);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, needsProfileSetup },
  });
});

export const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken, needsProfileSetup } =
    await authService.login(req.body);
  authService.setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, needsProfileSetup },
  });
});

export const logout = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logout(req.user._id, refreshToken);
  authService.clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const { user, accessToken, refreshToken: newRefresh } =
    await authService.refreshAccessToken(token);
  authService.setAuthCookies(res, accessToken, newRefresh);
  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: { user },
  });
});

export const getMe = catchAsync(async (req, res) => {
  const { user, needsProfileSetup } = await authService.getMe(req.user._id);
  res.status(200).json({
    success: true,
    message: 'Profile retrieved',
    data: { user, needsProfileSetup },
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  res.status(200).json({
    success: true,
    message: result.message,
    data: null,
  });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.resetPassword(
    req.params.token,
    req.body.password
  );
  authService.setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: { user },
  });
});

export const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
    data: { user },
  });
});

export const updatePassword = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.updatePassword(
    req.user._id,
    req.body.currentPassword,
    req.body.newPassword
  );
  authService.setAuthCookies(res, accessToken, refreshToken);
  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
    data: { user },
  });
});
