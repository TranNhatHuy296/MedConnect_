import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Users, UserCheck, UserX } from 'lucide-react';
import { doctorPatientService } from '../../services/doctorPatientService';
import styles from './PatientListPage.module.css';


const TREATMENT_STATUS_OPTIONS = [
  { value: 'treating', label: 'Đang điều trị' },
  { value: 'completed', label: 'Hoàn thành điều trị' },
  { value: 'stopped', label: 'Ngưng điều trị' },
  { value: 'urgent', label: 'Cần theo dõi khẩn' },
];

const TREATMENT_STATUS_MAP = TREATMENT_STATUS_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

export default function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorPatientService.getAll();
        setPatients(res.data.patients || res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách bệnh nhân:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) =>
    (p.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search) ||
    (p.diagnosis || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = patients.filter((p) => (p.treatment_status || 'treating') === 'treating').length;
  const inactiveCount = patients.length - activeCount;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed': return styles.badgeCompleted || styles.badgeInactive;
      case 'stopped': return styles.badgeInactive;
      case 'urgent': return styles.badgeUrgent || styles.badgeInactive;
      default: return styles.badgeActive;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
      <div className={styles.header}>
        <h1 className={styles.title}>Danh sách bệnh nhân</h1>
        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên, SĐT, chẩn đoán..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.addBtn} onClick={() => navigate('/doctor/patients/add')}>
            <Plus size={16} />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Stat Summary Bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconTotal}`}>
            <Users size={16} />
          </div>
          <div>
            <div className={styles.summaryValue}>{patients.length}</div>
            <div className={styles.summaryLabel}>Tổng bệnh nhân</div>
          </div>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconActive}`}>
            <UserCheck size={16} />
          </div>
          <div>
            <div className={styles.summaryValue}>{activeCount}</div>
            <div className={styles.summaryLabel}>Đang điều trị</div>
          </div>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.summaryIconInactive}`}>
            <UserX size={16} />
          </div>
          <div>
            <div className={styles.summaryValue}>{inactiveCount}</div>
            <div className={styles.summaryLabel}>Ngừng điều trị</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {search ? 'Không tìm thấy bệnh nhân phù hợp.' : 'Chưa có bệnh nhân nào.'}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Số điện thoại</th>
                <th>Chẩn đoán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
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
                      <span className={styles.patientName}>{p.full_name}</span>
                    </div>
                  </td>
                  <td>{p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString('vi-VN') : '—'}</td>
                  <td>{p.gender === 'male' ? 'Nam' : p.gender === 'female' ? 'Nữ' : '—'}</td>
                  <td>{p.phone || '—'}</td>
                  <td>{p.diagnosis || '—'}</td>
                  <td>
                    <span className={`${styles.badge} ${getStatusBadgeClass(p.treatment_status || 'treating')}`}>
                      {TREATMENT_STATUS_MAP[p.treatment_status || 'treating']}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
