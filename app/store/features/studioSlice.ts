import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Studio {
  _id: string;
  studioName: string;
  description: string;
  address: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  rating: number;
  reviewCount: number;
  perHourCharge: number;
  maxDistance: number;
  services: string[];
  equipment: Array<{
    name: string;
    brand?: string;
    model?: string;
  }>;
  images: Array<{
    url: string;
    caption?: string;
  }>;
  userId: {
    name: string;
    email: string;
  };
  featured: boolean;
}

interface StudioState {
  studios: Studio[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalCount: number;
  };
}

const initialState: StudioState = {
  studios: [],
  loading: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
    totalCount: 0
  }
};

export const fetchStudios = createAsyncThunk(
  'studios/fetchStudios',
  async (params: {
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minDistance?: number;
    maxDistance?: number;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.location) queryParams.append('location', params.location);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
    if (params.minDistance) queryParams.append('minDistance', params.minDistance.toString());
    if (params.maxDistance) queryParams.append('maxDistance', params.maxDistance.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/studios?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch studios');
    }
    const data = await response.json();
    return data.data;
  }
);

const studioSlice = createSlice({
  name: 'studios',
  initialState,
  reducers: {
    clearStudios: (state) => {
      state.studios = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudios.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudios.fulfilled, (state, action) => {
        state.loading = false;
        state.studios = action.payload.studios;
        state.pagination = {
          ...action.payload.pagination,
          totalCount: action.payload.pagination?.totalCount ?? action.payload.studios.length
        };
      })
      .addCase(fetchStudios.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch studios';
      });
  }
});

export const { clearStudios } = studioSlice.actions;
export default studioSlice.reducer; 