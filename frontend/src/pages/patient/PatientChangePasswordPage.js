import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from '../../components/common/Toast';
import styles from './PatientChangePasswordPage.module.css';


export default function PatientChangePasswordPage() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.oldPassword) errs.oldPassword = 'Vui lòng nhập mật khẩu cũ';
    if (!form.newPassword) errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (form.newPassword.length < 6) errs.newPassword = 'Mật khẩu mới tối thiểu 6 ký tự';
    else if (form.newPassword === form.oldPassword) errs.newPassword = 'Mật khẩu mới phải khác mật khẩu cũ';
    if (!form.confirmPassword) errs.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    else if (form.newPassword !== form.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      toast.success('Đổi mật khẩu thành công!');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Đổi mật khẩu</h1>
      <p className={styles.subtitle}>Nhập mật khẩu cũ và mật khẩu mới để thay đổi</p>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu cũ</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showOld ? 'text' : 'password'}
                className={`${styles.input} ${errors.oldPassword ? styles.inputError : ''}`}
                placeholder="Nhập mật khẩu hiện tại"
                value={form.oldPassword}
                onChange={(e) => update('oldPassword', e.target.value)}
              />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.oldPassword && <span className={styles.fieldError}>{errors.oldPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu mới</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showNew ? 'text' : 'password'}
                className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
                placeholder="Tối thiểu 6 ký tự"
                value={form.newPassword}
                onChange={(e) => update('newPassword', e.target.value)}
              />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && <span className={styles.fieldError}>{errors.newPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Xác nhận mật khẩu mới</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type="password"
                className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                placeholder="Nhập lại mật khẩu mới"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
              />
            </div>
            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <Loader size={18} className={styles.spinner} /> : <><CheckCircle size={16} /> Xác nhận đổi mật khẩu</>}
          </button>
        </form>
      </div>
    </div>
  );
}
