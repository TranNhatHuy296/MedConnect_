import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Phone, ArrowRight, Loader, Stethoscope, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../components/common/Toast';
import styles from './AuthPages.module.css';


export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '', role: 'patient' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Vui lòng nhập họ tên';
    else if (form.full_name.trim().length < 2) errs.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    if (!form.email) errs.email = 'Vui lòng nhập Email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email không hợp lệ';
    if (!form.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (form.password.length < 6) errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) errs.phone = 'Số điện thoại phải gồm 10 số, bắt đầu bằng 0';
    if (!form.role) errs.role = 'Vui lòng chọn vai trò';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký thất bại';
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
          <h1>Tạo <em>tài khoản</em></h1>
          <p>Đăng ký để bắt đầu sử dụng hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.roleSelector}>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.role === 'doctor' ? styles.roleActive : ''}`}
              onClick={() => update('role', 'doctor')}
            >
              <Stethoscope size={16} /> Bác sĩ
            </button>
            <button
              type="button"
              className={`${styles.roleBtn} ${form.role === 'patient' ? styles.roleActive : ''}`}
              onClick={() => update('role', 'patient')}
            >
              <Heart size={16} /> Bệnh nhân
            </button>
          </div>

          <div className={styles.formGroup}>
            <label>Họ và tên</label>
            <div className={`${styles.inputWrapper} ${errors.full_name ? styles.inputError : ''}`}>
              <User size={16} className={styles.inputIcon} />
              <input type="text" placeholder="Nguyen Van A" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
            </div>
            {errors.full_name && <span className={styles.fieldError}>{errors.full_name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Địa chỉ Email</label>
            <div className={`${styles.inputWrapper} ${errors.email ? styles.inputError : ''}`}>
              <Mail size={16} className={styles.inputIcon} />
              <input type="email" placeholder="example@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Mật khẩu</label>
            <div className={`${styles.inputWrapper} ${errors.password ? styles.inputError : ''}`}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              <button type="button" className={styles.eyeToggle} onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.formGroup}>
            <label>Số điện thoại <span className={styles.optional}>(không bắt buộc)</span></label>
            <div className={`${styles.inputWrapper} ${errors.phone ? styles.inputError : ''}`}>
              <Phone size={16} className={styles.inputIcon} />
              <input type="tel" placeholder="0901234567" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={loading} style={{ marginTop: 'var(--space-lg)' }}>
            {loading ? <Loader size={18} className={styles.spinner} /> : <>Đăng ký <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.switchLink}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
