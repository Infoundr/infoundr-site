import { useState, useCallback } from 'react';

interface NotificationState {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  autoClose?: boolean;
  duration?: number;
}

export const useInFoundrNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false,
    autoClose: true,
    duration: 4000
  });

  const showNotification = useCallback((
    type: 'success' | 'error' | 'info',
    title: string,
    message: string,
    options?: {
      autoClose?: boolean;
      duration?: number;
    }
  ) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      autoClose: options?.autoClose ?? true,
      duration: options?.duration ?? 4000
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  // Convenience methods for common notification types
  const showSuccess = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showNotification('success', title, message, options);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showNotification('error', title, message, options);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string, options?: { autoClose?: boolean; duration?: number }) => {
    showNotification('info', title, message, options);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo
  };
};
