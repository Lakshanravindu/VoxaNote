import { create } from 'zustand';
import { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface NotificationActions {
  // Data actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  
  // Read status actions
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Utility actions
  clearAll: () => void;
  reset: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Data actions
  setNotifications: (notifications) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount, loading: false, error: null });
  },

  addNotification: (notification) =>
    set((state) => {
      const newNotifications = [notification, ...state.notifications];
      const unreadCount = newNotifications.filter(n => !n.isRead).length;
      return {
        notifications: newNotifications,
        unreadCount
      };
    }),

  updateNotification: (id, updates) =>
    set((state) => {
      const notifications = state.notifications.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      );
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

  removeNotification: (id) =>
    set((state) => {
      const notifications = state.notifications.filter(n => n.id !== id);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      return { notifications, unreadCount };
    }),

  // Read status actions
  markAsRead: (id) => {
    const { updateNotification } = get();
    updateNotification(id, { isRead: true });
  },

  markAsUnread: (id) => {
    const { updateNotification } = get();
    updateNotification(id, { isRead: false });
  },

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        isRead: true
      })),
      unreadCount: 0
    })),

  // UI actions
  setLoading: (loading) =>
    set({ loading }),

  setError: (error) =>
    set({ error, loading: false }),

  clearError: () =>
    set({ error: null }),

  // Utility actions
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0
    }),

  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      error: null
    })
}));
