import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Phone, X, Pill, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { doctorPatientService } from '../../services/doctorPatientService';
import { prescriptionService } from '../../services/prescriptionService';
import { toast } from '../../components/common/Toast';
import styles from './PatientDetailPage.module.css';


const TREATMENT_STATUS_OPTIONS = [
  { value: 'treating', label: 'Đang điều trị' },
  { value: 'completed', label: 'Hoàn thành điều trị' },
  { value: 'stopped', label: 'Ngưng điều trị' },
  { value: 'urgent', label: 'Cần theo dõi khẩn' },
];
const TREATMENT_STATUS_MAP = TREATMENT_STATUS_OPTIONS.reduce((acc, o) => { acc[o.value] = o.label; return acc; }, {});

export default function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, prescRes] = await Promise.all([
          doctorPatientService.getById(id),
          prescriptionService.getByPatient(id),
        ]);
        setPatient(patientRes.data.patient || patientRes.data);
        setPrescriptions(prescRes.data.prescriptions || prescRes.data || []);
      } catch (err) {
        console.error('Lỗi tải chi tiết bệnh nhân:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await doctorPatientService.getMedicationHistory(id, { limit: 50 });
        setHistory(res.data.logs || res.data || []);
      } catch (err) {
        console.error('Lỗi tải lịch sử uống thuốc:', err);
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [id]);

  const openEdit = () => {
    setEditForm({
      full_name: patient.full_name || '',
      date_of_birth: patient.date_of_birth ? patient.date_of_birth.split('T')[0] : '',
      gender: patient.gender || 'male',
      phone: patient.phone || '',
      address: patient.address || '',
      diagnosis: patient.diagnosis || '',
      treatment_status: patient.treatment_status || 'treating',
    });
    setEditError('');
    setEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editForm.full_name.trim()) {
      setEditError('Vui lòng nhập họ tên');
      return;
    }
    if (editForm.phone && !/^0[0-9]{9}$/.test(editForm.phone)) {
      setEditError('Số điện thoại phải gồm 10 số, bắt đầu bằng 0');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      const res = await doctorPatientService.update(id, editForm);
      setPatient(res.data.patient || res.data || { ...patient, ...editForm });
      setEditing(false);
      toast.success('Đã cập nhật thông tin bệnh nhân');
    } catch (err) {
      setEditError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className={styles.page}>
        <button className={styles.backBtn} onClick={() => navigate('/doctor/patients')}>
          <ArrowLeft size={16} />
          Quay lại
        </button>
        <div className={styles.emptyState}>Không tìm thấy bệnh nhân.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/doctor/patients')}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 className={styles.title}>{patient.full_name}</h1>
          <span className={`${styles.badge} ${styles.badgeActive}`}>
            {TREATMENT_STATUS_MAP[patient.treatment_status || 'treating']}
          </span>
        </div>
        <button
          className={styles.addPrescBtn}
          onClick={openEdit}
          style={{ background: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          <Edit3 size={16} />
          Sửa thông tin
        </button>
      </div>

      <div className={styles.infoCard}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Ngày sinh</span>
            <span className={styles.infoValue}>
              {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('vi-VN') : '—'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Giới tính</span>
            <span className={styles.infoValue}>
              {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : '—'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Số điện thoại</span>
            <span className={styles.infoValue}>
              {patient.phone ? (
                <a href={`tel:${patient.phone}`} style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} />
                  {patient.phone}
                </a>
              ) : '\u2014'}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Địa chỉ</span>
            <span className={styles.infoValue}>{patient.address || '—'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Chẩn đoán</span>
            <span className={styles.infoValue}>{patient.diagnosis || '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Đơn thuốc</h3>
          <button
            className={styles.addPrescBtn}
            onClick={() => navigate(`/doctor/prescriptions/create?patientId=${id}`)}
          >
            <Plus size={16} />
            Tạo đơn thuốc
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <div className={styles.emptyState}>
            <Plus size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>Chưa có đơn thuốc nào.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ngày tạo</th>
                  <th>Số thuốc</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr
                    key={p.id}
                    className={styles.tableRow}
                    onClick={() => navigate(`/doctor/prescriptions/${p.id}`)}
                  >
                    <td>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>{p.medicines?.length || 0} thuốc</td>
                    <td>{p.start_date ? new Date(p.start_date).toLocaleDateString('vi-VN') : '\u2014'}</td>
                    <td>{p.end_date ? new Date(p.end_date).toLocaleDateString('vi-VN') : '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Lịch sử uống thuốc</h3>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {history.length} mục gần nhất
          </span>
        </div>
        {historyLoading ? (
          <div className={styles.emptyState}>
            <div>Đang tải lịch sử...</div>
          </div>
        ) : history.length === 0 ? (
          <div className={styles.emptyState}>
            <Pill size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>Chưa có lịch sử uống thuốc.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Tên thuốc</th>
                  <th>Liều</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => {
                  const med = log.schedule?.medicine || {};
                  const statusLabel = log.status === 'taken' ? 'Đã uống' : log.status === 'missed' ? 'Bỏ lỡ' : 'Chưa uống';
                  const Icon = log.status === 'taken' ? CheckCircle : log.status === 'missed' ? AlertTriangle : Clock;
                  return (
                    <tr key={log.id} className={styles.tableRow}>
                      <td>{log.scheduled_date ? new Date(log.scheduled_date).toLocaleDateString('vi-VN') : '—'}</td>
                      <td>{(log.scheduled_time || '').slice(0, 5) || '—'}</td>
                      <td>{med.name || '—'}</td>
                      <td>{med.dosage ? `${med.dosage} ${med.unit || ''}` : '—'}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon size={12} />
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && editForm && (
        <div className={styles.modalOverlay} onClick={() => !saving && setEditing(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Sửa thông tin bệnh nhân</h3>
              <button className={styles.modalClose} onClick={() => setEditing(false)} disabled={saving}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className={styles.modalGrid}>
                <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                  <label className={styles.modalLabel}>Họ tên *</label>
                  <input
                    type="text"
                    name="full_name"
                    className={styles.modalInput}
                    value={editForm.full_name}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className={styles.modalInput}
                    value={editForm.date_of_birth}
                    onChange={handleEditChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Giới tính</label>
                  <select
                    name="gender"
                    className={styles.modalSelect}
                    value={editForm.gender}
                    onChange={handleEditChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    className={styles.modalInput}
                    value={editForm.phone}
                    onChange={handleEditChange}
                    placeholder="0901234567"
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalLabel}>Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    className={styles.modalInput}
                    value={editForm.address}
                    onChange={handleEditChange}
                  />
                </div>
                <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                  <label className={styles.modalLabel}>Trạng thái điều trị</label>
                  <select
                    name="treatment_status"
                    className={styles.modalSelect}
                    value={editForm.treatment_status}
                    onChange={handleEditChange}
                  >
                    {TREATMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.modalField} ${styles.modalFieldFull}`}>
                  <label className={styles.modalLabel}>Chẩn đoán</label>
                  <textarea
                    name="diagnosis"
                    className={styles.modalTextarea}
                    value={editForm.diagnosis}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              {editError && <div className={styles.modalError}>{editError}</div>}
              <div className={styles.modalActions}>
                <button type="button" className={styles.modalCancel} onClick={() => setEditing(false)} disabled={saving}>
                  Hủy
                </button>
                <button type="submit" className={styles.modalSave} disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
