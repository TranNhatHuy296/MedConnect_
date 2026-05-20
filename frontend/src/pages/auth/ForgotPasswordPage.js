import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Loader, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { toast } from '../../components/common/Toast';
import styles from './AuthPages.module.css';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Vui lòng nhập Email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Mật khẩu mới đã được gửi đến email của bạn!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gửi yêu cầu thất bại';
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

        {sent ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--color-success-bg)', color: 'var(--color-success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-lg)',
            }}>
              <CheckCircle size={28} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-sm)', color: 'var(--color-text)' }}>
              Đã gửi mật khẩu mới!
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)', lineHeight: 1.6 }}>
              Mật khẩu mới đã được gửi đến <strong>{email}</strong>.<br />
              Vui lòng kiểm tra email và đăng nhập bằng mật khẩu mới.
            </p>
            <Link to="/login" className={styles.btnSubmit} style={{ display: 'inline-flex', textDecoration: 'none' }}>
              Quay lại đăng nhập <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h1>Quên <em>mật khẩu?</em></h1>
              <p>Nhập email đã đăng ký, hệ thống sẽ gửi mật khẩu mới cho bạn</p>
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
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  />
                </div>
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={loading} style={{ marginTop: 'var(--space-lg)' }}>
                {loading ? <Loader size={18} className={styles.spinner} /> : <>Gửi mật khẩu mới <ArrowRight size={16} /></>}
              </button>
            </form>

            <p className={styles.switchLink}>
              <Link to="/login"><ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Quay lại đăng nhập</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
