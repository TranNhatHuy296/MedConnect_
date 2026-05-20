import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CalendarDays, AlertTriangle, Activity, Pill, ChevronRight, Inbox } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import { doctorPatientService } from '../../services/doctorPatientService';
import { notificationService } from '../../services/notificationService';
import styles from './DashboardPage.module.css';


export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    prescriptionsThisMonth: 0,
    activePrescriptions: 0,
    todayLogs: { total: 0, taken: 0, missed: 0, pending: 0 },
    patientsNeedingAttention: [],
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, patientsRes, notifRes] = await Promise.all([
          doctorService.getDashboard(),
          doctorPatientService.getAll({ limit: 5, sort: '-createdAt' }),
          notificationService.getNotifications({ limit: 5 }).catch(() => ({ data: { notifications: [] } })),
        ]);
        setStats(dashRes.data.dashboard || dashRes.data.stats || dashRes.data);
        setRecentPatients(patientsRes.data.patients || patientsRes.data || []);
        const notifs = notifRes.data.notifications || notifRes.data || [];
        setRecentActivities(notifs.slice(0, 5));
      } catch (err) {
        console.error('Lỗi tải dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      label: 'Bệnh nhân đang điều trị',
      value: stats.totalPatients,
      icon: Users,
      colorClass: styles.statIconBlue,
      progress: Math.min(100, (stats.totalPatients / 50) * 100),
      progressColor: 'var(--color-primary)',
    },
    {
      label: 'Đơn thuốc tháng này',
      value: stats.prescriptionsThisMonth,
      icon: FileText,
      colorClass: styles.statIconGreen,
      progress: Math.min(100, (stats.prescriptionsThisMonth / 30) * 100),
      progressColor: 'var(--color-accent)',
    },
    {
      label: 'Lịch uống hôm nay',
      value: stats.todayLogs?.total || 0,
      icon: CalendarDays,
      colorClass: styles.statIconYellow,
      progress: stats.todayLogs?.total > 0
        ? ((stats.todayLogs?.taken || 0) / stats.todayLogs.total) * 100
        : 0,
      progressColor: 'var(--color-warning)',
    },
    {
      label: 'Cần theo dõi khẩn',
      value: stats.patientsNeedingAttention?.length || 0,
      icon: AlertTriangle,
      colorClass: styles.statIconRed,
      progress: Math.min(100, ((stats.patientsNeedingAttention?.length || 0) / 10) * 100),
      progressColor: 'var(--color-error)',
    },
  ];

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.banner}>
        <div className={styles.bannerPattern} />
        <div className={styles.bannerContent}>
          <h2 className={styles.bannerTitle}>
            Chào mừng trở lại, {user?.full_name || 'Bác sĩ'}
          </h2>
          <p className={styles.bannerDesc}>
            Quản lý bệnh nhân và đơn thuốc của bạn tại đây.
          </p>
          <div className={styles.bannerStats}>
            <span className={styles.bannerStat}>
              <Pill size={14} />
              {stats.activePrescriptions || 0} đơn đang hoạt động
            </span>
            <span className={styles.bannerStat}>
              <Activity size={14} />
              {stats.todayLogs?.taken || 0}/{stats.todayLogs?.total || 0} đã uống hôm nay
            </span>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div
            key={card.label}
            className={styles.statCard}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className={styles.statCardTop}>
              <div className={`${styles.statIcon} ${card.colorClass}`}>
                <card.icon size={22} />
              </div>
              <div>
                <div className={styles.statValue}>{card.value}</div>
                <div className={styles.statLabel}>{card.label}</div>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${card.progress}%`,
                  backgroundColor: card.progressColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.sectionsRow}>
        <div className={`${styles.section} ${styles.sectionMain}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Bệnh nhân gần đây</h3>
            <button className={styles.viewAll} onClick={() => navigate('/doctor/patients')}>
              Xem tất cả
              <ChevronRight size={14} />
            </button>
          </div>

          {recentPatients.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
              <div>Chưa có bệnh nhân nào.</div>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Số điện thoại</th>
                    <th>Chẩn đoán</th>
                    <th>Đơn thuốc</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPatients.map((p) => (
                    <tr
                      key={p.id}
                      className={styles.tableRow}
                      onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    >
                      <td>
                        <div className={styles.patientCell}>
                          <div className={styles.avatar}>
                            {getInitials(p.full_name)}
                          </div>
                          <span>{p.full_name}</span>
                        </div>
                      </td>
                      <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('vi-VN') : '\u2014'}</td>
                      <td>{p.phone || '\u2014'}</td>
                      <td>{p.diagnosis || '\u2014'}</td>
                      <td>
                        <span className={styles.prescriptionCount}>
                          <Pill size={12} />
                          {p.prescriptions?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          Đang điều trị
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={`${styles.section} ${styles.sectionSide}`}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Hoạt động gần đây</h3>
          </div>
          <div className={styles.activityList}>
            {recentActivities.length === 0 ? (
              <div className={styles.emptyState}>
                <Inbox size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div>Chưa có hoạt động nào.</div>
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className={styles.activityItem}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className={styles.activityIcon}>
                    <Activity size={14} />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      {activity.message || activity.title || activity.text || 'Thông báo'}
                    </div>
                    <div className={styles.activityTime}>
                      {formatTime(activity.createdAt || activity.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
