import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { authApi } from '../features/api/authApi';
import rootReducer from './rootReducer';
import { branchApi } from '../features/api/branchApi';
import { branchAdminApi } from '../features/api/branchAdmin';
import { doctorApi } from '../features/api/doctor';
import { serviceApi } from '../features/api/serviceApi';
import { appointmentsApi } from '../features/api/appointments';
import { referredDoctorsApi } from '../features/api/referredDoctors';
import { patientApi } from '../features/api/patientApi';
import { remindersApi } from '../features/api/reminders';
import { analyticsApi } from '../features/api/analyticsApi';
import { billsApi } from '../features/api/billsApi';
import { inventoryApi } from '../features/api/inventoryApi';
import { enquiryApi } from '../features/api/enquiryApi';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(authApi.middleware, branchApi.middleware, branchAdminApi.middleware, doctorApi.middleware, serviceApi.middleware, appointmentsApi.middleware, referredDoctorsApi.middleware, patientApi.middleware, remindersApi.middleware, analyticsApi.middleware, billsApi.middleware, inventoryApi.middleware, enquiryApi.middleware),
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
