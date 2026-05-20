import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, Clock, AlertTriangle } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { doctorPatientService } from '../../services/doctorPatientService';
import { drugService } from '../../services/drugService';
import styles from './CreatePrescriptionPage.module.css';


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

export default function UpdatePrescriptionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [medErrors, setMedErrors] = useState([]);

  const [patientName, setPatientName] = useState('');
  const [form, setForm] = useState({
    patient_id: '',
    start_date: '',
    end_date: '',
    notification_email: true,
    sync_google_calendar: false,
    notes: '',
  });

  const [medications, setMedications] = useState([createEmptyMed()]);
  const [drugSearchResults, setDrugSearchResults] = useState({});
  const [activeDrugSearch, setActiveDrugSearch] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const searchTimerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescRes, patientRes] = await Promise.all([
          prescriptionService.getById(id),
          doctorPatientService.getAll(),
        ]);
        const presc = prescRes.data.prescription || prescRes.data;
        setPatients(patientRes.data.patients || patientRes.data || []);

        const allPatients = patientRes.data.patients || patientRes.data || [];
        const pid = presc.patient_id || presc.patient?.id || '';
        const matched = allPatients.find((p) => String(p.id) === String(pid));
        setPatientName(presc.patient?.full_name || matched?.full_name || '');

        setForm({
          patient_id: pid,
          start_date: presc.start_date ? String(presc.start_date).split('T')[0] : '',
          end_date: presc.end_date ? String(presc.end_date).split('T')[0] : '',
          notification_email: presc.notification_email ?? true,
          sync_google_calendar: presc.google_calendar_synced ?? false,
          notes: presc.notes || '',
        });

        if (presc.medicines && presc.medicines.length > 0) {
          setMedications(
            presc.medicines.map((m) => ({
              name: m.name || '',
              dosage: m.dosage || '',
              unit: m.unit || 'vien',
              frequency: m.frequency || 1,
              schedules: m.schedules && m.schedules.length > 0
                ? m.schedules.map((s) => ({ time: s.time?.substring(0, 5) || s.time, label: s.label || 'morning' }))
                : [createEmptyTime()],
              drugRef: null,
            }))
          );
        }
      } catch (err) {
        console.error('Lỗi tải đơn thuốc:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

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
    if (field === 'frequency') {
      const target = Math.max(1, Math.min(8, parseInt(value, 10) || 1));
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
    if (field === 'name') {
      updated[index].drugRef = null;
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      if (value.trim().length >= 1) {
        setActiveDrugSearch(index);
        searchTimerRef.current = setTimeout(async () => {
          try {
            const res = await drugService.getAll({ search: value.trim() });
            setDrugSearchResults((prev) => ({ ...prev, [index]: res.data.drugs || [] }));
          } catch {
            setDrugSearchResults((prev) => ({ ...prev, [index]: [] }));
          }
        }, 300);
      } else {
        setDrugSearchResults((prev) => ({ ...prev, [index]: [] }));
        setActiveDrugSearch(null);
      }
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

    if (!form.start_date) errs.start_date = 'Vui lòng chọn ngày bắt đầu';
    if (!form.end_date) errs.end_date = 'Vui lòng chọn ngày kết thúc';
    else if (form.start_date && new Date(form.end_date) < new Date(form.start_date)) {
      errs.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    medications.forEach((med) => {
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
    setSaving(true);
    setError('');
    try {
      const submitMeds = medications.map(({ drugRef, ...rest }) => rest);
      await prescriptionService.update(id, { ...form, medicines: submitMeds });
      navigate(`/doctor/prescriptions/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật đơn thuốc.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(`/doctor/prescriptions/${id}`)}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <h1 className={styles.title}>Cập nhật đơn thuốc</h1>

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
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Thông tin chung</h3>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`} data-field-error={errors.patient_id ? 'true' : undefined}>
              <label className={styles.label}>Bệnh nhân</label>
              <input
                type="text"
                className={styles.input}
                value={patientName}
                readOnly
                disabled
                style={{ background: 'var(--color-bg-hover)', cursor: 'not-allowed' }}
                title="Không thể đổi bệnh nhân trên đơn đã tạo"
              />
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
                      if (drugSearchResults[medIdx]?.length > 0) setActiveDrugSearch(medIdx);
                    }}
                    onBlur={() => setTimeout(() => setActiveDrugSearch(null), 200)}
                    autoComplete="off"
                    style={{ width: '100%' }}
                  />
                  {medErrors[medIdx]?.name && <span className={styles.fieldError}>{medErrors[medIdx].name}</span>}
                  {activeDrugSearch === medIdx && drugSearchResults[medIdx]?.length > 0 && (
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

        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 8 }}>
          Cài đặt thông báo (email, đồng bộ Google Calendar...) được quản lý tại trang Chi tiết đơn thuốc → mục "Cài đặt thông báo".
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => navigate(`/doctor/prescriptions/${id}`)}
          >
            Hủy
          </button>
          <button type="submit" className={styles.submitBtn} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Cập nhật đơn thuốc'}
          </button>
        </div>
      </form>
    </div>
  );
}
