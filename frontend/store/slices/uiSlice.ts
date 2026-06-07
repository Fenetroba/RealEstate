import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ToastMessage, ModalState } from '@/types';

interface UIState {
  toasts: ToastMessage[];
  modal: ModalState;
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  isPageLoading: boolean;
  /** UI-only admin sidebar + mock gov tools (sessionStorage-backed). */
  adminPreview: boolean;
}

const initialState: UIState = {
  toasts: [],
  modal: { isOpen: false, type: null },
  sidebarOpen: false,
  theme: 'light',
  isPageLoading: false,
  adminPreview: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<ToastMessage, 'id'>>) => {
      const toast: ToastMessage = {
        ...action.payload,
        id: Date.now().toString(),
        duration: action.payload.duration ?? 4000,
      };
      state.toasts.push(toast);
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: unknown }>) => {
      state.modal = { isOpen: true, type: action.payload.type, data: action.payload.data };
    },
    closeModal: (state) => {
      state.modal = { isOpen: false, type: null };
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.isPageLoading = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setAdminPreview: (state, action: PayloadAction<boolean>) => {
      state.adminPreview = action.payload;
    },
  },
});

export const {
  addToast,
  removeToast,
  openModal,
  closeModal,
  toggleSidebar,
  setSidebarOpen,
  setPageLoading,
  setTheme,
  setAdminPreview,
} = uiSlice.actions;
export default uiSlice.reducer;
