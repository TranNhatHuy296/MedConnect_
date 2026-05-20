import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { doctorPatientService } from '../../services/doctorPatientService';
import styles from './PatientAddPage.module.css';


export default function PatientAddPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    address: '',
    diagnosis: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Vui lòng nhập họ tên bệnh nhân';
    else if (form.full_name.trim().length < 2) errs.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) errs.phone = 'Số điện thoại phải gồm 10 số, bắt đầu bằng 0';
    if (form.date_of_birth) {
      const dob = new Date(form.date_of_birth);
      if (dob > new Date()) errs.date_of_birth = 'Ngày sinh không được là ngày tương lai';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      await doctorPatientService.create(form);
      navigate('/doctor/patients');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi thêm bệnh nhân.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate('/doctor/patients')}>
        <ArrowLeft size={16} />
        Quay lại
      </button>

      <h1 className={styles.title}>Thêm bệnh nhân mới</h1>

      <div className={styles.card}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Họ tên *</label>
              <input
                type="text"
                name="full_name"
                className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                value={form.full_name}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
              />
              {errors.full_name && <span className={styles.fieldError}>{errors.full_name}</span>}
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Email (dùng để đăng nhập, mật khẩu mặc định: 123456)</label>
              <input
                type="email"
                name="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="benhnhan@email.com"
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày sinh</label>
              <input
                type="date"
                name="date_of_birth"
                className={`${styles.input} ${errors.date_of_birth ? styles.inputError : ''}`}
                value={form.date_of_birth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date_of_birth && <span className={styles.fieldError}>{errors.date_of_birth}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Giới tính</label>
              <select
                name="gender"
                className={styles.select}
                value={form.gender}
                onChange={handleChange}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                value={form.phone}
                onChange={handleChange}
                placeholder="0901234567"
              />
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Địa chỉ</label>
              <input
                type="text"
                name="address"
                className={styles.input}
                value={form.address}
                onChange={handleChange}
                placeholder="Số nhà, đường, quận/huyện..."
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Chẩn đoán</label>
              <textarea
                name="diagnosis"
                className={styles.textarea}
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Mô tả chẩn đoán..."
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/doctor/patients')}
            >
              Hủy
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm bệnh nhân'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
