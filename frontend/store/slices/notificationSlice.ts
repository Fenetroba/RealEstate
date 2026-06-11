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
  async () => notificationApi.getAll(),
);

export const markAsRead = createAsyncThunk(
  'notification/markRead',
  async (id: string) => {
    await notificationApi.markRead(id);
    return id;
  },
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllRead',
  async () => notificationApi.markAllRead(),
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload as Notification);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    // fetch
    builder.addCase(fetchNotifications.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.isLoading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    });
    builder.addCase(fetchNotifications.rejected, (state) => {
      state.isLoading = false;
    });

    // mark one read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const n = state.notifications.find((x) => x.id === action.payload);
      if (n && !n.isRead) {
        n.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // mark all read
    builder.addCase(markAllAsRead.fulfilled, (state) => {
      state.notifications.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
