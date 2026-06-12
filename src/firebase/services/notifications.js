import { dbService } from './db';

export const notificationService = {
  sendDonorNotification: async (request) => {
    try {
      const users = await dbService.getUsers();
      const seenEmails = new Set();
      const notifications = [];

      for (const user of users) {
        if (seenEmails.has(user.email?.toLowerCase())) continue;
        seenEmails.add(user.email.toLowerCase());
        notifications.push({
          recipientId: user.id,
          recipientEmail: user.email,
          recipientName: user.name,
          type: 'emergency_request',
          title: `Emergency Blood Request - ${request.bloodGroup}`,
          message: `Urgent: ${request.patientName} needs ${request.bloodGroup} blood at ${request.hospital} (${request.city}). Contact: ${request.contactNumber}`,
          requestId: request.id,
          requestData: {
            patientName: request.patientName,
            bloodGroup: request.bloodGroup,
            hospital: request.hospital,
            city: request.city,
            contactNumber: request.contactNumber,
            urgency: request.urgency,
          },
        });
      }

      for (const notification of notifications) {
        await dbService.addNotification(notification);
      }

      console.log(`Sent ${notifications.length} notifications for request ${request.id}`);
      return notifications;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return [];
    }
  },

  sendAdminNotification: async (request) => {
    try {
      const users = await dbService.getUsers();
      const admins = users.filter(u => u.role === 'admin');
      const notifications = [];

      for (const admin of admins) {
        notifications.push({
          recipientId: admin.id,
          recipientEmail: admin.email,
          recipientName: admin.name,
          type: 'emergency_request_admin',
          title: `New Emergency Request - ${request.bloodGroup}`,
          message: `Emergency blood request created: ${request.patientName} at ${request.hospital}`,
          requestId: request.id,
          requestData: request,
        });
      }

      for (const notification of notifications) {
        await dbService.addNotification(notification);
      }

      console.log(`Sent ${notifications.length} admin notifications`);
      return notifications;
    } catch (error) {
      console.error('Error sending admin notifications:', error);
      return [];
    }
  },

  getUserNotifications: async (userId, userEmail = null) => {
    try {
      return await dbService.getNotifications(userId, userEmail);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  markAsRead: async (notificationId) => {
    try {
      return await dbService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  sendPushNotification: async (title, options = {}) => {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          return new Notification(title, {
            icon: '/blood-drop-icon.png',
            badge: '/blood-drop-icon.png',
            ...options,
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            return new Notification(title, {
              icon: '/blood-drop-icon.png',
              badge: '/blood-drop-icon.png',
              ...options,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  },
};
