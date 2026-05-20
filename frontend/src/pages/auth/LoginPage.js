import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader, Shield, ThumbsUp, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/common/Toast';
import styles from './AuthPages.module.css';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Vui lòng nhập Email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';
    if (!password) errs.password = 'Vui lòng nhập mật khẩu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Đăng nhập thành công!');
      navigate(user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng nhập thất bại';
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
        <p className={styles.brandDesc}>
          Nền tảng quản lý đơn thuốc và theo dõi sức khỏe thông minh
        </p>

        <div className={styles.header}>
          <h1>Chào mừng<br /><em>trở lại</em></h1>
          <p>Đăng nhập để tiếp tục hành trình chăm sóc sức khỏe</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label>Địa chỉ Email</label>
            <div className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ''}`}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
              />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.metaRow}>
            <Link to="/forgot-password" className={styles.forgotLink}>Quên mật khẩu?</Link>
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading ? <Loader size={18} className={styles.spinner} /> : <>Đăng nhập <ArrowRight size={16} /></>}
          </button>
        </form>

        {/* Trust Indicators */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <Shield size={14} className={styles.trustIcon} />
            <span>Bảo mật</span>
          </div>
          <div className={styles.trustItem}>
            <ThumbsUp size={14} className={styles.trustIcon} />
            <span>Đáng tin cậy</span>
          </div>
          <div className={styles.trustItem}>
            <Zap size={14} className={styles.trustIcon} />
            <span>Dễ sử dụng</span>
          </div>
        </div>

        <p className={styles.switchLink}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>

        <div className={styles.footer}>
          &copy; 2026 MedConnect
        </div>
      </div>
    </div>
  );
}
