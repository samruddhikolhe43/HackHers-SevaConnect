import React, { createContext, useContext, useState } from 'react';
import { NotificationItem } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Report Status Updated',
    message: 'Your report "Injured stray dog limping near Baner Hill" was assigned to Certified Handler Rahul Verma.',
    timestamp: '15 mins ago',
    read: false,
    type: 'info',
    link: '/citizen/reports/rep-001',
  },
  {
    id: 'notif-2',
    title: 'New Available Task Nearby',
    message: 'Kitten feeding task available in Hinjawadi Phase 1 (₹350 simulated compensation).',
    timestamp: '45 mins ago',
    read: false,
    type: 'success',
    link: '/worker/tasks/tsk-202',
  },
  {
    id: 'notif-3',
    title: 'Safety Red-Line Alert',
    message: 'Incident SHY-2026-0893 flagged as Rabies Suspicion. Field worker access restricted. Escalated to Municipal Vet Rapid Ambulance.',
    timestamp: '2 hours ago',
    read: false,
    type: 'alert',
    link: '/org/reports',
  },
  {
    id: 'notif-4',
    title: 'Simulated Earnings Deposited',
    message: '₹750 simulated payout for Cattle Wound Care task has been marked as disbursed.',
    timestamp: 'Yesterday',
    read: true,
    type: 'success',
    link: '/worker/earnings',
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const openNotifications = () => setIsOpen(true);
  const closeNotifications = () => setIsOpen(false);
  const toggleNotifications = () => setIsOpen(prev => !prev);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        openNotifications,
        closeNotifications,
        toggleNotifications,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
