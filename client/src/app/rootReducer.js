import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { branchApi } from '../features/api/branchApi';
import { authApi } from '../features/api/authApi';
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

const rootReducer = combineReducers({
  auth: authReducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [branchAdminApi.reducerPath]: branchAdminApi.reducer,
  [doctorApi.reducerPath]: doctorApi.reducer,
  [serviceApi.reducerPath]: serviceApi.reducer,
  [appointmentsApi.reducerPath]: appointmentsApi.reducer,
  [referredDoctorsApi.reducerPath]: referredDoctorsApi.reducer,
  [patientApi.reducerPath]: patientApi.reducer,
  [remindersApi.reducerPath]: remindersApi.reducer,
  [analyticsApi.reducerPath]: analyticsApi.reducer,
  [billsApi.reducerPath]: billsApi.reducer,
  [inventoryApi.reducerPath]: inventoryApi.reducer,
  [enquiryApi.reducerPath]: enquiryApi.reducer,
});

export default rootReducer;
