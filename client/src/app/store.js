import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/api/authApi';
import rootReducer from './rootReducer';
import { branchApi } from '../features/api/branchApi';
import { branchAdminApi } from '../features/api/branchAdmin';
import { doctorApi } from '../features/api/doctor';
import { serviceApi } from '../features/api/service';
import { appointmentsApi } from '../features/api/appointments';
import { referredDoctorsApi } from '../features/api/referredDoctors';
import { patientsApi } from '../features/api/patients';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(authApi.middleware, branchApi.middleware, branchAdminApi.middleware, doctorApi.middleware, serviceApi.middleware, appointmentsApi.middleware, referredDoctorsApi.middleware, patientsApi.middleware),
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
