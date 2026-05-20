import { useState, useEffect, useCallback } from 'react';
import { patientService } from '../../services/patientService';
import { ClipboardList, ChevronDown } from 'lucide-react';
import styles from './PatientPrescriptionPage.module.css';


export default function PatientPrescriptionPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const transformPrescriptions = (rawPrescriptions) => {
    return rawPrescriptions.map((rx) => ({
      id: rx.id,
      doctorName: rx.doctor?.full_name || '',
      createdAt: rx.createdAt || rx.created_at,
      status: rx.status,
      note: rx.notes,
      medicines: (rx.medicines || []).map((med) => ({
        name: med.name,
        dosage: med.dosage,
        unit: med.unit,
        frequency: med.frequency,
        times: (med.schedules || []).map((s) => s.time?.substring(0, 5) || s.time),
      })),
    }));
  };

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await patientService.getPrescriptions();
      const raw = res.data?.prescriptions || res.data || [];
      setPrescriptions(transformPrescriptions(raw));
    } catch {
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
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
          <h1 className={styles.pageTitle}>Đơn thuốc</h1>
          <p className={styles.subtitle}>{prescriptions.length} đơn thuốc</p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.emptyText}>Chưa có đơn thuốc nào</div>
        </div>
      ) : (
        <div className={styles.prescriptionList}>
          {prescriptions.map((rx) => (
            <div key={rx.id} className={styles.prescriptionCard}>
              <div className={styles.cardHeader} onClick={() => toggleExpand(rx.id)}>
                <div className={styles.cardHeaderLeft}>
                  <div className={styles.cardIcon}>
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <div className={styles.cardTitle}>{rx.doctorName}</div>
                    <div className={styles.cardMeta}>
                      Ngày kê: {formatDate(rx.createdAt)} &middot; {rx.medicines?.length || 0} loại thuốc
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={rx.status === 'active' ? styles.statusActive : styles.statusExpired}>
                    {rx.status === 'active' ? 'Đang áp dụng' : 'Hết hạn'}
                  </span>
                  <span className={`${styles.toggleIcon} ${expandedId === rx.id ? styles.toggleIconOpen : ''}`}>
                    <ChevronDown size={18} />
                  </span>
                </div>
              </div>

              {expandedId === rx.id && (
                <div className={styles.cardDetail}>
                  <table className={styles.medTable}>
                    <thead>
                      <tr>
                        <th>Tên thuốc</th>
                        <th>Liều lượng</th>
                        <th>Đơn vị</th>
                        <th>Số lần/ngày</th>
                        <th>Giờ uống</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rx.medicines?.map((med, idx) => (
                        <tr key={idx}>
                          <td className={styles.medName}>{med.name}</td>
                          <td>{med.dosage}</td>
                          <td>{med.unit}</td>
                          <td>{med.frequency} lần</td>
                          <td>
                            <div className={styles.timeTags}>
                              {med.times?.map((t, i) => (
                                <span key={i} className={styles.timeTag}>{t}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {rx.note && (
                    <div className={styles.doctorNote}>
                      <div className={styles.noteLabel}>Ghi chú bác sĩ</div>
                      {rx.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
