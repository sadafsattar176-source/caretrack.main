import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { InAppNotification } from '../types';

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  sendNotification: (title: string, message: string, type: 'appointment' | 'medicine' | 'system', relatedId?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('caretrack_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist notifications locally in-app
  useEffect(() => {
    try {
      localStorage.setItem('caretrack_notifications', JSON.stringify(notifications.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save in-app notifications', e);
    }
  }, [notifications]);

  // Dispatch an in-app notification to the bell panel
  const sendNotification = useCallback((
    title: string,
    message: string,
    type: 'appointment' | 'medicine' | 'system',
    relatedId?: string
  ) => {
    const newNotif: InAppNotification = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId,
    };

    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        sendNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
