import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import styles from './Toast.module.css';


let toastId = 0;
let addToastExternal = null;

export const toast = {
  success: (message) => addToastExternal?.({ type: 'success', message }),
  error: (message) => addToastExternal?.({ type: 'error', message }),
  warning: (message) => addToastExternal?.({ type: 'warning', message }),
};

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type, message }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  useEffect(() => {
    addToastExternal = addToast;
    return () => { addToastExternal = null; };
  }, [addToast]);

  return (
    <div className={styles.container}>
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <Icon size={16} />
            <span className={styles.message}>{t.message}</span>
            <button className={styles.close} onClick={() => removeToast(t.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
