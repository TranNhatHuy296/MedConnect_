import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import {
  CalendarClock,
  ClipboardList,
  Bell,
  Clock,
  ChevronRight,
} from 'lucide-react';
import styles from './PatientDashboardPage.module.css';


export default function PatientDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ h: 0, m: 0, s: 0 });

  const transformDashboardData = (data) => {
    const logs = data.logs || [];
    const summary = data.summary || { total: 0, taken: 0, missed: 0, pending: 0 };

    // Transform logs to todaySchedule format
    const todaySchedule = logs.map((log) => ({
      id: log.id,
      time: log.scheduled_time?.substring(0, 5) || '',
      medName: log.schedule?.medicine ? `${log.schedule.medicine.name}` : '',
      dose: log.schedule?.medicine ? `${log.schedule.medicine.dosage} ${log.schedule.medicine.unit}` : '',
      status: log.status,
    }));

    // Calculate adherence rate
    const adherenceRate = summary.total > 0
      ? Math.round((summary.taken / summary.total) * 100)
      : 0;

    // Find next pending dose
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const pendingDoses = todaySchedule.filter((s) => s.status === 'pending' && s.time >= currentTime);
    const nextDose = pendingDoses.length > 0
      ? { medName: pendingDoses[0].medName, dose: pendingDoses[0].dose, time: pendingDoses[0].time }
      : null;

    return {
      adherenceRate,
      todaySchedule,
      nextDose,
      totalPrescriptions: data.totalPrescriptions || 0,
      unreadNotifications: data.unreadNotifications || 0,
    };
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await patientService.getDashboard();
      const transformed = transformDashboardData(res.data);
      setDashboard(transformed);
    } catch {
      setDashboard({
        adherenceRate: 0,
        todaySchedule: [],
        nextDose: null,
        totalPrescriptions: 0,
        unreadNotifications: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Countdown timer
  useEffect(() => {
    if (!dashboard?.nextDose?.time) return;

    const calcCountdown = () => {
      const [hh, mm] = dashboard.nextDose.time.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hh, mm, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);

      const diff = Math.max(0, Math.floor((target - now) / 1000));
      return {
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      };
    };

    setCountdown(calcCountdown());
    const timer = setInterval(() => setCountdown(calcCountdown()), 1000);
    return () => clearInterval(timer);
  }, [dashboard?.nextDose?.time]);

  const getAdherenceClass = (rate) => {
    if (rate >= 80) return styles.adherenceGood;
    if (rate >= 50) return styles.adherenceWarning;
    return styles.adheranceBad;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'taken': return 'Đã uống';
      case 'missed': return 'Bỏ lỡ';
      default: return 'Chưa uống';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'taken': return styles.statusTaken;
      case 'missed': return styles.statusMissed;
      default: return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        Đang tải...
      </div>
    );
  }

  const pad = (n) => String(n).padStart(2, '0');
  const adherenceRate = dashboard?.adherenceRate || 0;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroPattern} />
        <div className={styles.heroContent}>
          <p className={styles.heroGreeting}>Xin chào,</p>
          <h2 className={styles.heroName}>{user?.full_name || 'Bệnh nhân'}</h2>
          <p className={styles.heroDesc}>Theo dõi lịch uống thuốc và đơn thuốc của bạn</p>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.adherenceCircle}>
            <svg viewBox="0 0 100 100" className={styles.adherenceSvg}>
              <circle cx="50" cy="50" r="42" className={styles.adherenceTrack} />
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`${styles.adherenceProgress} ${getAdherenceClass(adherenceRate)}`}
                strokeDasharray={`${adherenceRate * 2.64} 264`}
                strokeDashoffset="0"
              />
            </svg>
            <div className={styles.adherenceValue}>
              <span className={styles.adherenceNumber}>{adherenceRate}</span>
              <span className={styles.adherencePercent}>%</span>
            </div>
          </div>
          <div className={styles.adherenceLabel}>Tuân thủ</div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className={styles.quickNav}>
        <Link to="/patient/schedule" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.quickCardIconGreen}`}>
            <CalendarClock size={20} />
          </div>
          <div className={styles.quickCardContent}>
            <div className={styles.quickCardTitle}>Lịch uống thuốc</div>
            <div className={styles.quickCardDesc}>
              {dashboard?.todaySchedule?.filter(s => s.status === 'pending').length || 0} mốc chưa uống
            </div>
          </div>
          <ChevronRight size={16} className={styles.quickCardArrow} />
        </Link>

        <Link to="/patient/prescriptions" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.quickCardIconBlue}`}>
            <ClipboardList size={20} />
          </div>
          <div className={styles.quickCardContent}>
            <div className={styles.quickCardTitle}>Đơn thuốc</div>
            <div className={styles.quickCardDesc}>
              {dashboard?.totalPrescriptions || 0} đơn đang áp dụng
            </div>
          </div>
          <ChevronRight size={16} className={styles.quickCardArrow} />
        </Link>

        <Link to="/patient/notifications" className={styles.quickCard}>
          <div className={`${styles.quickCardIcon} ${styles.quickCardIconAmber}`}>
            <Bell size={20} />
          </div>
          <div className={styles.quickCardContent}>
            <div className={styles.quickCardTitle}>Thông báo</div>
            <div className={styles.quickCardDesc}>
              {dashboard?.unreadNotifications || 0} chưa đọc
            </div>
          </div>
          <ChevronRight size={16} className={styles.quickCardArrow} />
        </Link>
      </div>

      {/* Sections */}
      <div className={styles.sectionsGrid}>
        {/* Today schedule */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Lịch uống hôm nay</div>
            <Link to="/patient/schedule" className={styles.sectionLink}>Xem tất cả</Link>
          </div>

          {dashboard?.todaySchedule?.length > 0 ? (
            <div className={styles.scheduleList}>
              <div className={styles.timeline} />
              {dashboard.todaySchedule.map((item, index) => (
                <div key={item.id} className={styles.scheduleItem}>
                  <div className={styles.timelineNode}>
                    <div className={`${styles.timelineDot} ${getStatusClass(item.status)}`} />
                    {index < dashboard.todaySchedule.length - 1 && (
                      <div className={styles.timelineLine} />
                    )}
                  </div>
                  <div className={styles.scheduleContent}>
                    <span className={styles.scheduleTime}>{item.time}</span>
                    <div className={styles.scheduleInfo}>
                      <span className={styles.scheduleMed}>{item.medName}</span>
                      <span className={styles.scheduleDose}>{item.dose}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>Không có lịch uống thuốc hôm nay</div>
          )}
        </div>

        {/* Next dose */}
        <div className={`${styles.sectionCard} ${styles.nextDoseCard}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Liều tiếp theo</div>
          </div>

          {dashboard?.nextDose ? (
            <div className={styles.nextDose}>
              <div className={styles.nextDoseIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.nextDoseName}>{dashboard.nextDose.medName}</div>
              <div className={styles.nextDoseTime}>
                {dashboard.nextDose.dose} - lúc {dashboard.nextDose.time}
              </div>
              <div className={styles.countdown}>
                <div className={styles.countdownBlock}>
                  <span className={styles.countdownValue}>{pad(countdown.h)}</span>
                  <span className={styles.countdownLabel}>giờ</span>
                </div>
                <span className={styles.countdownSep}>:</span>
                <div className={styles.countdownBlock}>
                  <span className={styles.countdownValue}>{pad(countdown.m)}</span>
                  <span className={styles.countdownLabel}>phút</span>
                </div>
                <span className={styles.countdownSep}>:</span>
                <div className={styles.countdownBlock}>
                  <span className={styles.countdownValue}>{pad(countdown.s)}</span>
                  <span className={styles.countdownLabel}>giây</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>Không còn liều nào trong hôm nay</div>
          )}
        </div>
      </div>
    </div>
  );
}
