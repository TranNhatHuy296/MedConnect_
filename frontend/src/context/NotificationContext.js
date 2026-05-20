import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import notificationService from '../services/notificationService';
import { toast } from '../components/common/Toast';


const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch {
      // silent
    }
  }, []);

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      const res = await notificationService.getNotifications(params);
      const data = res.data?.notifications || res.data || [];
      setNotifications(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  // Socket connection
  useEffect(() => {
    if (!user) {
      socketService.disconnect();
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    socketService.connect();
    fetchUnreadCount();

    const unsubNew = socketService.onNewNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      toast.success(notification.title || notification.message || 'Bạn có thông báo mới');
    });

    const unsubCount = socketService.onUnreadCount((data) => {
      const count = typeof data === 'number' ? data : data?.count ?? data?.unreadCount ?? 0;
      setUnreadCount(count);
    });

    const unsubRead = socketService.onNotificationRead((data) => {
      const readId = data?._id || data?.id;
      if (readId) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === readId || n.id === readId ? { ...n, read: true } : n))
        );
      }
    });

    return () => {
      unsubNew();
      unsubCount();
      unsubRead();
      socketService.disconnect();
    };
  }, [user, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        setNotifications,
        fetchUnreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
