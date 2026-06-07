import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import daoReducer from './slices/daoSlice';
import walletReducer from './slices/walletSlice';
import kycReducer from './slices/kycSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kyc: kycReducer,
    property: propertyReducer,
    ui: uiReducer,
    notification: notificationReducer,
    dao: daoReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
