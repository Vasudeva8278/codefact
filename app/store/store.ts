import { configureStore } from '@reduxjs/toolkit';
import studioReducer from './features/studioSlice';

export const store = configureStore({
  reducer: {
    studios: studioReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 