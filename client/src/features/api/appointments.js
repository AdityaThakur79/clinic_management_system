import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const appointmentsApi = createApi({
  reducerPath: 'appointmentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + "/appointments",
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    // Get all appointments with filters
    getAllAppointments: builder.query({
      query: ({ page = 1, limit = 10, search = '', branchId, doctorId, status = '', date, sortBy = 'createdAt', sortOrder = 'desc' }) => ({
        url: '/',
        params: { page, limit, search, branchId, doctorId, status, date, sortBy, sortOrder },
        credentials: 'include',
      }),
      providesTags: ['Appointment'],
    }),

    // Get today's appointments
    getTodayAppointments: builder.query({
      query: ({ branchId, doctorId } = {}) => ({
        url: '/today',
        params: { branchId, doctorId },
        credentials: 'include',
      }),
      providesTags: ['Appointment'],
    }),

    // Get availability for booking
    getAvailability: builder.query({
      query: ({ doctorId, branchId, date }) => ({
        url: '/availability',
        params: { doctorId, branchId, date },
      }),
    }),

    // Get availability for multiple dates (7 days)
    getMultipleDateAvailability: builder.query({
      query: ({ branchId, startDate, days = 7 }) => ({
        url: '/availability/multiple',
        params: { branchId, startDate, days },
      }),
    }),

    // Get appointment by ID
    getAppointmentById: builder.query({
      query: (id) => ({
        url: `/${id}`,
        credentials: 'include',
      }),
      providesTags: (result, error, id) => [{ type: 'Appointment', id }],
    }),

    // Create appointment
    createAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: '/',
        method: 'POST',
        body: appointmentData,
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Update appointment status
    updateAppointmentStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Update appointment time slot/date
    updateAppointmentTimeSlot: builder.mutation({
      query: ({ id, timeSlot, date }) => ({
        url: `/${id}/timeslot`,
        method: 'PATCH',
        body: { timeSlot, date },
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Delete appointment
    deleteAppointment: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment'],
    }),

    // Assign doctor to appointment
    assignDoctorToAppointment: builder.mutation({
      query: ({ appointmentId, doctorId }) => ({
        url: '/assign-doctor',
        method: 'POST',
        body: { appointmentId, doctorId },
        credentials: 'include',
      }),
      invalidatesTags: ['Appointment'],
    }),
  }),
});

export const {
  useGetAllAppointmentsQuery,
  useGetTodayAppointmentsQuery,
  useGetAvailabilityQuery,
  useGetMultipleDateAvailabilityQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentStatusMutation,
  useUpdateAppointmentTimeSlotMutation,
  useDeleteAppointmentMutation,
  useAssignDoctorToAppointmentMutation,
} = appointmentsApi;