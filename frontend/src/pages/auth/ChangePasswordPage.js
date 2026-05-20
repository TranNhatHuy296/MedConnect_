import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, Loader, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from '../../components/common/Toast';
import styles from './AuthPages.module.css';


export default function ChangePasswordPage() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
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
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authDecoTop} />
      <div className={styles.authDecoBottom} />

      <div className={styles.authCard}>
        <div className={styles.brand}>MedConnect</div>

        <div className={styles.header}>
          <h1>Đổi <em>mật khẩu</em></h1>
          <p>Nhập mật khẩu cũ và mật khẩu mới để thay đổi</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label>Mật khẩu cũ</label>
            <div className={`${styles.inputWrapper} ${errors.oldPassword ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input type={showOld ? 'text' : 'password'} placeholder="Nhập mật khẩu hiện tại" value={form.oldPassword} onChange={(e) => update('oldPassword', e.target.value)} />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.oldPassword && <span className={styles.fieldError}>{errors.oldPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu mới</label>
            <div className={`${styles.inputWrapper} ${errors.newPassword ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input type={showNew ? 'text' : 'password'} placeholder="Tối thiểu 6 ký tự" value={form.newPassword} onChange={(e) => update('newPassword', e.target.value)} />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && <span className={styles.fieldError}>{errors.newPassword}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Xác nhận mật khẩu mới</label>
            <div className={`${styles.inputWrapper} ${errors.confirmPassword ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input type="password" placeholder="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
            </div>
            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading} style={{ marginTop: 'var(--space-lg)' }}>
            {loading ? <Loader size={18} className={styles.spinner} /> : <>Xác nhận <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.switchLink}>
          <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
