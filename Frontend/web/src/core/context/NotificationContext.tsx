import React, { createContext, useContext, useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, title: string, message?: string, duration: number = 3200) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: NotificationItem = { id, type, title, message, duration };

      setNotifications((prev) => [...prev.slice(-1), newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string) => notify('success', title, message),
    [notify]
  );
  const error = useCallback(
    (title: string, message?: string) => notify('error', title, message),
    [notify]
  );
  const info = useCallback(
    (title: string, message?: string) => notify('info', title, message),
    [notify]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, success, error, info, dismiss }}
    >
      {children}
      {/* Toast Render Container */}
      <div id="toast-container" className="toast-container">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`toast-item toast-item-${n.type} animate-fade-in`}
          >
            <div>
              <div className="toast-title">{n.title}</div>
              {n.message && <div className="toast-message">{n.message}</div>}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="toast-close-btn"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
