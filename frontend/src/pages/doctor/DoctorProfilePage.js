import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctorService';
import styles from './DoctorProfilePage.module.css';


export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    specialty: '',
    hospital: '',
    bio: '',
    license_number: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorService.getProfile();
        const profile = res.data.profile || res.data.doctor || res.data;
        setForm({
          full_name: profile.full_name || profile.name || user?.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || '',
          specialty: profile.specialty || profile.department || '',
          hospital: profile.hospital || '',
          bio: profile.bio || '',
          license_number: profile.license_number || '',
        });
        setAvatarUrl(profile.avatar || '');
      } catch (err) {
        // Dùng dữ liệu user local khi API lỗi
        setForm({
          full_name: user?.name || user?.full_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          specialty: user?.specialty || '',
          hospital: user?.hospital || '',
          bio: user?.bio || '',
          license_number: user?.license_number || '',
        });
        setAvatarUrl(user?.avatar || '');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setSuccess('');
    setError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Vui lòng nhập họ tên';
    else if (form.full_name.trim().length < 2) errs.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    if (form.phone && !/^0[0-9]{9}$/.test(form.phone)) errs.phone = 'Số điện thoại phải gồm 10 số, bắt đầu bằng 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      // Đồng thời gửi 'department' để tương thích các bản backend cũ
      const payload = { ...form, department: form.specialty };
      const res = await doctorService.updateProfile(payload);
      const updated = res.data.profile || res.data.doctor || res.data;
      updateUser({ ...user, ...updated });
      setForm((prev) => ({
        ...prev,
        specialty: updated.specialty ?? updated.department ?? prev.specialty,
        bio: updated.bio ?? prev.bio,
      }));
      setSuccess('Cập nhật hồ sơ thành công.');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ cho phép upload ảnh (jpg, png, jpeg, webp)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await doctorService.uploadAvatar(formData);
      const newAvatarUrl = res.data.avatar;
      setAvatarUrl(newAvatarUrl);
      updateUser({ ...user, avatar: newAvatarUrl });
      setSuccess('Cập nhật ảnh đại diện thành công.');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi upload ảnh.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'BS';
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 className={styles.title}>Hồ sơ cá nhân</h1>
        <button
          type="button"
          onClick={() => navigate('/change-password')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          <KeyRound size={14} />
          Đổi mật khẩu
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <div className={styles.avatarCircle}>{getInitials(form.full_name)}</div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/jpg,image/webp"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={styles.changeAvatarBtn}
              onClick={handleAvatarClick}
              disabled={uploading}
            >
              {uploading ? 'Đang tải...' : 'Đổi ảnh'}
            </button>
          </div>
          <div>
            <div className={styles.avatarName}>{form.full_name || 'Bác sĩ'}</div>
            <div className={styles.avatarEmail}>{form.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Họ tên *</label>
              <input
                type="text"
                name="full_name"
                className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                value={form.full_name}
                onChange={handleChange}
              />
              {errors.full_name && <span className={styles.fieldError}>{errors.full_name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                value={form.email}
                disabled
              />
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
              <label className={styles.label}>Chuyên khoa</label>
              <input
                type="text"
                name="specialty"
                className={styles.input}
                value={form.specialty}
                onChange={handleChange}
                placeholder="Nội khoa, Tim mạch..."
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Số chứng chỉ hành nghề</label>
              <input
                type="text"
                name="license_number"
                className={styles.input}
                value={form.license_number}
                onChange={handleChange}
                placeholder="Nhập số chứng chỉ hành nghề"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Bệnh viện / Phòng khám</label>
              <input
                type="text"
                name="hospital"
                className={styles.input}
                value={form.hospital}
                onChange={handleChange}
                placeholder="Tên bệnh viện hoặc phòng khám"
              />
            </div>

            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label className={styles.label}>Giới thiệu</label>
              <textarea
                name="bio"
                className={styles.textarea}
                value={form.bio}
                onChange={handleChange}
                placeholder="Vài dòng giới thiệu về bản thân..."
              />
            </div>
          </div>

          {success && <div className={styles.successMsg}>{success}</div>}
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
