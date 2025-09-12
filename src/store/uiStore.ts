import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
  onClose?: () => void;
}

interface UIState {
  // Theme & appearance
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  
  // Reading preferences
  readingMode: boolean;
  fontSize: number;
  fontFamily: 'sans-serif' | 'serif' | 'monospace';
  lineHeight: number;
  
  // UI components state
  toasts: Toast[];
  modals: Modal[];
  loading: Record<string, boolean>;
  
  // Navigation
  currentPage: string;
  breadcrumbs: { label: string; href?: string }[];
}

interface UIActions {
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  
  // Sidebar actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  
  // Reading preferences
  setReadingMode: (enabled: boolean) => void;
  toggleReadingMode: () => void;
  setFontSize: (size: number) => void;
  setFontFamily: (family: 'sans-serif' | 'serif' | 'monospace') => void;
  setLineHeight: (height: number) => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setLoading: (key: string, loading: boolean) => void;
  clearLoading: () => void;
  
  // Navigation actions
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: { label: string; href?: string }[]) => void;
  
  // Utility actions
  reset: () => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: false,
      readingMode: false,
      fontSize: 16,
      fontFamily: 'sans-serif',
      lineHeight: 1.6,
      toasts: [],
      modals: [],
      loading: {},
      currentPage: '',
      breadcrumbs: [],

      // Theme actions
      setTheme: (theme) => 
        set({ theme }),

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
      },

      // Sidebar actions
      setSidebarOpen: (open) => 
        set({ sidebarOpen: open }),

      toggleSidebar: () => 
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Reading preferences
      setReadingMode: (enabled) => 
        set({ readingMode: enabled }),

      toggleReadingMode: () => 
        set((state) => ({ readingMode: !state.readingMode })),

      setFontSize: (size) => 
        set({ fontSize: Math.max(12, Math.min(24, size)) }),

      setFontFamily: (family) => 
        set({ fontFamily: family }),

      setLineHeight: (height) => 
        set({ lineHeight: Math.max(1.2, Math.min(2.0, height)) }),

      // Toast actions
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        
        set((state) => ({
          toasts: [...state.toasts, newToast]
        }));

        // Auto-remove toast after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      },

      removeToast: (id) => 
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        })),

      clearToasts: () => 
        set({ toasts: [] }),

      // Modal actions
      openModal: (modal) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newModal = { ...modal, id };
        
        set((state) => ({
          modals: [...state.modals, newModal]
        }));
      },

      closeModal: (id) => 
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id)
        })),

      closeAllModals: () => 
        set({ modals: [] }),

      // Loading actions
      setLoading: (key, loading) => 
        set((state) => ({
          loading: {
            ...state.loading,
            [key]: loading
          }
        })),

      clearLoading: () => 
        set({ loading: {} }),

      // Navigation actions
      setCurrentPage: (page) => 
        set({ currentPage: page }),

      setBreadcrumbs: (breadcrumbs) => 
        set({ breadcrumbs }),

      // Utility actions
      reset: () => 
        set({
          sidebarOpen: false,
          readingMode: false,
          toasts: [],
          modals: [],
          loading: {},
          currentPage: '',
          breadcrumbs: []
        })
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        lineHeight: state.lineHeight,
        readingMode: state.readingMode
      })
    }
  )
);
