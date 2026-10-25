import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number,
    actionLabel?: string,
    onAction?: () => void
  ) => void;
  success: (title: string, message?: string, actionLabel?: string, onAction?: () => void) => void;
  error: (title: string, message?: string, actionLabel?: string, onAction?: () => void) => void;
  info: (title: string, message?: string, actionLabel?: string, onAction?: () => void) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (
      type: NotificationType,
      title: string,
      message?: string,
      duration: number = 3200,
      actionLabel?: string,
      onAction?: () => void
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: NotificationItem = { id, type, title, message, duration, actionLabel, onAction };

      // Keep only current notification for ultra-clean pill presence
      setNotifications([newItem]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string, actionLabel?: string, onAction?: () => void) =>
      notify('success', title, message, 3200, actionLabel, onAction),
    [notify]
  );
  const error = useCallback(
    (title: string, message?: string, actionLabel?: string, onAction?: () => void) =>
      notify('error', title, message, 3600, actionLabel, onAction),
    [notify]
  );
  const info = useCallback(
    (title: string, message?: string, actionLabel?: string, onAction?: () => void) =>
      notify('info', title, message, 3200, actionLabel, onAction),
    [notify]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, success, error, info, dismiss }}
    >
      {children}
      {/* Toast Render Container: Sleek centered pill matching reference */}
      <div id="toast-container" className="toast-container">
        {notifications.map((n) => {
          const displayText = n.message || n.title;

          return (
            <div
              key={n.id}
              className={`toast-pill toast-pill-${n.type}`}
              role="alert"
            >
              {/* Solid Filled Circular Icon matching mockup */}
              <div className={`toast-pill-icon toast-pill-icon-${n.type}`}>
                {n.type === 'success' && <Check size={13} strokeWidth={2.8} />}
                {n.type === 'error' && <AlertCircle size={14} strokeWidth={2.6} />}
                {n.type === 'warning' && <AlertTriangle size={13} strokeWidth={2.6} />}
                {n.type === 'info' && <Info size={13} strokeWidth={2.8} />}
              </div>

              {/* Toast Message */}
              <span className="toast-pill-text">{displayText}</span>

              {/* Optional Action Button (e.g. Verify) */}
              {n.actionLabel && (
                <>
                  <div className="toast-pill-divider" />
                  <button
                    className="toast-pill-action"
                    onClick={() => {
                      n.onAction?.();
                      dismiss(n.id);
                    }}
                  >
                    {n.actionLabel}
                  </button>
                </>
              )}

              {/* Subtle Dismiss Cross */}
              <button
                onClick={() => dismiss(n.id)}
                className="toast-pill-close"
                aria-label="Dismiss notification"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
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
