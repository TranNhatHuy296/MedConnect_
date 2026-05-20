import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Clock, Bell,
  User, Calendar, CalendarCheck, Mail, Pill, Activity, CheckCircle,
} from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import styles from './PrescriptionDetailPage.module.css';


const LABEL_MAP = {
  morning: 'Sáng',
  noon: 'Trưa',
  afternoon: 'Chiều',
  evening: 'Tối',
};

export default function PrescriptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await prescriptionService.getById(id);
        setPrescription(res.data.prescription || res.data);
      } catch (err) {
        console.error('Lỗi tải đơn thuốc:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await prescriptionService.delete(id);
      navigate('/doctor/prescriptions');
    } catch (err) {
      console.error('Lỗi xóa đơn thuốc:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusInfo = (prescription) => {
    if (!prescription) return { label: 'Không xác định', className: '' };
    const now = new Date();
    const endDate = prescription.end_date ? new Date(prescription.end_date) : null;
    if (prescription.status === 'cancelled') return { label: 'Đã hủy', className: styles.statusCancelled };
    if (endDate && endDate < now) return { label: 'Hoàn thành', className: styles.statusCompleted };
    return { label: 'Đang hoạt động', className: styles.statusActive };
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/doctor/prescriptions')}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className={styles.emptyState}>Không tìm thấy đơn thuốc.</div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(prescription);

  const infoItems = [
    {
      icon: User,
      label: 'Bệnh nhân',
      value: prescription.patient?.full_name || '—',
    },
    {
      icon: Calendar,
      label: 'Ngày tạo',
      value: prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString('vi-VN') : '—',
    },
    {
      icon: CalendarCheck,
      label: 'Ngày bắt đầu',
      value: prescription.start_date ? new Date(prescription.start_date).toLocaleDateString('vi-VN') : '—',
    },
    {
      icon: Calendar,
      label: 'Ngày kết thúc',
      value: prescription.end_date ? new Date(prescription.end_date).toLocaleDateString('vi-VN') : '—',
    },
    {
      icon: Mail,
      label: 'Thông báo email',
      value: prescription.notification_email ? 'Bật' : 'Tắt',
    },
    {
      icon: prescription.google_calendar_synced ? CheckCircle : Calendar,
      label: 'Đồng bộ Google Calendar',
      value: prescription.google_calendar_synced
        ? (prescription.google_calendar_synced_at
            ? `Đã đồng bộ — ${new Date(prescription.google_calendar_synced_at).toLocaleString('vi-VN')}`
            : 'Đã đồng bộ')
        : 'Chưa đồng bộ',
    },
  ];

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/doctor/prescriptions')}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Chi tiết đơn thuốc</h1>
          <span className={`${styles.statusBadge} ${statusInfo.className}`}>
            {statusInfo.label}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.editBtn}
            onClick={() => navigate(`/doctor/prescriptions/${id}/update`)}
          >
            <Pencil size={14} />
            Cập nhật
          </button>
          <button
            className={styles.editBtn}
            onClick={() => navigate(`/doctor/prescriptions/${id}/notification-settings`)}
          >
            <Bell size={14} />
            Cài đặt thông báo
          </button>
          <button className={styles.deleteBtn} onClick={() => setShowConfirm(true)}>
            <Trash2 size={14} />
            Xóa
          </button>
        </div>
      </div>

      {/* General info */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Thông tin chung</h3>
        <div className={styles.infoGrid}>
          {infoItems.map((item, idx) => (
            <div key={idx} className={styles.infoCard}>
              <div className={styles.infoCardIcon}>
                <item.icon size={16} />
              </div>
              <div>
                <span className={styles.infoLabel}>{item.label}</span>
                <span className={styles.infoValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          <Pill size={16} />
          Danh sách thuốc ({prescription.medicines?.length || 0})
        </h3>
        {(!prescription.medicines || prescription.medicines.length === 0) ? (
          <div className={styles.emptyState}>Không có thuốc trong đơn.</div>
        ) : (
          <div className={styles.medGrid}>
            {prescription.medicines.map((med, idx) => (
              <div key={idx} className={styles.medCard}>
                <div className={styles.medCardHeader}>
                  <div className={styles.medCardIcon}>
                    <Pill size={16} />
                  </div>
                  <div className={styles.medName}>{med.name}</div>
                </div>
                <div className={styles.medDetails}>
                  <span className={styles.medDetail}>
                    <Activity size={12} />
                    Liều: {med.dosage || '—'} {med.unit}
                  </span>
                  <span className={styles.medDetail}>
                    <Clock size={12} />
                    {med.frequency} lần/ngày
                  </span>
                </div>
                {med.schedules && med.schedules.length > 0 && (
                  <>
                    <div className={styles.scheduleLabel}>Lịch uống:</div>
                    <div className={styles.scheduleTimeline}>
                      {med.schedules.map((t, tIdx) => (
                        <div key={tIdx} className={styles.scheduleNode}>
                          <div className={styles.scheduleNodeDot} />
                          <div className={styles.scheduleNodeTime}>{t.time}</div>
                          <div className={styles.scheduleNodeLabel}>
                            {LABEL_MAP[t.label] || t.label}
                          </div>
                          {tIdx < med.schedules.length - 1 && (
                            <div className={styles.scheduleNodeLine} />
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Xác nhận xóa</h3>
            <p className={styles.confirmDesc}>
              Bạn có chắc chắn muốn xóa đơn thuốc này? Hành động không thể hoàn tác.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setShowConfirm(false)}>
                Hủy
              </button>
              <button
                className={styles.confirmDelete}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
