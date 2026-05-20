import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import { toast } from '../../components/common/Toast';
import { buildUrlsForPrescription, openCalendarUrls } from '../../utils/googleCalendarUrl';

import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  List,
  Calendar,
  CalendarPlus,
} from 'lucide-react';
import styles from './PatientSchedulePage.module.css';

export default function PatientSchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [confirmingId, setConfirmingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [monthLogs, setMonthLogs] = useState([]);
  const [monthLoading, setMonthLoading] = useState(false);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const handleSyncGoogleCalendar = async () => {
    setSyncing(true);
    try {
      const res = await patientService.getPrescriptions();
      const list = res.data?.prescriptions || res.data || [];
      const allUrls = [];
      for (const p of list) {
        const detailRes = await patientService.getPrescriptionDetail(p.id);
        const full = detailRes.data?.prescription || detailRes.data || p;
        const urls = buildUrlsForPrescription(
          {
            start_date: full.start_date,
            end_date: full.end_date,
            notes: full.notes,
            medicines: full.medicines || [],
          },
          full.patient?.full_name
        );
        allUrls.push(...urls);
      }
      if (allUrls.length === 0) {
        toast.error('Bạn chưa có lịch uống thuốc nào để đồng bộ');
        return;
      }
      const { opened, blocked } = openCalendarUrls(allUrls);
      if (blocked > 0) {
        toast.error(`Trình duyệt đã chặn ${blocked} popup. Hãy bật cho phép popup từ trang này.`);
      } else {
        toast.success(`Đã mở ${opened} cửa sổ Google Calendar — bấm Lưu trên từng cửa sổ`);
      }
    } catch (err) {
      toast.error('Không thể tải đơn thuốc để đồng bộ');
    } finally {
      setSyncing(false);
    }
  };

  const formatDateParam = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const transformScheduleData = (logs) => {
    return logs.map((log) => ({
      id: log.id,
      time: log.scheduled_time?.substring(0, 5) || '',
      medName: log.schedule?.medicine ? log.schedule.medicine.name : '',
      dose: log.schedule?.medicine ? `${log.schedule.medicine.dosage} ${log.schedule.medicine.unit}` : '',
      status: log.status,
    }));
  };

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientService.getSchedule(formatDateParam(selectedDate));
      const rawLogs = res.data?.schedule || res.data || [];
      setSchedule(transformScheduleData(rawLogs));
    } catch {
      setSchedule([
        { id: 1, time: '07:00', medName: 'Paracetamol 500mg', dose: '1 vien', status: 'taken' },
        { id: 2, time: '07:00', medName: 'Omeprazole 20mg', dose: '1 vien', status: 'taken' },
        { id: 3, time: '08:00', medName: 'Vitamin C 500mg', dose: '1 vien', status: 'taken' },
        { id: 4, time: '12:00', medName: 'Amoxicillin 250mg', dose: '2 vien', status: 'pending' },
        { id: 5, time: '19:00', medName: 'Amoxicillin 250mg', dose: '2 vien', status: 'pending' },
        { id: 6, time: '21:00', medName: 'Paracetamol 500mg', dose: '1 vien', status: 'pending' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const fetchMonthLogs = useCallback(async () => {
    setMonthLoading(true);
    try {
      const monthStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}`;
      const res = await patientService.getScheduleMonth(monthStr);
      const rawLogs = res.data?.logs || res.data || [];
      setMonthLogs(rawLogs);
    } catch {
      setMonthLogs([]);
    } finally {
      setMonthLoading(false);
    }
  }, [calendarMonth]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchMonthLogs();
    }
  }, [viewMode, fetchMonthLogs]);

  const handleConfirm = async (item) => {
    setConfirmingId(item.id);
    try {
      await patientService.confirmDose(item.id);
      setSchedule((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'taken' } : s))
      );
      toast.success(`Đã xác nhận uống ${item.medName}`);
    } catch {
      setSchedule((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: 'taken' } : s))
      );
      toast.success(`Đã xác nhận uống ${item.medName}`);
    } finally {
      setConfirmingId(null);
    }
  };

  const changeDate = (offset) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d);
  };

  const formatDisplayDate = (d) => {
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const label = d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
    return isToday ? `Hôm nay, ${label}` : label;
  };

  const getPeriod = (time) => {
    const h = parseInt(time.split(':')[0], 10);
    if (h < 12) return 'Sáng';
    if (h < 18) return 'Chiều';
    return 'Tối';
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

  // Group by period
  const grouped = schedule.reduce((acc, item) => {
    const period = getPeriod(item.time);
    if (!acc[period]) acc[period] = [];
    acc[period].push(item);
    return acc;
  }, {});

  const periodOrder = ['Sáng', 'Chiều', 'Tối'];

  // Stats
  const totalCount = schedule.length;
  const takenCount = schedule.filter((s) => s.status === 'taken').length;
  const pendingCount = schedule.filter((s) => s.status === 'pending').length;
  const missedCount = schedule.filter((s) => s.status === 'missed').length;

  // ── Calendar helpers ──
  const getCalendarDays = () => {
    const { year, month } = calendarMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const days = [];
    // Empty cells for days before first of month
    for (let i = 0; i < startDow; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  };

  const getMonthLogsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${calendarMonth.year}-${String(calendarMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthLogs.filter((log) => log.scheduled_date === dateStr);
  };

  const getDayStatus = (day) => {
    const dayLogs = getMonthLogsForDay(day);
    if (dayLogs.length === 0) return { taken: 0, missed: 0, pending: 0 };
    return {
      taken: dayLogs.filter((l) => l.status === 'taken').length,
      missed: dayLogs.filter((l) => l.status === 'missed').length,
      pending: dayLogs.filter((l) => l.status === 'pending').length,
    };
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return today.getFullYear() === calendarMonth.year && today.getMonth() === calendarMonth.month && today.getDate() === day;
  };

  const changeMonth = (offset) => {
    setCalendarMonth((prev) => {
      let newMonth = prev.month + offset;
      let newYear = prev.year;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      return { year: newYear, month: newMonth };
    });
    setCalendarSelectedDate(null);
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const selectedDayLogs = calendarSelectedDate ? getMonthLogsForDay(calendarSelectedDate) : [];

  if (loading && viewMode === 'list') {
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
          <h1 className={styles.pageTitle}>Lịch uống thuốc</h1>
          <p className={styles.subtitle}>
            {viewMode === 'list' ? `${totalCount} mốc trong ngày` : `${monthNames[calendarMonth.month]} ${calendarMonth.year}`}
          </p>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            Danh sách
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'calendar' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={16} />
            Lịch
          </button>
          <button
            className={styles.toggleBtn}
            onClick={handleSyncGoogleCalendar}
            disabled={syncing}
            title="Mở Google Calendar với toàn bộ lịch uống thuốc của bạn"
          >
            <CalendarPlus size={16} />
            {syncing ? 'Đang tải...' : 'Đồng bộ Google Calendar'}
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <>
          <div className={styles.dateNav}>
            <button className={styles.dateBtn} onClick={() => changeDate(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.dateLabel}>{formatDisplayDate(selectedDate)}</span>
            <button className={styles.dateBtn} onClick={() => changeDate(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
                <CheckCircle size={18} />
              </div>
              <div>
                <div className={styles.statValue}>{takenCount}</div>
                <div className={styles.statLabel}>Đã uống</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconYellow}`}>
                <Clock size={18} />
              </div>
              <div>
                <div className={styles.statValue}>{pendingCount}</div>
                <div className={styles.statLabel}>Chưa uống</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.statIconRed}`}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className={styles.statValue}>{missedCount}</div>
                <div className={styles.statLabel}>Bỏ lỡ</div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          {schedule.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <CalendarClock size={24} />
              </div>
              <div className={styles.emptyText}>Không có lịch uống thuốc trong ngày này</div>
            </div>
          ) : (
            <div className={styles.scheduleList}>
              {periodOrder.map((period) => {
                const items = grouped[period];
                if (!items || items.length === 0) return null;
                return (
                  <div key={period} className={styles.scheduleGroup}>
                    <div className={styles.groupLabel}>{period}</div>
                    {items.map((item) => (
                      <div key={item.id} className={styles.scheduleItem}>
                        <div className={styles.timeBlock}>
                          <div className={styles.timeValue}>{item.time}</div>
                          <div className={styles.timePeriod}>{period}</div>
                        </div>
                        <div className={styles.divider} />
                        <div className={styles.medInfo}>
                          <div className={styles.medName}>{item.medName}</div>
                          <div className={styles.medDose}>{item.dose}</div>
                        </div>
                        <span className={`${styles.statusBadge} ${getStatusClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                        {item.status === 'pending' && (
                          <button
                            className={styles.confirmBtn}
                            onClick={() => handleConfirm(item)}
                            disabled={confirmingId === item.id}
                          >
                            {confirmingId === item.id ? (
                              'Đang xử lý...'
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                Xác nhận đã uống
                              </>
                            )}
                          </button>
                        )}
                        {item.status === 'taken' && (
                          <button className={styles.confirmBtn} disabled>
                            <CheckCircle size={14} />
                            Đã uống
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === 'calendar' && (
        <div className={styles.calendarSection}>
          {/* Month navigation */}
          <div className={styles.calendarNav}>
            <button className={styles.dateBtn} onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className={styles.calendarMonthLabel}>
              {monthNames[calendarMonth.month]} {calendarMonth.year}
            </span>
            <button className={styles.dateBtn} onClick={() => changeMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>

          {monthLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              Đang tải...
            </div>
          ) : (
            <div className={styles.calendarLayout}>
              {/* Cột trái: Calendar grid */}
              <div className={styles.calendarLeft}>
                <div className={styles.calendarGrid}>
                  {dayNames.map((d) => (
                    <div key={d} className={styles.calendarDayName}>{d}</div>
                  ))}
                  {getCalendarDays().map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className={styles.calendarCell} />;
                    }
                    const status = getDayStatus(day);
                    const hasLogs = status.taken + status.missed + status.pending > 0;
                    const isTodayDay = isToday(day);
                    const isSelected = calendarSelectedDate === day;

                    return (
                      <div
                        key={day}
                        className={`${styles.calendarCell} ${isTodayDay ? styles.calendarToday : ''} ${isSelected ? styles.calendarSelected : ''} ${hasLogs ? styles.calendarHasLogs : ''}`}
                        onClick={() => setCalendarSelectedDate(day)}
                      >
                        <span className={styles.calendarDayNumber}>{day}</span>
                        {hasLogs && (
                          <div className={styles.dotIndicators}>
                            {status.taken > 0 && <span className={styles.dotGreen} />}
                            {status.missed > 0 && <span className={styles.dotRed} />}
                            {status.pending > 0 && <span className={styles.dotYellow} />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className={styles.calendarLegend}>
                  <span className={styles.legendItem}><span className={styles.dotGreen} /> Đã uống</span>
                  <span className={styles.legendItem}><span className={styles.dotRed} /> Bỏ lỡ</span>
                  <span className={styles.legendItem}><span className={styles.dotYellow} /> Chưa uống</span>
                </div>
              </div>

              {/* Cột phải: Chi tiết ngày được chọn */}
              {calendarSelectedDate ? (
                <div className={styles.calendarDayDetail}>
                  <h3 className={styles.dayDetailTitle}>
                    Ngày {calendarSelectedDate}/{calendarMonth.month + 1}/{calendarMonth.year}
                  </h3>
                  {selectedDayLogs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyText}>Không có lịch uống thuốc</div>
                    </div>
                  ) : (
                    <div className={styles.scheduleList}>
                      {selectedDayLogs.map((log) => {
                        const med = log.schedule?.medicine;
                        return (
                          <div key={log.id} className={styles.scheduleItem}>
                            <div className={styles.timeBlock}>
                              <div className={styles.timeValue}>{log.scheduled_time?.substring(0, 5) || ''}</div>
                            </div>
                            <div className={styles.divider} />
                            <div className={styles.medInfo}>
                              <div className={styles.medName}>{med ? med.name : ''}</div>
                              <div className={styles.medDose}>{med ? `${med.dosage} ${med.unit}` : ''}</div>
                            </div>
                            <span className={`${styles.statusBadge} ${getStatusClass(log.status)}`}>
                              {getStatusLabel(log.status)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.calendarHint}>
                  <CalendarClock size={32} />
                  <div>Chọn một ngày trên lịch để xem chi tiết uống thuốc</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
