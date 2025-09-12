import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { branchApi } from '../features/api/branchApi';
import { authApi } from '../features/api/authApi';
import { branchAdminApi } from '../features/api/branchAdmin';
import { doctorApi } from '../features/api/doctor';
import { serviceApi } from '../features/api/service';
import { appointmentsApi } from '../features/api/appointments';
import { referredDoctorsApi } from '../features/api/referredDoctors';
import { patientsApi } from '../features/api/patients';

const rootReducer = combineReducers({
  auth: authReducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [branchAdminApi.reducerPath]: branchAdminApi.reducer,
  [doctorApi.reducerPath]: doctorApi.reducer,
  [serviceApi.reducerPath]: serviceApi.reducer,
  [appointmentsApi.reducerPath]: appointmentsApi.reducer,
  [referredDoctorsApi.reducerPath]: referredDoctorsApi.reducer,
  [patientsApi.reducerPath]: patientsApi.reducer,
});

export default rootReducer;
