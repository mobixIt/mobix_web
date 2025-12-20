import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import permissionsReducer from './slices/permissionsSlice';
import vehiclesReducer from './slices/vehiclesSlice';
import vehiclesStatsReducer from '@/store/slices/vehiclesStatsSlice';
import vehiclesCatalogsReducer from '@/store/slices/vehiclesCatalogsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionsReducer,
    vehicles: vehiclesReducer,
    vehiclesStats: vehiclesStatsReducer,
    vehiclesCatalogs: vehiclesCatalogsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;