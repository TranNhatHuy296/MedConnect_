import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Mail, Clock, RefreshCw, Save, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { prescriptionService } from '../../services/prescriptionService';
import { buildUrlsForPrescription, openCalendarUrls } from '../../utils/googleCalendarUrl';
import { toast } from '../../components/common/Toast';
import styles from './NotificationSettingsPage.module.css';


export default function NotificationSettingsPage() {
  const { id: prescriptionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prescription, setPrescription] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [settings, setSettings] = useState({
    notification_email: true,
    notify_minutes_before: 15,
    max_reminders: 3,
    notify_doctor_on_confirm: true,
    notify_doctor_on_miss: true,
    google_calendar_synced: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await notificationService.getNotificationSettings(prescriptionId);
        const data = res.data?.prescription || res.data;
        if (data) {
          setPrescription(data);
          setSettings((prev) => ({
            ...prev,
            notification_email: data.notification_email ?? prev.notification_email,
            notify_minutes_before: data.notify_minutes_before ?? prev.notify_minutes_before,
            max_reminders: data.max_reminders ?? prev.max_reminders,
            notify_doctor_on_confirm: data.notify_doctor_on_confirm ?? prev.notify_doctor_on_confirm,
            notify_doctor_on_miss: data.notify_doctor_on_miss ?? prev.notify_doctor_on_miss,
            google_calendar_synced: data.google_calendar_synced ?? false,
          }));
        }
      } catch {
        // giu mac dinh
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [prescriptionId]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notificationService.updateNotificationSettings(prescriptionId, settings);
      toast.success('Đã lưu cài đặt thông báo');
    } catch {
      toast.error('Lưu cài đặt thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncCalendar = async () => {
    if (!prescription) return;
    setSyncing(true);
    try {
      const urls = buildUrlsForPrescription(
        {
          start_date: prescription.start_date,
          end_date: prescription.end_date,
          notes: prescription.notes,
          medicines: prescription.medicines || [],
        },
        prescription.patient?.full_name
      );
      if (urls.length === 0) {
        toast.error('Không có lịch uống thuốc để đồng bộ');
        return;
      }
      const { opened, blocked } = openCalendarUrls(urls);
      if (blocked > 0) {
        toast.error(`Trình duyệt đã chặn ${blocked} popup. Hãy bật cho phép popup từ trang này.`);
      } else {
        toast.success(`Đã mở ${opened} cửa sổ Google Calendar — bấm Lưu trên từng cửa sổ`);
      }
      // Đánh dấu đã đồng bộ
      const res = await prescriptionService.markGoogleCalendarSynced(prescriptionId);
      const updated = res.data?.prescription;
      setPrescription((prev) => prev ? { ...prev, ...updated } : prev);
      setSettings((prev) => ({ ...prev, google_calendar_synced: true }));
    } catch (err) {
      toast.error('Không thể đồng bộ Google Calendar');
    } finally {
      setSyncing(false);
    }
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
      <button className={styles.backBtn} onClick={() => navigate(`/doctor/prescriptions/${prescriptionId}`)}>
        <ArrowLeft size={16} />
        Quay lại đơn thuốc
      </button>

      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <Bell size={24} />
        </div>
        <div>
          <h1 className={styles.title}>Cài đặt thông báo</h1>
          <p className={styles.subtitle}>Tùy chỉnh thông báo cho đơn thuốc này</p>
        </div>
      </div>

      {/* Email notification */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <Mail size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Thông báo qua email</div>
              <div className={styles.settingDesc}>Gửi email nhắc thuốc cho bệnh nhân</div>
            </div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notification_email}
              onChange={(e) => handleChange('notification_email', e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {/* Reminder minutes before */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <Clock size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Gửi trước bao nhiêu phút</div>
              <div className={styles.settingDesc}>Thời gian gửi thông báo trước giờ uống thuốc</div>
            </div>
          </div>
          <select
            className={styles.select}
            value={settings.notify_minutes_before}
            onChange={(e) => handleChange('notify_minutes_before', Number(e.target.value))}
          >
            <option value={5}>5 phút</option>
            <option value={10}>10 phút</option>
            <option value={15}>15 phút</option>
            <option value={30}>30 phút</option>
          </select>
        </div>
      </div>

      {/* Max retries */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <RefreshCw size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Số lần nhắc lại tối đa</div>
              <div className={styles.settingDesc}>Số lần gửi nhắc lại nếu bệnh nhân không xác nhận</div>
            </div>
          </div>
          <select
            className={styles.select}
            value={settings.max_reminders}
            onChange={(e) => handleChange('max_reminders', Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} lần</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notify doctor on confirm */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <CheckCircle size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Thông báo khi bệnh nhân xác nhận</div>
              <div className={styles.settingDesc}>Bác sĩ nhận thông báo khi bệnh nhân xác nhận đã uống thuốc</div>
            </div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notify_doctor_on_confirm}
              onChange={(e) => handleChange('notify_doctor_on_confirm', e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {/* Notify doctor on missed */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Thông báo khi bệnh nhân bỏ lỡ</div>
              <div className={styles.settingDesc}>Bác sĩ nhận thông báo khi bệnh nhân bỏ lỡ liều thuốc</div>
            </div>
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.notify_doctor_on_miss}
              onChange={(e) => handleChange('notify_doctor_on_miss', e.target.checked)}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {/* Google Calendar sync */}
      <div className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingIcon}>
              <Calendar size={18} />
            </div>
            <div>
              <div className={styles.settingLabel}>Đồng bộ Google Calendar</div>
              <div className={styles.settingDesc}>
                {settings.google_calendar_synced
                  ? `Đơn thuốc đã được đồng bộ${prescription?.google_calendar_synced_at ? ` lúc ${new Date(prescription.google_calendar_synced_at).toLocaleString('vi-VN')}` : ''}`
                  : 'Chưa đồng bộ. Bấm nút bên cạnh để mở Google Calendar với lịch uống thuốc'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSyncCalendar}
            disabled={syncing}
            style={{ minWidth: 200 }}
          >
            {syncing ? (
              <><RefreshCw size={16} className={styles.spinning} /> Đang mở...</>
            ) : settings.google_calendar_synced ? (
              <><CheckCircle size={16} /> Đồng bộ lại</>
            ) : (
              <><Calendar size={16} /> Đồng bộ ngay</>
            )}
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className={styles.actionBar}>
        <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? (
            <><RefreshCw size={16} className={styles.spinning} /> Đang lưu...</>
          ) : (
            <><Save size={16} /> Lưu cài đặt</>
          )}
        </button>
      </div>
    </div>
  );
}
