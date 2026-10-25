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
    (type: NotificationType, title: string, message?: string, duration: number = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: NotificationItem = { id, type, title, message, duration };

      setNotifications((prev) => [...prev, newItem]);

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
      <div
        id="toast-container"
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          pointerEvents: 'none',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            className="animate-fade-in card"
            style={{
              pointerEvents: 'auto',
              padding: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
              borderLeft: `4px solid ${
                n.type === 'success'
                  ? 'var(--color-success)'
                  : n.type === 'error'
                  ? 'var(--color-danger)'
                  : n.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--color-info)'
              }`,
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{n.title}</div>
              {n.message && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {n.message}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(n.id)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.2rem', minWidth: 'auto', lineHeight: 1 }}
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
