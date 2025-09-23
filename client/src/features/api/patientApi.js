import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/patients",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Patient', 'Appointment', 'ReferredDoctor'],
  endpoints: (builder) => ({
    // Get all patients with filters
    getAllPatients: builder.query({
      query: ({ page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' }) => ({
        url: '/',
        params: { page, limit, search, sortBy, sortOrder },
        credentials: 'include',
      }),
      providesTags: ['Patient'],
    }),

    // Get patient by ID
    getPatientById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // Get patient details (with appointments, etc.)
    getPatientDetails: builder.query({
      query: (id) => ({
        url: `/${id}/details`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // Create patient
    createPatient: builder.mutation({
      query: (patientData) => ({
        url: '/',
        method: 'POST',
        body: patientData,
        credentials: 'include',
      }),
      invalidatesTags: ['Patient'],
    }),

    // Update patient
    updatePatient: builder.mutation({
      query: ({ id, ...patientData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: patientData,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Patient', id },
        'Patient'
      ],
    }),

    // Delete patient
    deletePatient: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Patient'],
    }),

    // Complete appointment
    completeAppointment: builder.mutation({
      query: ({ appointmentId, ...appointmentData }) => ({
        url: `/appointments/${appointmentId}/complete`,
        method: 'POST',
        body: appointmentData,
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment', 'Patient'],
    }),

    // Update completed appointment (bill/prescription/payment)
    updateCompletedAppointment: builder.mutation({
      query: ({ appointmentId, ...updateData }) => ({
        url: `/appointments/${appointmentId}/update-completed`,
        method: 'PUT',
        body: updateData,
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment', 'Patient'],
    }),

    // Get all referred doctors
    getAllReferredDoctors: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/referred-doctors',
        params: { page, limit, search },
        credentials: 'include',
      }),
      providesTags: ['ReferredDoctor'],
    }),

    // Get referred doctor details
    getReferredDoctorDetails: builder.query({
      query: (id) => ({
        url: `/referred-doctors/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'ReferredDoctor', id }],
    }),
  }),
});

export const {
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useGetPatientDetailsQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useCompleteAppointmentMutation,
  useUpdateCompletedAppointmentMutation,
  useGetAllReferredDoctorsQuery,
  useGetReferredDoctorDetailsQuery,
} = patientApi;
