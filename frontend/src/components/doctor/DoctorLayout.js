import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarDays,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Pill,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../common/NotificationBadge';
import styles from './DoctorLayout.module.css';

const navItems = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Trang chính', end: true },
  { to: '/doctor/patients', icon: Users, label: 'Danh sách bệnh nhân' },
  { to: '/doctor/prescriptions', icon: FileText, label: 'Danh sách đơn thuốc' },
  { to: '/doctor/drugs', icon: Pill, label: 'Danh mục thuốc' },
  { to: '/doctor/calendar', icon: CalendarDays, label: 'Lịch uống thuốc' },
  { to: '/doctor/notifications', icon: Bell, label: 'Thông báo', hasBadge: true },
  { to: '/doctor/profile', icon: UserCircle, label: 'Hồ sơ cá nhân' },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'BS';
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Chào buổi sáng';
    if (h < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <div className={styles.layout}>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <h1>MedConnect</h1>
        </div>

        <div className={styles.doctorInfo}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className={styles.avatar} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatar}>{getInitials(user?.name)}</div>
          )}
          <div>
            <div className={styles.doctorName}>{user?.name || 'Bác sĩ'}</div>
            <div className={styles.doctorRole}>Bác sĩ</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {item.hasBadge ? (
                <NotificationBadge size={20} />
              ) : (
                <item.icon className={styles.navIcon} />
              )}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className={styles.greeting}>
            {getGreeting()}, <strong>{user?.name || 'Bác sĩ'}</strong>
          </div>
          <div className={styles.topbarActions}>
            {/* Dự phòng notification bell */}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
