import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { Property, PropertyFilters, SearchResult } from '@/types';
import { propertyApi } from '@/lib/api/property';
import { readSavedPropertyIds, writeSavedPropertyIds } from '@/lib/saved-properties-storage';

interface PropertyState {
  properties: Property[];
  featuredProperties: Property[];
  selectedProperty: Property | null;
  searchResults: SearchResult | null;
  savedProperties: string[];
  filters: PropertyFilters;
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  total: number;
  page: number;
}

const initialState: PropertyState = {
  properties: [],
  featuredProperties: [],
  selectedProperty: null,
  searchResults: null,
  savedProperties: [],
  filters: { page: 1, limit: 12, sortBy: 'newest' },
  isLoading: false,
  isSearching: false,
  error: null,
  total: 0,
  page: 1,
};

export const fetchProperties = createAsyncThunk(
  'property/fetchAll',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      return await propertyApi.getAll(filters);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch properties');
    }
  }
);

export const fetchFeaturedProperties = createAsyncThunk(
  'property/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      return await propertyApi.getFeatured();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured');
    }
  }
);

export const fetchPropertyById = createAsyncThunk(
  'property/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await propertyApi.getById(id);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Property not found');
    }
  }
);

export const searchProperties = createAsyncThunk(
  'property/search',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      return await propertyApi.search(filters);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Search failed');
    }
  }
);

export const toggleSaveProperty = createAsyncThunk(
  'property/toggleSave',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      await propertyApi.toggleSave(propertyId);
      return propertyId;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to save property');
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<PropertyFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { page: 1, limit: 12, sortBy: 'newest' };
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    hydrateSavedProperties: (state) => {
      state.savedProperties = readSavedPropertyIds();
    },
    toggleSavedProperty: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const idx = state.savedProperties.indexOf(id);
      if (idx >= 0) {
        state.savedProperties.splice(idx, 1);
      } else {
        state.savedProperties.push(id);
      }
      writeSavedPropertyIds(state.savedProperties);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.properties = action.payload.properties;
        state.total = action.payload.total;
        state.page = action.payload.page;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchFeaturedProperties.fulfilled, (state, action) => {
        state.featuredProperties = action.payload;
      });

    builder
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedProperty = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(searchProperties.pending, (state) => {
        state.isSearching = true;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload;
      })
      .addCase(searchProperties.rejected, (state) => {
        state.isSearching = false;
      });

    builder.addCase(toggleSaveProperty.fulfilled, (state, action) => {
      const id = action.payload;
      const idx = state.savedProperties.indexOf(id);
      if (idx >= 0) {
        state.savedProperties.splice(idx, 1);
      } else {
        state.savedProperties.push(id);
      }
    });
  },
});

export const {
  setFilters,
  clearFilters,
  clearSelectedProperty,
  clearError,
  hydrateSavedProperties,
  toggleSavedProperty,
} = propertySlice.actions;
export default propertySlice.reducer;
