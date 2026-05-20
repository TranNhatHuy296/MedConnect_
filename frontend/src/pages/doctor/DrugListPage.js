import { useState, useEffect, useCallback } from 'react';
import { Search, Pill, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import { drugService } from '../../services/drugService';
import styles from './DrugListPage.module.css';


const DISEASE_OPTIONS = [
  'Huyết áp',
  'Tiểu đường',
  'Parkinson',
  'Alzheimer',
  'Xương khớp',
];

export default function DrugListPage() {
  const [drugs, setDrugs] = useState([]);
  const [search, setSearch] = useState('');
  const [disease, setDisease] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null);

  const fetchDrugs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (disease) params.disease = disease;
      const res = await drugService.getAll(params);
      setDrugs(res.data.drugs || res.data || []);
    } catch (err) {
      console.error('Lỗi tải danh mục thuốc:', err);
    } finally {
      setLoading(false);
    }
  }, [search, disease]);

  useEffect(() => {
    const timer = setTimeout(fetchDrugs, 300);
    return () => clearTimeout(timer);
  }, [fetchDrugs]);

  const openDetail = async (drug) => {
    try {
      const res = await drugService.getById(drug.id);
      setSelectedDrug(res.data.drug || res.data);
    } catch {
      setSelectedDrug(drug);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Danh mục thuốc tham khảo</h1>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên thuốc..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={disease}
            onChange={(e) => setDisease(e.target.value)}
          >
            <option value="">Tất cả bệnh</option>
            {DISEASE_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : drugs.length === 0 ? (
          <div className={styles.emptyState}>
            <Pill size={48} className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>Không tìm thấy thuốc</div>
            <div className={styles.emptyDesc}>Thử thay đổi từ khóa hoặc bộ lọc để tìm kiếm.</div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên thuốc</th>
                  <th>Bệnh</th>
                  <th>Thông tin</th>
                  <th>Cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {drugs.map((drug) => (
                  <tr
                    key={drug.id}
                    className={styles.tableRow}
                    onClick={() => openDetail(drug)}
                  >
                    <td><span className={styles.drugCode}>{drug.drug_code}</span></td>
                    <td>{drug.name}</td>
                    <td><span className={styles.diseaseBadge}>{drug.disease}</span></td>
                    <td>{drug.description ? drug.description.substring(0, 60) + (drug.description.length > 60 ? '...' : '') : '\u2014'}</td>
                    <td>
                      {drug.warning ? (
                        <span className={styles.warningText}>{drug.warning}</span>
                      ) : '\u2014'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết thuốc */}
      {selectedDrug && (
        <div className={styles.modalOverlay} onClick={() => setSelectedDrug(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedDrug.name}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedDrug(null)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Mã thuốc</div>
                <div className={styles.detailValue}>{selectedDrug.drug_code}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Bệnh</div>
                <div className={styles.detailValue}>{selectedDrug.disease}</div>
              </div>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Thông tin</div>
                <div className={styles.detailValue}>{selectedDrug.description || '\u2014'}</div>
              </div>

              {selectedDrug.warning && (
                <div className={styles.warningBox}>
                  <div className={styles.warningBoxTitle}>
                    <AlertTriangle size={16} />
                    Cảnh báo
                  </div>
                  <div className={styles.warningBoxText}>{selectedDrug.warning}</div>
                </div>
              )}

              {selectedDrug.contraindications && (
                <div className={styles.contraBox}>
                  <div className={styles.contraBoxTitle}>
                    <ShieldAlert size={16} />
                    Thuốc không dùng chung
                  </div>
                  <div className={styles.contraBoxText}>{selectedDrug.contraindications}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
