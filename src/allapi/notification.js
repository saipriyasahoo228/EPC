import api from '../api';

// GET all notifications
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications/notifications/');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error.response?.data || error.message);
    throw error;
  }
};

// PATCH: mark a specific notification as read
export const markNotificationRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/notifications/${notificationId}/`, { read: true });
    return response.data;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error.response?.data || error.message);
    throw error;
  }
};

// DELETE: delete a specific notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/notifications/${notificationId}/`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting notification:', error.response?.data || error.message);
    throw error;
  }
};

// PATCH: mark all notifications for the current user as read
export const markAllNotificationsRead = async () => {
  try {
    const response = await api.patch('/notifications/notifications/bulk/', { read: true });
    return response.data;
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error.response?.data || error.message);
    throw error;
  }
};

// DELETE: clear all notifications for the current user
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications/notifications/bulk/');
    return response.data;
  } catch (error) {
    console.error('❌ Error clearing all notifications:', error.response?.data || error.message);
    throw error;
  }
};

