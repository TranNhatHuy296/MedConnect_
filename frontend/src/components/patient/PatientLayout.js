import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  Bell,
  Lock,
  LogOut,
  Menu,
} from 'lucide-react';
import NotificationBadge from '../common/NotificationBadge';
import styles from './PatientLayout.module.css';

const navItems = [
  { to: '/patient', label: 'Trang chính', icon: LayoutDashboard, end: true },
  { to: '/patient/prescriptions', label: 'Đơn thuốc', icon: ClipboardList },
  { to: '/patient/schedule', label: 'Lịch uống thuốc', icon: CalendarClock },
  { to: '/patient/notifications', label: 'Thông báo', icon: Bell, hasBadge: true },
  { to: '/patient/change-password', label: 'Đổi mật khẩu', icon: Lock },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitial = (name) => {
    if (!name) return 'BN';
    return name.charAt(0).toUpperCase();
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
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            Med<span className={styles.logoAccent}>Connect</span>
          </div>
        </div>

        <div className={styles.userInfo}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className={styles.avatar} style={{ objectFit: 'cover' }} />
          ) : (
            <div className={styles.avatar}>{getInitial(user?.name)}</div>
          )}
          <div>
            <div className={styles.userName}>{user?.name || 'Bệnh nhân'}</div>
            <div className={styles.userRole}>Bệnh nhân</div>
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
                <NotificationBadge size={18} />
              ) : (
                <item.icon size={18} />
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div>
            <span className={styles.greeting}>{getGreeting()}, </span>
            <span className={styles.greetingSub}>{user?.name || 'Bệnh nhân'}</span>
          </div>
          <div />
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
