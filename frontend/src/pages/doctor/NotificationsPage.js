import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Mail,
  Send,
  Clock,
  Filter,
  CheckCheck,
  RefreshCw,
  BellRing,
  AlertOctagon,
  Pill,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import notificationService from '../../services/notificationService';
import { doctorPatientService } from '../../services/doctorPatientService';
import { toast } from '../../components/common/Toast';
import styles from './NotificationsPage.module.css';

const NOTIF_TYPES = {
  all: { label: 'Tất cả', icon: Bell },
  reminder: { label: 'Nhắc thuốc', icon: BellRing, color: 'blue' },
  confirmation: { label: 'Xác nhận', icon: CheckCircle, color: 'green' },
  missed: { label: 'Bỏ lỡ', icon: AlertTriangle, color: 'red' },
  expiring: { label: 'Sắp hết hạn', icon: Clock, color: 'orange' },
  updated: { label: 'Cập nhật', icon: Pill, color: 'purple' },
  channel_error: { label: 'Lỗi gửi', icon: AlertOctagon, color: 'gray' },
};

const TYPE_BADGE_CLASS = {
  reminder: 'badgeBlue',
  confirmation: 'badgeGreen',
  missed: 'badgeRed',
  expiring: 'badgeOrange',
  updated: 'badgePurple',
  channel_error: 'badgeGray',
};

const STATUS_LABELS = {
  sent: 'Đã gửi',
  delivered: 'Đã nhận',
  read: 'Đã xem',
  failed: 'Gửi thất bại',
  confirmed: 'Đã xác nhận',
  pending: 'Đang chờ',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications: ctxNotifications, setNotifications: setCtxNotifications } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [resending, setResending] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  // Load danh sách bệnh nhân
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorPatientService.getAll();
        const list = res.data.patients || res.data || [];
        setPatients(Array.isArray(list) ? list : []);
      } catch (err) {
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  // Đồng bộ từ context khi có thông báo mới realtime
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

  const transformNotifications = (rawList) => {
    return rawList.map((n) => ({
      ...n,
      read: n.is_read !== undefined ? n.is_read : n.read,
      status: n.send_status || n.status || 'sent',
    }));
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedPatient) params.patient_id = selectedPatient;
      const res = await notificationService.getNotifications(params);
      const data = res.data?.notifications || res.data || [];
      const transformed = transformNotifications(data);
      setNotifications(transformed);
      setCtxNotifications(transformed);
    } catch {
      // fallback du lieu mau
      setNotifications([
        {
          id: '1',
          type: 'reminder',
          title: 'Nhắc uống thuốc',
          message: 'Bệnh nhân Nguyễn Văn A cần uống Amoxicillin 250mg lúc 12:00',
          channel: 'in_app',
          status: 'sent',
          read: false,
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '2',
          type: 'confirmation',
          title: 'Xác nhận uống thuốc',
          message: 'Bệnh nhân Trần Thị B đã xác nhận uống Paracetamol 500mg',
          channel: 'email',
          status: 'confirmed',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'missed',
          title: 'Bỏ lỡ liều thuốc',
          message: 'Bệnh nhân Lê Văn C đã bỏ lỡ liều Omeprazole 20mg lúc 19:00',
          channel: 'in_app',
          status: 'delivered',
          read: true,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '4',
          type: 'expiring',
          title: 'Đơn thuốc sắp hết hạn',
          message: 'Đơn thuốc của bệnh nhân Phạm Thị D sẽ hết hạn sau 3 ngày',
          channel: 'email',
          status: 'sent',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '5',
          type: 'channel_error',
          title: 'Lỗi gửi email',
          message: 'Không gửi được email nhắc thuốc cho bệnh nhân Hoàng Văn E',
          channel: 'email',
          status: 'failed',
          read: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '6',
          type: 'updated',
          title: 'Đơn thuốc đã cập nhật',
          message: 'Đơn thuốc của bệnh nhân Nguyễn Thị F đã được cập nhật thành công',
          channel: 'in_app',
          status: 'delivered',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [setCtxNotifications, selectedPatient]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try { await notificationService.markAllAsRead(); } catch { /* silent */ }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('Đã đánh dấu tất cả đã đọc');
  };

  const handleResend = async (e, notifId) => {
    e.stopPropagation();
    setResending(notifId);
    try {
      await notificationService.resendNotification(notifId);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id === notifId || n.id === notifId) ? { ...n, status: 'sent' } : n
        )
      );
      toast.success('Đã gửi lại thông báo');
    } catch {
      toast.error('Gửi lại thất bại');
    } finally {
      setResending(null);
    }
  };

  const handleClickNotif = async (notif) => {
    const id = notif._id || notif.id;
    if (!notif.read) {
      setNotifications((prev) =>
        prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n))
      );
      try { await notificationService.markAsRead(id); } catch { /* silent */ }
    }
    navigate(`/doctor/notifications/${id}`);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Thông báo</h1>
          <p className={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Không có thông báo chưa đọc'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={handleMarkAllRead}>
            <CheckCheck size={14} />
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Bộ lọc bệnh nhân */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 14, fontWeight: 500 }}>Bệnh nhân:</label>
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            fontSize: 14,
            minWidth: 200,
          }}
        >
          <option value="">Tất cả bệnh nhân</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name || p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Filter tabs */}
      <div className={styles.filterTabs}>
        <Filter size={14} className={styles.filterIcon} />
        {Object.entries(NOTIF_TYPES).map(([key, cfg]) => (
          <button
            key={key}
            className={`${styles.filterTab} ${filter === key ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(key)}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Bell size={24} />
          </div>
          <div className={styles.emptyText}>Không có thông báo nào</div>
        </div>
      ) : (
        <div className={styles.notifList}>
          {filtered.map((n) => {
            const id = n._id || n.id;
            const typeConfig = NOTIF_TYPES[n.type] || NOTIF_TYPES.reminder;
            const Icon = typeConfig.icon || Bell;
            const badgeClass = TYPE_BADGE_CLASS[n.type] || 'badgeBlue';

            return (
              <div
                key={id}
                className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                onClick={() => handleClickNotif(n)}
              >
                <div className={`${styles.notifIconWrap} ${styles[badgeClass + 'Bg']}`}>
                  <Icon size={16} />
                </div>

                <div className={styles.notifContent}>
                  <div className={styles.notifTitleRow}>
                    <span className={styles.notifTitle}>{n.title || n.message}</span>
                    <span className={`${styles.typeBadge} ${styles[badgeClass]}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                  <div className={styles.notifMessage}>{n.message}</div>
                  <div className={styles.notifMeta}>
                    <span className={styles.notifTime}>
                      <Clock size={12} />
                      {formatTime(n.createdAt)}
                    </span>
                    <span className={styles.notifChannel}>
                      {n.channel === 'email' ? <Mail size={12} /> : <Bell size={12} />}
                      {n.channel === 'email' ? 'Email' : 'In-app'}
                    </span>
                    <span className={`${styles.notifStatus} ${n.status === 'failed' ? styles.statusFailed : ''}`}>
                      {STATUS_LABELS[n.status] || n.status || 'Đã gửi'}
                    </span>
                  </div>
                </div>

                <div className={styles.notifActions}>
                  {!n.read && <div className={styles.unreadDot} />}
                  {n.status === 'failed' && (
                    <button
                      className={styles.resendBtn}
                      onClick={(e) => handleResend(e, id)}
                      disabled={resending === id}
                      title="Gửi lại"
                    >
                      {resending === id ? (
                        <RefreshCw size={14} className={styles.spinning} />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
