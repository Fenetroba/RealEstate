import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Notification } from '@/types';
import { notificationApi } from '@/lib/api/notification';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async () => notificationApi.getAll()
);

export const markAsRead = createAsyncThunk(
  'notification/markRead',
  async (id: string) => {
    await notificationApi.markRead(id);
    return id;
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllRead',
  async () => notificationApi.markAllRead()
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n: Notification) => !n.isRead).length;
    });

    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
