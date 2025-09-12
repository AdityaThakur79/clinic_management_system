import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const patientsApi = createApi({
  reducerPath: 'patientsApi',
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
  tagTypes: ['Patient'],
  endpoints: (builder) => ({
    // Get all patients with filters
    getAllPatients: builder.query({
      query: ({ page = 1, limit = 10, search = '', branchId, sortBy = 'createdAt', sortOrder = 'desc' }) => ({
        url: '/',
        params: { page, limit, search, branchId, sortBy, sortOrder },
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
      providesTags: ['Patient'],
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
      invalidatesTags: ['Patient'],
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
  }),
});

export const {
  useGetAllPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientsApi;
