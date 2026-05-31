import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../../models/User.model.js';
import DonorProfile from '../../models/DonorProfile.model.js';
import Hospital from '../../models/Hospital.model.js';
import AppError from '../../utils/AppError.js';
import sendEmail from '../../utils/sendEmail.js';
import logger from '../../config/logger.js';

const MAX_REFRESH_TOKENS = 5;

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
};

const logDevToken = (label, token) => {
  if (process.env.NODE_ENV === 'development') {
    logger.info('════════════════════════════════════════');
    logger.info(`DEV ${label}: ${token}`);
    logger.info('════════════════════════════════════════');
  }
};

const getNeedsProfileSetup = async (user) => {
  if (!user) return false;
  if (user.role === 'donor') {
    return !(await DonorProfile.exists({ userId: user._id }));
  }
  if (user.role === 'hospital') {
    return !(await Hospital.exists({ userId: user._id }));
  }
  return false;
};

const rollbackRegistration = async (userId) => {
  if (!userId) return;
  await Promise.all([
    DonorProfile.deleteOne({ userId }),
    Hospital.deleteOne({ userId }),
    User.findByIdAndDelete(userId),
  ]);
};

const createDonorProfileIfNeeded = async (user, bloodGroup) => {
  if (user.role !== 'donor') return null;
  const existing = await DonorProfile.findOne({ userId: user._id });
  if (existing) return existing;
  if (!bloodGroup) {
    throw new AppError('Blood group is required for donor registration', 400);
  }
  const profile = new DonorProfile({ userId: user._id, bloodGroup });
  await profile.save();
  return profile;
};

const createHospitalProfileIfNeeded = async (user, hospitalData) => {
  if (user.role !== 'hospital') return null;
  const existing = await Hospital.findOne({ userId: user._id });
  if (existing) return existing;
  const { hospitalName, registrationNo, contactPhone } = hospitalData;
  if (!hospitalName || !registrationNo || !contactPhone) {
    throw new AppError(
      'hospitalName, registrationNo, and contactPhone are required for hospital registration',
      400
    );
  }
  return Hospital.create({
    userId: user._id,
    hospitalName,
    registrationNo,
    contactPhone,
  });
};

export const register = async (body) => {
  const { name, email, password, role, bloodGroup, hospitalName, registrationNo, contactPhone } =
    body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  let user;
  try {
    user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      emailVerificationToken: hashToken(verificationToken),
    });

    await createDonorProfileIfNeeded(user, bloodGroup);
    await createHospitalProfileIfNeeded(user, {
      hospitalName,
      registrationNo,
      contactPhone,
    });
  } catch (err) {
    if (user?._id) await rollbackRegistration(user._id);
    throw err;
  }

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your email — Emergency Blood Connector',
      html: `<p>Hi ${user.name},</p><p>Please verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      text: `Verify your email: ${verifyUrl}`,
    });
  } catch {
    logger.warn('Verification email failed to send');
  }

  logDevToken('EMAIL VERIFICATION TOKEN', verificationToken);

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens = [refreshToken];
  user.trimRefreshTokens(MAX_REFRESH_TOKENS);
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id);
  const needsProfileSetup = await getNeedsProfileSetup(safeUser);

  return { user: safeUser, accessToken, refreshToken, needsProfileSetup };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (user.isBanned) {
    throw new AppError('Your account has been suspended', 403);
  }

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(refreshToken);
  user.trimRefreshTokens(MAX_REFRESH_TOKENS);
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id);
  const needsProfileSetup = await getNeedsProfileSetup(safeUser);
  return { user: safeUser, accessToken, refreshToken, needsProfileSetup };
};

export const logout = async (userId, refreshToken) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (user && refreshToken) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save({ validateBeforeSave: false });
  }
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token required', 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(refreshToken)) {
    throw new AppError('Invalid refresh token', 401);
  }
  if (user.isBanned) {
    throw new AppError('Your account has been suspended', 403);
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  const newAccessToken = signAccessToken(user._id);
  const newRefreshToken = signRefreshToken(user._id);
  user.refreshTokens.push(newRefreshToken);
  user.trimRefreshTokens(MAX_REFRESH_TOKENS);
  await user.save({ validateBeforeSave: false });

  return {
    user: await User.findById(user._id),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  const needsProfileSetup = await getNeedsProfileSetup(user);
  return { user, needsProfileSetup };
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { message: 'If that email exists, a reset link has been sent' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: user.email,
      subject: 'Password reset — Emergency Blood Connector',
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>Link expires in 10 minutes.</p>`,
      text: `Reset your password: ${resetUrl}`,
    });
  } catch {
    logger.warn('Password reset email failed to send');
  }

  logDevToken('PASSWORD RESET TOKEN', resetToken);

  return { message: 'If that email exists, a reset link has been sent' };
};

export const resetPassword = async (rawToken, newPassword) => {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires +refreshTokens');

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.passwordHash = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens = [refreshToken];
  await user.save({ validateBeforeSave: false });

  return {
    user: await User.findById(user._id),
    accessToken,
    refreshToken,
  };
};

export const verifyEmail = async (rawToken) => {
  const hashed = hashToken(rawToken);
  const user = await User.findOne({ emailVerificationToken: hashed });
  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });
  return user;
};

export const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+passwordHash +refreshTokens');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }
  user.passwordHash = newPassword;
  user.refreshTokens = [];
  await user.save();

  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  user.refreshTokens = [refreshToken];
  await user.save({ validateBeforeSave: false });

  return {
    user: await User.findById(user._id),
    accessToken,
    refreshToken,
  };
};
