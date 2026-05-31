import catchAsync from '../../utils/catchAsync.js';
import * as notificationService from '../../services/notification.service.js';

export const getNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.getMyNotifications(req.user._id, req.query);
  res.status(200).json({
    success: true,
    message: 'Notifications retrieved',
    data: result,
  });
});

export const markRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user._id,
    req.params.id
  );
  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification },
  });
});

export const markAllRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: result,
  });
});
