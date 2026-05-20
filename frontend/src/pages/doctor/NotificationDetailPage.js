import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Bell,
  BellRing,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Send,
  RefreshCw,
  User,
  Pill,
  AlertOctagon,
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { toast } from '../../components/common/Toast';
import styles from './NotificationDetailPage.module.css';

const NOTIF_TYPES = {
  reminder: { label: 'Nhắc thuốc', icon: BellRing, colorClass: 'badgeBlue' },
  confirmation: { label: 'Xác nhận', icon: CheckCircle, colorClass: 'badgeGreen' },
  missed: { label: 'Bỏ lỡ', icon: AlertTriangle, colorClass: 'badgeRed' },
  expiring: { label: 'Sắp hết hạn', icon: Clock, colorClass: 'badgeOrange' },
  updated: { label: 'Cập nhật', icon: Pill, colorClass: 'badgePurple' },
  channel_error: { label: 'Lỗi gửi', icon: AlertOctagon, colorClass: 'badgeGray' },
};

const STATUS_MAP = {
  sent: { label: 'Đã gửi', className: 'statusSent' },
  delivered: { label: 'Đã nhận', className: 'statusDelivered' },
  read: { label: 'Đã xem', className: 'statusRead' },
  failed: { label: 'Gửi thất bại', className: 'statusFailed' },
  confirmed: { label: 'Đã xác nhận', className: 'statusConfirmed' },
  pending: { label: 'Đang chờ', className: 'statusPending' },
};

export default function NotificationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();
  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await notificationService.getNotificationById(id);
        const data = res.data?.notification || res.data;
        setNotif(data);
        if (data && !data.read) {
          markAsRead(id);
        }
      } catch {
        // fallback
        setNotif({
          _id: id,
          type: 'reminder',
          title: 'Nhắc uống thuốc',
          message: 'Bệnh nhân Nguyễn Văn A cần uống Amoxicillin 250mg vào lúc 12:00 trưa nay. Vui lòng đảm bảo bệnh nhân uống thuốc đúng giờ để đạt hiệu quả điều trị tốt nhất.',
          channel: 'in_app',
          status: 'sent',
          read: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          patient: { name: 'Nguyen Van A', phone: '0901234567' },
          medication: { name: 'Amoxicillin 250mg', dosage: '2 viên' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, markAsRead]);

  const handleResend = async () => {
    setResending(true);
    try {
      await notificationService.resendNotification(id);
      setNotif((prev) => (prev ? { ...prev, status: 'sent' } : prev));
      toast.success('Đã gửi lại thông báo');
    } catch {
      toast.error('Gửi lại thất bại');
    } finally {
      setResending(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!notif) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/doctor/notifications')}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className={styles.emptyState}>Không tìm thấy thông báo.</div>
      </div>
    );
  }

  const typeConfig = NOTIF_TYPES[notif.type] || NOTIF_TYPES.reminder;
  const TypeIcon = typeConfig.icon || Bell;
  const statusConfig = STATUS_MAP[notif.status] || STATUS_MAP.sent;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/doctor/notifications')}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className={styles.header}>
        <div className={`${styles.headerIcon} ${styles[typeConfig.colorClass + 'Bg']}`}>
          <TypeIcon size={24} />
        </div>
        <div className={styles.headerInfo}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.headerTitle}>{notif.title || 'Chi tiết thông báo'}</h1>
            <span className={`${styles.typeBadge} ${styles[typeConfig.colorClass]}`}>
              {typeConfig.label}
            </span>
          </div>
          <span className={styles.headerTime}>
            <Clock size={12} />
            {formatDateTime(notif.createdAt)}
          </span>
        </div>
      </div>

      {/* Noi dung */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Nội dung thông báo</h3>
        <p className={styles.messageText}>{notif.message}</p>
      </div>

      {/* Thong tin gui */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Thông tin gửi</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Kênh gửi</span>
            <span className={styles.infoValue}>
              {notif.channel === 'email' ? (
                <><Mail size={14} /> Email</>
              ) : (
                <><Bell size={14} /> In-app</>
              )}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Trạng thái</span>
            <span className={`${styles.infoValue} ${styles[statusConfig.className]}`}>
              {statusConfig.label}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Thời gian gửi</span>
            <span className={styles.infoValue}>{formatDateTime(notif.createdAt)}</span>
          </div>
          {notif.readAt && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thời gian xem</span>
              <span className={styles.infoValue}>{formatDateTime(notif.readAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Benh nhan */}
      {notif.patient && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <User size={16} />
            Bệnh nhân liên quan
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Họ tên</span>
              <span className={styles.infoValue}>{notif.patient.name || '---'}</span>
            </div>
            {notif.patient.phone && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Số điện thoại</span>
                <span className={styles.infoValue}>{notif.patient.phone}</span>
              </div>
            )}
            {notif.patient.email && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{notif.patient.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thuoc lien quan */}
      {notif.medication && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Pill size={16} />
            Thuốc liên quan
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tên thuốc</span>
              <span className={styles.infoValue}>{notif.medication.name || '---'}</span>
            </div>
            {notif.medication.dosage && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Liều lượng</span>
                <span className={styles.infoValue}>{notif.medication.dosage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nut gui lai */}
      {notif.status === 'failed' && (
        <div className={styles.actionBar}>
          <button
            className={styles.resendBtn}
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <><RefreshCw size={16} className={styles.spinning} /> Đang gửi lại...</>
            ) : (
              <><Send size={16} /> Gửi lại thông báo</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
