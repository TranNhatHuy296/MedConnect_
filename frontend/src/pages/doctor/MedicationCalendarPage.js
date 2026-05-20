import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, Search } from 'lucide-react';
import { medicationService } from '../../services/medicationService';
import { doctorPatientService } from '../../services/doctorPatientService';
import styles from './MedicationCalendarPage.module.css';


const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + 1); // Monday start
  return d;
}

function getStatusText(status) {
  switch (status) {
    case 'taken': return 'Đã uống';
    case 'missed': return 'Bỏ lỡ';
    default: return 'Chưa uống';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'taken': return styles.statusTaken;
    case 'missed': return styles.statusMissed;
    default: return styles.statusPending;
  }
}

function getWeekItemClass(status) {
  switch (status) {
    case 'taken': return styles.weekItemTaken;
    case 'missed': return styles.weekItemMissed;
    default: return styles.weekItemPending;
  }
}

// Khoảng thời gian gợi ý cho dropdown (Day view)
const DATE_PRESETS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'tomorrow', label: 'Ngày mai' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'custom', label: 'Tự chọn ngày...' },
];

export default function MedicationCalendarPage() {
  const [view, setView] = useState('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [weekSchedules, setWeekSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientQuery, setPatientQuery] = useState('');
  const [datePreset, setDatePreset] = useState('today');

  // Load danh sách bệnh nhân
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorPatientService.getAll();
        const list = res.data.patients || res.data || [];
        setPatients(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Lỗi tải danh sách bệnh nhân:', err);
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const fetchDayData = useCallback(async (date) => {
    setLoading(true);
    try {
      const params = { start_date: formatDate(date), end_date: formatDate(date), limit: 200 };
      if (selectedPatient) params.patient_id = selectedPatient;
      const res = await medicationService.getSchedule(params);
      const raw = res.data.logs || res.data.schedules || res.data || [];
      const mapped = Array.isArray(raw) ? raw.map(log => ({
        time: log.scheduled_time?.slice(0, 5) || '',
        label: log.schedule?.label || '',
        patientName: log.patient?.full_name || '',
        medicationName: log.schedule?.medicine?.name || '',
        dosage: log.schedule?.medicine?.dosage || '',
        unit: log.schedule?.medicine?.unit || '',
        status: log.status || 'pending',
      })) : [];
      setSchedules(mapped);
    } catch (err) {
      console.error('Lỗi tải lịch:', err);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  const fetchWeekData = useCallback(async (date) => {
    setLoading(true);
    try {
      const start = getWeekStart(date);
      const end = addDays(start, 6);
      const params = { start_date: formatDate(start), end_date: formatDate(end) };
      if (selectedPatient) params.patient_id = selectedPatient;
      const res = await medicationService.getByWeek(params);
      const raw = res.data;
      const dateMap = raw.dates || raw.schedules || (raw.calendar?.dates) || {};
      const mapped = {};
      for (const [dateStr, logs] of Object.entries(dateMap)) {
        if (Array.isArray(logs)) {
          mapped[dateStr] = logs.map(log => ({
            time: (log.scheduled_time || log.time || '').slice(0, 5),
            patientName: log.patient?.full_name || '',
            medicationName: log.schedule?.medicine?.name || log.medicationName || '',
            status: log.status || 'pending',
          }));
        }
      }
      setWeekSchedules(mapped);
    } catch (err) {
      console.error('Lỗi tải lịch tuần:', err);
      setWeekSchedules({});
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    if (view === 'day') {
      fetchDayData(currentDate);
    } else {
      fetchWeekData(currentDate);
    }
  }, [view, currentDate, fetchDayData, fetchWeekData]);

  const goToday = () => setCurrentDate(new Date());

  const goPrev = () => {
    setCurrentDate((prev) => addDays(prev, view === 'day' ? -1 : -7));
  };

  const goNext = () => {
    setCurrentDate((prev) => addDays(prev, view === 'day' ? 1 : 7));
  };

  const getDateLabel = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const start = getWeekStart(currentDate);
    const end = addDays(start, 6);
    return `${start.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })} - ${end.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;
  };

  const renderDayView = () => {
    if (schedules.length === 0) {
      return <div className={styles.emptyState}>Không có lịch uống thuốc nào cho ngày này.</div>;
    }

    return (
      <div className={styles.dayGrid}>
        {schedules.map((s, idx) => (
          <div key={idx} className={styles.scheduleCard}>
            <div className={styles.scheduleTime}>
              <Clock size={14} />
              {s.time} - {s.label || ''}
            </div>
            <div className={styles.schedulePatient}>
              Bệnh nhân: {s.patientName || s.patient?.name || '—'}
            </div>
            <div className={styles.scheduleMed}>{s.medicationName || s.medication?.name || '—'}</div>
            <div className={styles.scheduleDosage}>
              {s.dosage || ''} {s.unit || ''}
            </div>
            <span className={`${styles.statusBadge} ${getStatusClass(s.status)}`}>
              {getStatusText(s.status)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = getWeekStart(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const today = formatDate(new Date());

    return (
      <div className={styles.weekGrid}>
        {days.map((day, idx) => {
          const dateStr = formatDate(day);
          const daySchedules = weekSchedules[dateStr] || [];
          const isToday = dateStr === today;

          return (
            <div
              key={idx}
              className={`${styles.weekDay} ${isToday ? styles.weekDayToday : ''}`}
            >
              <div className={styles.weekDayHeader}>{DAY_NAMES[day.getDay()]}</div>
              <div className={styles.weekDayDate}>{day.getDate()}</div>
              {daySchedules.map((s, sIdx) => (
                <div
                  key={sIdx}
                  className={`${styles.weekItem} ${getWeekItemClass(s.status)}`}
                  title={`${s.time} - ${s.patientName ? s.patientName + ' • ' : ''}${s.medicationName || ''}`}
                >
                  {s.time} {s.patientName ? `· ${s.patientName.split(' ').slice(-1)[0]}` : ''} {s.medicationName || ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lịch uống thuốc</h1>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${view === 'day' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('day')}
          >
            Ngày
          </button>
          <button
            className={`${styles.viewBtn} ${view === 'week' ? styles.viewBtnActive : ''}`}
            onClick={() => setView('week')}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Bộ lọc bệnh nhân + thời gian */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Bệnh nhân:</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Nhập tên bệnh nhân..."
              value={patientQuery}
              onChange={(e) => {
                setPatientQuery(e.target.value);
                const matched = patients.find((p) => (p.full_name || p.name || '').toLowerCase() === e.target.value.trim().toLowerCase());
                setSelectedPatient(matched ? matched.id : '');
              }}
              list="doctor-patient-options"
              style={{
                padding: '6px 12px 6px 30px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                fontSize: 14,
                minWidth: 240,
              }}
            />
            <datalist id="doctor-patient-options">
              {patients.map((p) => (
                <option key={p.id} value={p.full_name || p.name} />
              ))}
            </datalist>
          </div>
        </div>
        {view === 'day' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 500 }}>Thời gian:</label>
            <select
              value={datePreset}
              onChange={(e) => {
                const v = e.target.value;
                setDatePreset(v);
                if (v === 'today') setCurrentDate(new Date());
                else if (v === 'tomorrow') setCurrentDate(addDays(new Date(), 1));
                else if (v === 'yesterday') setCurrentDate(addDays(new Date(), -1));
              }}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
                fontSize: 14,
              }}
            >
              {DATE_PRESETS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {datePreset === 'custom' && (
              <input
                type="date"
                value={formatDate(currentDate)}
                onChange={(e) => {
                  if (e.target.value) setCurrentDate(new Date(e.target.value));
                }}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 14,
                }}
              />
            )}
          </div>
        )}
      </div>

      <div className={styles.dateNav}>
        <button className={styles.navBtn} onClick={goPrev}>
          <ChevronLeft size={18} />
        </button>
        <span className={styles.dateLabel}>{getDateLabel()}</span>
        <button className={styles.navBtn} onClick={goNext}>
          <ChevronRight size={18} />
        </button>
        <button className={styles.todayBtn} onClick={goToday}>
          Hôm nay
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : view === 'day' ? (
        renderDayView()
      ) : (
        renderWeekView()
      )}
    </div>
  );
}
