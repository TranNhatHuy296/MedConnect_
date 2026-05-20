import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, Clock, AlertTriangle } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { doctorPatientService } from '../../services/doctorPatientService';
import { drugService } from '../../services/drugService';
import { buildUrlsForPrescription, openCalendarUrls } from '../../utils/googleCalendarUrl';
import { toast } from '../../components/common/Toast';
import styles from './CreatePrescriptionPage.module.css';


// Tự suy ra nhãn morning/noon/afternoon/evening từ giờ uống (HH:mm)
const deriveLabelFromTime = (time) => {
  const h = parseInt((time || '08:00').split(':')[0], 10);
  if (h < 11) return 'morning';
  if (h < 13) return 'noon';
  if (h < 18) return 'afternoon';
  return 'evening';
};

const DEFAULT_SLOT_TIMES = ['08:00', '12:00', '17:00', '21:00', '06:00', '10:00', '15:00', '19:00'];

const createEmptyTime = () => ({
  time: '08:00',
  label: 'morning',
});

const createEmptyMed = () => ({
  name: '',
  dosage: '',
  unit: 'vien',
  frequency: 1,
  schedules: [createEmptyTime()],
  drugRef: null,
});

export default function CreatePrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [medErrors, setMedErrors] = useState([]);

  const [form, setForm] = useState({
    patient_id: searchParams.get('patientId') || '',
    start_date: '',
    end_date: '',
    notification_email: true,
    sync_google_calendar: true,
    notes: '',
  });

  const [medications, setMedications] = useState([createEmptyMed()]);
  const [drugSearchResults, setDrugSearchResults] = useState({});
  const [activeDrugSearch, setActiveDrugSearch] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [allDrugs, setAllDrugs] = useState([]);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, drugsRes] = await Promise.all([
          doctorPatientService.getAll(),
          drugService.getAll({ limit: 100 }),
        ]);
        setPatients(patientsRes.data.patients || patientsRes.data || []);
        setAllDrugs(drugsRes.data.drugs || drugsRes.data || []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
      }
    };
    fetchData();
  }, []);

  const checkConflicts = useCallback((meds) => {
    const newConflicts = [];
    for (let i = 0; i < meds.length; i++) {
      if (!meds[i].drugRef?.contraindications) continue;
      const contra = meds[i].drugRef.contraindications.toLowerCase();
      for (let j = 0; j < meds.length; j++) {
        if (i === j) continue;
        if (meds[j].name && contra.includes(meds[j].name.toLowerCase())) {
          newConflicts.push({
            drug1: meds[i].name,
            drug2: meds[j].name,
            message: `${meds[i].name} không được dùng chung với ${meds[j].name}`,
          });
        }
      }
    }
    setConflicts(newConflicts);
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'name') {
      updated[index].drugRef = null;
      setActiveDrugSearch(index);
      const filtered = value.trim().length >= 1
        ? allDrugs.filter(d => d.name.toLowerCase().includes(value.trim().toLowerCase()))
        : allDrugs;
      setDrugSearchResults((prev) => ({ ...prev, [index]: filtered }));
    }
    if (field === 'frequency') {
      // Số khung giờ phải bằng đúng "số lần dùng thuốc"
      const target = Math.max(1, parseInt(value, 10) || 1);
      const current = updated[index].schedules || [];
      if (target > current.length) {
        const next = [...current];
        while (next.length < target) {
          const t = DEFAULT_SLOT_TIMES[next.length] || '12:00';
          next.push({ time: t, label: deriveLabelFromTime(t) });
        }
        updated[index].schedules = next;
      } else if (target < current.length) {
        updated[index].schedules = current.slice(0, target);
      }
      updated[index].frequency = target;
    }
    setMedications(updated);
    checkConflicts(updated);
  };

  const selectDrug = (medIndex, drug) => {
    const updated = [...medications];
    updated[medIndex] = {
      ...updated[medIndex],
      name: drug.name,
      drugRef: drug,
    };
    setMedications(updated);
    setDrugSearchResults((prev) => ({ ...prev, [medIndex]: [] }));
    setActiveDrugSearch(null);
    checkConflicts(updated);
  };

  const addMedication = () => {
    setMedications([...medications, createEmptyMed()]);
  };

  const removeMedication = (index) => {
    if (medications.length <= 1) return;
    const updated = medications.filter((_, i) => i !== index);
    setMedications(updated);
    checkConflicts(updated);
  };

  const handleTimeChange = (medIndex, timeIndex, value) => {
    const updated = [...medications];
    updated[medIndex].schedules[timeIndex] = {
      time: value,
      label: deriveLabelFromTime(value),
    };
    setMedications(updated);
  };

  const validate = () => {
    const errs = {};
    const mErrs = [];
    let hasError = false;

    if (!form.patient_id) errs.patient_id = 'Vui lòng chọn bệnh nhân';
    if (!form.start_date) errs.start_date = 'Vui lòng chọn ngày bắt đầu';
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(form.start_date) < today) errs.start_date = 'Ngày bắt đầu không được là ngày quá khứ';
    }
    if (!form.end_date) errs.end_date = 'Vui lòng chọn ngày kết thúc';
    else if (form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
      errs.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (medications.length === 0) {
      errs.medications = 'Đơn thuốc phải có ít nhất 1 loại thuốc';
    }

    medications.forEach((med, idx) => {
      const me = {};
      if (!med.name.trim()) me.name = 'Vui lòng nhập tên thuốc';
      if (!med.dosage || med.dosage.toString().trim() === '') me.dosage = 'Vui lòng nhập liều lượng';
      else if (isNaN(Number(med.dosage)) || Number(med.dosage) <= 0) me.dosage = 'Liều lượng phải là số > 0';
      if (!med.unit) me.unit = 'Vui lòng chọn đơn vị';
      if (!med.frequency || med.frequency < 1) me.frequency = 'Số lần/ngày phải >= 1';
      if (!med.schedules || med.schedules.length === 0) me.schedules = 'Phải có ít nhất 1 giờ uống';
      if (Object.keys(me).length > 0) hasError = true;
      mErrs.push(me);
    });

    setErrors(errs);
    setMedErrors(mErrs);

    if (Object.keys(errs).length > 0 || hasError) {
      // Scroll đến field lỗi đầu tiên
      setTimeout(() => {
        const firstErr = document.querySelector('[data-field-error="true"]');
        if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (conflicts.length > 0) {
      const ok = window.confirm(
        'Có cảnh báo tương tác thuốc:\n' +
        conflicts.map((c) => c.message).join('\n') +
        '\n\nBạn có chắc muốn tiếp tục?'
      );
      if (!ok) return;
    }
    setLoading(true);
    setError('');
    try {
      const submitMeds = medications.map(({ drugRef, ...rest }) => rest);
      await prescriptionService.create({
        ...form,
        medicines: submitMeds,
      });

      // Auto-sync Google Calendar trong cùng user gesture (submit) để browser không block popup
      if (form.sync_google_calendar) {
        const patient = patients.find((p) => String(p.id) === String(form.patient_id));
        const urls = buildUrlsForPrescription(
          {
            start_date: form.start_date,
            end_date: form.end_date,
            notes: form.notes,
            medicines: submitMeds,
          },
          patient?.full_name
        );
        if (urls.length > 0) {
          const { opened, blocked } = openCalendarUrls(urls);
          if (blocked > 0) {
            toast.error(
              `Trình duyệt đã chặn ${blocked} popup. Hãy bật cho phép popup từ localhost rồi bấm "Đồng bộ Google Calendar" trên trang chi tiết đơn thuốc.`
            );
          } else {
            toast.success(`Đã mở ${opened} cửa sổ Google Calendar — bấm Lưu trên từng cửa sổ`);
          }
        }
      }

      navigate('/doctor/prescriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn thuốc.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/doctor/prescriptions')}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <h1 className={styles.title}>Tạo đơn thuốc mới</h1>

      {conflicts.length > 0 && (
        <div className={styles.conflictWarning}>
          <AlertTriangle size={16} />
          <div>
            <strong>Cảnh báo tương tác thuốc:</strong>
            {conflicts.map((c, i) => (
              <div key={i}>{c.message}</div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Patient & Date info */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Thông tin chung</h3>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`} data-field-error={errors.patient_id ? 'true' : undefined}>
              <label className={styles.label}>Bệnh nhân *</label>
              <select
                name="patient_id"
                className={`${styles.select} ${errors.patient_id ? styles.inputError : ''}`}
                value={form.patient_id}
                onChange={handleFormChange}
              >
                <option value="">Chọn bệnh nhân</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
              {errors.patient_id && <span className={styles.fieldError}>{errors.patient_id}</span>}
            </div>
            <div className={styles.formGroup} data-field-error={errors.start_date ? 'true' : undefined}>
              <label className={styles.label}>Ngày bắt đầu *</label>
              <input
                type="date"
                name="start_date"
                className={`${styles.input} ${errors.start_date ? styles.inputError : ''}`}
                value={form.start_date}
                onChange={handleFormChange}
              />
              {errors.start_date && <span className={styles.fieldError}>{errors.start_date}</span>}
            </div>
            <div className={styles.formGroup} data-field-error={errors.end_date ? 'true' : undefined}>
              <label className={styles.label}>Ngày kết thúc *</label>
              <input
                type="date"
                name="end_date"
                className={`${styles.input} ${errors.end_date ? styles.inputError : ''}`}
                value={form.end_date}
                onChange={handleFormChange}
              />
              {errors.end_date && <span className={styles.fieldError}>{errors.end_date}</span>}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className={styles.medSection}>
          <div className={styles.medHeader}>
            <h3 className={styles.medTitle}>Danh sách thuốc</h3>
            <button type="button" className={styles.addMedBtn} onClick={addMedication}>
              <Plus size={14} />
              Thêm thuốc
            </button>
          </div>

          {medications.map((med, medIdx) => (
            <div key={medIdx} className={styles.medItem}>
              <div className={styles.medItemHeader}>
                <span className={styles.medItemTitle}>Thuốc {medIdx + 1}</span>
                {medications.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeMedBtn}
                    onClick={() => removeMedication(medIdx)}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className={styles.medGrid}>
                <div style={{ position: 'relative' }} data-field-error={medErrors[medIdx]?.name ? 'true' : undefined}>
                  <label className={styles.medFieldLabel}>Tên thuốc *</label>
                  <input
                    type="text"
                    className={`${styles.smallInput} ${medErrors[medIdx]?.name ? styles.inputError : ''}`}
                    placeholder="Nhập tên thuốc"
                    value={med.name}
                    onChange={(e) => handleMedChange(medIdx, 'name', e.target.value)}
                    onFocus={() => {
                      setActiveDrugSearch(medIdx);
                      const filtered = med.name.trim().length >= 1
                        ? allDrugs.filter(d => d.name.toLowerCase().includes(med.name.trim().toLowerCase()))
                        : allDrugs;
                      setDrugSearchResults((prev) => ({ ...prev, [medIdx]: filtered }));
                    }}
                    onBlur={() => setTimeout(() => setActiveDrugSearch(null), 300)}
                    autoComplete="off"
                    style={{ width: '100%' }}
                  />
                  {medErrors[medIdx]?.name && <span className={styles.fieldError}>{medErrors[medIdx].name}</span>}
                  {activeDrugSearch === medIdx && (drugSearchResults[medIdx]?.length > 0 || med.name.trim() === '') && (
                    <div className={styles.drugDropdown}>
                      {drugSearchResults[medIdx].map((drug) => (
                        <div
                          key={drug.id}
                          className={styles.drugDropdownItem}
                          onMouseDown={() => selectDrug(medIdx, drug)}
                        >
                          <span className={styles.drugDropdownName}>{drug.name}</span>
                          <span className={styles.drugDropdownDisease}>{drug.disease}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className={styles.medFieldLabel}>Liều lượng *</label>
                  <input
                    type="text"
                    className={`${styles.smallInput} ${medErrors[medIdx]?.dosage ? styles.inputError : ''}`}
                    placeholder="VD: 1"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(medIdx, 'dosage', e.target.value)}
                  />
                  {medErrors[medIdx]?.dosage && <span className={styles.fieldError}>{medErrors[medIdx].dosage}</span>}
                </div>
                <div>
                  <label className={styles.medFieldLabel}>Đơn vị</label>
                  <select
                    className={`${styles.smallSelect} ${medErrors[medIdx]?.unit ? styles.inputError : ''}`}
                    value={med.unit}
                    onChange={(e) => handleMedChange(medIdx, 'unit', e.target.value)}
                  >
                    <option value="vien">Viên</option>
                    <option value="ml">ml</option>
                    <option value="mg">mg</option>
                    <option value="goi">Gói</option>
                    <option value="ong">Ống</option>
                  </select>
                </div>
                <div>
                  <label className={styles.medFieldLabel}>Số lần dùng thuốc *</label>
                  <input
                    type="number"
                    className={`${styles.smallInput} ${medErrors[medIdx]?.frequency ? styles.inputError : ''}`}
                    placeholder="Lần/ngày"
                    min="1"
                    max="8"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(medIdx, 'frequency', Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                  {medErrors[medIdx]?.frequency && <span className={styles.fieldError}>{medErrors[medIdx].frequency}</span>}
                </div>
              </div>

              {med.drugRef?.warning && (
                <div className={styles.medWarning}>
                  <AlertTriangle size={12} />
                  <span>{med.drugRef.warning}</span>
                </div>
              )}

              <div className={styles.timesSection}>
                <div className={styles.timesLabel}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  Giờ uống thuốc ({med.schedules.length}/{med.frequency || 1})
                </div>
                <div className={styles.timeSlots}>
                  {med.schedules.map((t, tIdx) => (
                    <div key={tIdx} className={styles.timeSlot}>
                      <input
                        type="time"
                        className={styles.timeInput}
                        value={t.time}
                        onChange={(e) => handleTimeChange(medIdx, tIdx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  Số khung giờ được tự động tạo theo "Số lần dùng thuốc".
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notification settings */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Cài đặt thông báo & đồng bộ</h3>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="notification_email"
              name="notification_email"
              checked={form.notification_email}
              onChange={handleFormChange}
            />
            <label htmlFor="notification_email" className={styles.checkboxLabel}>
              Gửi thông báo qua email cho bệnh nhân
            </label>
          </div>
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="sync_google_calendar"
              name="sync_google_calendar"
              checked={form.sync_google_calendar}
              onChange={handleFormChange}
            />
            <label htmlFor="sync_google_calendar" className={styles.checkboxLabel}>
              Tự đồng bộ lịch uống thuốc lên Google Calendar sau khi tạo đơn
            </label>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate('/doctor/prescriptions')}
          >
            Hủy
          </button>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo đơn thuốc'}
          </button>
        </div>
      </form>
    </div>
  );
}
