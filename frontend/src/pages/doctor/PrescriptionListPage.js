import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search } from 'lucide-react';
import { prescriptionService } from '../../services/prescriptionService';
import { doctorPatientService } from '../../services/doctorPatientService';
import styles from './PrescriptionListPage.module.css';


export default function PrescriptionListPage() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescRes, patientRes] = await Promise.all([
          prescriptionService.getAll(),
          doctorPatientService.getAll(),
        ]);
        setPrescriptions(prescRes.data.prescriptions || prescRes.data || []);
        setPatients(patientRes.data.patients || patientRes.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách đơn thuốc:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getPatientName = (presc) => {
    if (presc.patient?.full_name) return presc.patient.full_name;
    const found = patients.find((p) => String(p.id) === String(presc.patient_id));
    return found?.full_name || '—';
  };

  const filtered = search.trim()
    ? prescriptions.filter((p) => getPatientName(p).toLowerCase().includes(search.trim().toLowerCase()))
    : prescriptions;

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách đơn thuốc</h1>
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên bệnh nhân..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              list="prescription-patient-list"
            />
            <datalist id="prescription-patient-list">
              {patients.map((p) => (
                <option key={p.id} value={p.full_name} />
              ))}
            </datalist>
          </div>
          <button className={styles.addBtn} onClick={() => navigate('/doctor/prescriptions/create')}>
            <Plus size={16} />
            Tạo đơn thuốc
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
            <div>Chưa có đơn thuốc nào.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Bệnh nhân</th>
                  <th>Ngày tạo</th>
                  <th>Số thuốc</th>
                  <th>Ngày bắt đầu</th>
                  <th>Ngày kết thúc</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isActive = p.status === 'active';
                  return (
                    <tr
                      key={p.id}
                      className={styles.tableRow}
                      onClick={() => navigate(`/doctor/prescriptions/${p.id}`)}
                    >
                      <td>{getPatientName(p)}</td>
                      <td>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>{p.medicines?.length || 0} thuốc</td>
                      <td>{p.start_date ? new Date(p.start_date).toLocaleDateString('vi-VN') : '\u2014'}</td>
                      <td>{p.end_date ? new Date(p.end_date).toLocaleDateString('vi-VN') : '\u2014'}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusCompleted}`}>
                          {isActive ? 'Đang dùng' : 'Đã kết thúc'}
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
    </div>
  );
}
