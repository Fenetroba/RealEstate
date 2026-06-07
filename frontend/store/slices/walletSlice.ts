import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { WALLET_STORAGE_KEY } from '@/lib/web3/config';
import { formatWalletError, runWalletConnect, tryAutoConnectWallet } from '@/lib/web3/connect-flow';

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isAdminOnChain: boolean;
  error: string | null;
  message: string | null;
}

const initialState: WalletState = {
  address: null,
  balance: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  isAdminOnChain: false,
  error: null,
  message: null,
};

function persistAddress(address: string | null) {
  if (typeof window === 'undefined') return;
  if (address) {
    localStorage.setItem(WALLET_STORAGE_KEY, address);
  } else {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  }
}

function applySession(
  state: WalletState,
  payload: {
    address: string;
    chainId: number;
    balance: string;
    isAdminOnChain: boolean;
  },
) {
  state.address = payload.address;
  state.chainId = payload.chainId;
  state.balance = payload.balance;
  state.isAdminOnChain = payload.isAdminOnChain;
  state.isConnected = true;
  state.error = null;
  state.message = 'Wallet connected';
  persistAddress(payload.address);
}

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      const result = await runWalletConnect(true);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(formatWalletError(error));
    }
  },
);

export const tryAutoConnect = createAsyncThunk(
  'wallet/autoConnect',
  async (_, { rejectWithValue }) => {
    try {
      const result = await tryAutoConnectWallet();
      if (!result) return null;
      return result;
    } catch (error: unknown) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Auto-connect failed');
    }
  },
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    disconnectWallet: (state) => {
      state.address = null;
      state.balance = null;
      state.chainId = null;
      state.isConnected = false;
      state.isAdminOnChain = false;
      state.error = null;
      state.message = null;
      persistAddress(null);
    },
    clearWalletMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    setWalletError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.message = null;
    },
    setWalletMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
      state.error = null;
    },
    setWalletAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
      state.isConnected = true;
      persistAddress(action.payload);
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
        state.message = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        applySession(state, action.payload);
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.error = action.payload as string;
      })
      .addCase(tryAutoConnect.pending, (state) => {
        state.isConnecting = true;
      })
      .addCase(tryAutoConnect.fulfilled, (state, action) => {
        state.isConnecting = false;
        if (action.payload) {
          applySession(state, action.payload);
        }
      })
      .addCase(tryAutoConnect.rejected, (state) => {
        state.isConnecting = false;
      });
  },
});

export const {
  disconnectWallet,
  clearWalletMessage,
  setWalletError,
  setWalletMessage,
  setWalletAddress,
  updateBalance,
} = walletSlice.actions;
export default walletSlice.reducer;
