import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Notifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Reduce refresh frequency to every 60 seconds instead of 30
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api.getUserNotifications(currentUser.id, currentUser.email);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDismiss = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency_request':
        return AlertCircle;
      case 'emergency_request_admin':
        return Info;
      default:
        return CheckCircle;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'emergency_request':
        return 'bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500';
      case 'emergency_request_admin':
        return 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500';
      default:
        return 'bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500';
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary dark:from-primary-dark dark:to-secondary-dark p-4 flex items-center justify-between text-white rounded-t-xl">
              <h3 className="font-bold text-sm">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${getNotificationStyles(notification.type)} ${
                        !notification.isRead ? 'bg-opacity-70' : 'bg-opacity-30'
                      }`}
                    >
                      <div className="flex gap-3">
                        <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5 text-primary dark:text-primary-dark" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          {/* Request Details if present */}
                          {notification.requestData && (
                            <div className="mt-2 text-xs bg-white dark:bg-slate-950/50 p-2 rounded border border-slate-200 dark:border-slate-800">
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Patient:</span> {notification.requestData.patientName}
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Hospital:</span> {notification.requestData.hospital}
                              </p>
                              <p className="text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">Contact:</span> {notification.requestData.contactNumber}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2 gap-2">
                            <span className="text-xs text-slate-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              {!notification.isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
                                >
                                  Mark as Read
                                </button>
                              )}
                              <button
                                onClick={() => handleDismiss(notification.id)}
                                className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 rounded-b-xl">
                <button
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="w-full text-xs font-semibold text-primary dark:text-primary-dark hover:underline disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
