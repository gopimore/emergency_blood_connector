import Notification from '../models/Notification.model.js';
import APIFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/AppError.js';
import { emitToUser } from './socket.service.js';

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId,
  relatedModel,
}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    relatedId,
    relatedModel,
  });

  emitToUser(userId.toString(), 'new_notification', {
    notification,
  });

  return notification;
};

export const getMyNotifications = async (userId, queryString) => {
  const baseQuery = Notification.find({ userId });
  const features = new APIFeatures(baseQuery, queryString).sort().paginate();
  const notifications = await features.query;
  const total = await Notification.countDocuments({ userId });
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications,
    unreadCount,
    pagination: {
      page: Number(queryString.page) || 1,
      limit: Number(queryString.limit) || 10,
      total,
    },
  };
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  notification.isRead = true;
  await notification.save();
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  return { modifiedCount: result.modifiedCount };
};

export default {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
