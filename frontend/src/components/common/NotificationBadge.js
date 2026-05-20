import { Bell } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import styles from './NotificationBadge.module.css';


export default function NotificationBadge({ size = 18 }) {
  const { unreadCount } = useNotifications();

  return (
    <span className={styles.wrapper}>
      <Bell size={size} />
      {unreadCount > 0 && (
        <span className={styles.badge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  );
}
