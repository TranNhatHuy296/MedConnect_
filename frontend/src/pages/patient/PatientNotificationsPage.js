import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from '../../components/common/Toast';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  CheckCheck,
  Check,
} from 'lucide-react';
import styles from './PatientNotificationsPage.module.css';


const NOTIF_TYPES = {
  reminder: { label: 'Nhắc uống thuốc', icon: BellRing, iconClass: 'notifIconReminder' },
  confirm: { label: 'Xác nhận đã uống', icon: CheckCircle, iconClass: 'notifIconConfirm' },
  warning: { label: 'Cảnh báo bỏ lỡ', icon: AlertTriangle, iconClass: 'notifIconWarning' },
};

export default function PatientNotificationsPage() {
  const { notifications: ctxNotifications, markAsRead: ctxMarkAsRead, markAllAsRead: ctxMarkAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [confirming, setConfirming] = useState(null);

  const transformNotifications = (rawList) => {
    return rawList.map((n) => ({
      ...n,
      read: n.is_read !== undefined ? n.is_read : n.read,
      time: n.createdAt || n.created_at || n.time,
    }));
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await patientService.getNotifications();
      const raw = res.data?.notifications || res.data || [];
      setNotifications(transformNotifications(raw));
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Đồng bộ realtime từ context
  useEffect(() => {
    if (ctxNotifications.length > 0 && !loading) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n._id || n.id));
        const newOnes = ctxNotifications.filter((n) => !existingIds.has(n._id || n.id));
        if (newOnes.length > 0) return [...newOnes, ...prev];
        return prev;
      });
    }
  }, [ctxNotifications, loading]);

  const handleMarkRead = async (notif) => {
    if (notif.read) return;
    const id = notif._id || notif.id;
    try {
      await ctxMarkAsRead(id);
    } catch {
      // fallback
    }
    setNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await ctxMarkAllAsRead();
    } catch {
      // fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả đã đọc');
  };

  const handleConfirmMedication = async (e, notif) => {
    e.stopPropagation();
    const id = notif._id || notif.id;
    setConfirming(id);
    try {
      await patientService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id || n.id) === id ? { ...n, read: true, canConfirm: false, type: 'confirm', message: `Đã xác nhận: ${notif.message}` } : n
        )
      );
      toast.success('Đã xác nhận uống thuốc');
    } catch {
      toast.error('Xác nhận thất bại');
    } finally {
      setConfirming(null);
    }
  };

  const formatTime = (timeStr) => {
    const d = new Date(timeStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffH < 24) return `${diffH} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTypeLabel = (type) => {
    return NOTIF_TYPES[type]?.label || 'Thông báo';
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Đang tải...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Thông báo</h1>
          <p className={styles.subtitle}>{unreadCount} chưa đọc</p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter */}
      <div className={styles.filterTabs}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'unread', label: 'Chưa đọc' },
          { key: 'reminder', label: 'Nhắc thuốc' },
          { key: 'confirm', label: 'Xác nhận' },
          { key: 'warning', label: 'Cảnh báo' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`${styles.filterTab} ${filter === tab.key ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Bell size={24} />
          </div>
          <div className={styles.emptyText}>Không có thông báo nào</div>
        </div>
      ) : (
        <div className={styles.notifList}>
          {filtered.map((notif) => {
            const id = notif._id || notif.id;
            const typeConfig = NOTIF_TYPES[notif.type] || NOTIF_TYPES.reminder;
            const Icon = typeConfig.icon;
            return (
              <div
                key={id}
                className={`${styles.notifItem} ${!notif.read ? styles.notifUnread : ''} ${styles.notifNew}`}
                onClick={() => handleMarkRead(notif)}
              >
                <div className={`${styles.notifIcon} ${styles[typeConfig.iconClass]}`}>
                  <Icon size={16} />
                </div>
                <div className={styles.notifContent}>
                  <div className={styles.notifMessage}>{notif.message}</div>
                  <div className={styles.notifMeta}>
                    <span className={styles.notifTime}>{formatTime(notif.time || notif.createdAt)}</span>
                    <span className={styles.notifTypeBadge}>{getTypeLabel(notif.type)}</span>
                  </div>
                  {/* Nút xác nhận nhanh cho thông báo nhắc thuốc */}
                  {notif.type === 'reminder' && notif.canConfirm && (
                    <button
                      className={styles.confirmBtn}
                      onClick={(e) => handleConfirmMedication(e, notif)}
                      disabled={confirming === id}
                    >
                      <Check size={14} />
                      {confirming === id ? 'Đang xác nhận...' : 'Xác nhận đã uống'}
                    </button>
                  )}
                </div>
                {!notif.read && <div className={styles.unreadDot} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
