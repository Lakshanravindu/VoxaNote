// Store Barrel Export
export { useAuthStore } from './authStore';
export { useArticleStore } from './articleStore';
export { useUIStore } from './uiStore';
export { useNotificationStore } from './notificationStore';

// Store types
export type { AuthStore } from './authStore';
export type { ArticleStore } from './articleStore';
export type { UIStore } from './uiStore';
export type { NotificationStore } from './notificationStore';

// Combined store hook for complex operations
import { useAuthStore } from './authStore';
import { useArticleStore } from './articleStore';
import { useUIStore } from './uiStore';
import { useNotificationStore } from './notificationStore';

export const useStores = () => ({
  auth: useAuthStore(),
  articles: useArticleStore(),
  ui: useUIStore(),
  notifications: useNotificationStore()
});

// Store reset utility (useful for logout)
export const resetAllStores = () => {
  useAuthStore.getState().logout();
  useArticleStore.getState().reset();
  useUIStore.getState().reset();
  useNotificationStore.getState().reset();
};
