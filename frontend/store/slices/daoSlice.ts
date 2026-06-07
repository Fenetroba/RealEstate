import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DAOProposal } from '@/types';
import { daoApi } from '@/lib/api/dao';

interface DAOState {
  proposals: DAOProposal[];
  selectedProposal: DAOProposal | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DAOState = {
  proposals: [],
  selectedProposal: null,
  isLoading: false,
  error: null,
};

export const fetchProposals = createAsyncThunk('dao/fetchAll', async () => daoApi.getAll());

export const fetchProposalById = createAsyncThunk(
  'dao/fetchById',
  async (id: string) => daoApi.getById(id)
);

export const castVote = createAsyncThunk(
  'dao/vote',
  async ({ proposalId, vote }: { proposalId: string; vote: 'FOR' | 'AGAINST' | 'ABSTAIN' }) => {
    return daoApi.vote(proposalId, vote);
  }
);

const daoSlice = createSlice({
  name: 'dao',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProposals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.proposals = action.payload;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch proposals';
      });

    builder.addCase(fetchProposalById.fulfilled, (state, action) => {
      state.selectedProposal = action.payload;
    });
  },
});

export default daoSlice.reducer;
