import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '@/types';
import { authApi } from '@/lib/api/auth';
import {
  clearMockAuthSession,
  isMockAuthMode,
  mockRegister,
  readMockAuthSession,
  tryMockLogin,
  writeMockAuthSession,
} from '@/lib/mock-auth';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    if (isMockAuthMode()) {
      const result = tryMockLogin(credentials.email, credentials.password);
      if ('error' in result) return rejectWithValue(result.error);
      writeMockAuthSession(result);
      return result;
    }
    try {
      const response = await authApi.login(credentials);
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.accessToken);
      }
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    data: { email: string; password: string; first_name: string; last_name: string; role: string },
    { rejectWithValue }
  ) => {
    if (isMockAuthMode()) {
      const result = mockRegister(data);
      if ('error' in result) return rejectWithValue(result.error);
      writeMockAuthSession(result);
      return result;
    }
    try {
      const response = await authApi.register(data);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    if (isMockAuthMode()) {
      const session = readMockAuthSession();
      if (!session) return rejectWithValue('No session');
      return session.user;
    }
    try {
      const response = await authApi.getMe();
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfileUser = createAsyncThunk(
  'auth/updateProfile',
  async (
    data: { first_name?: string; last_name?: string; phone?: string; location?: string; avatar?: string },
    { rejectWithValue }
  ) => {
    if (isMockAuthMode()) {
      // In mock mode, just return the data directly
      return data as Partial<User>;
    }
    try {
      const response = await authApi.updateProfile(data);
      return response;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  if (isMockAuthMode()) {
    clearMockAuthSession();
    return;
  }
  try {
    await authApi.logout();
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if ('user' in action.payload && 'accessToken' in action.payload) {
          const payload = action.payload as { user: User; accessToken: string };
          state.user = payload.user;
          state.accessToken = payload.accessToken;
          state.isAuthenticated = true;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        const session = readMockAuthSession();
        if (session) state.accessToken = session.accessToken;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    });

    // Update profile
    builder
      .addCase(updateProfileUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfileUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateProfileUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, clearAuth, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
