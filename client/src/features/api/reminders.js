import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const remindersApi = createApi({
  reducerPath: 'remindersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + '/reminders',
    credentials: 'include',
  }),
  tagTypes: ['Reminder'],
  endpoints: (builder) => ({
    // Get all reminders with filters
    getAllReminders: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        search = '', 
        type = '', 
        status = '', 
        priority = '', 
        startDate = '', 
        endDate = '',
        branchId = '',
        doctorId = '',
        appointmentId = '',
        sortBy = '',
        sortOrder = 'desc',
      }) => ({
        url: '/',
        params: { page, limit, search, type, status, priority, startDate, endDate, branchId, doctorId, appointmentId, sortBy, sortOrder },
      }),
      providesTags: ['Reminder'],
    }),

    // Get today's reminders
    getTodayReminders: builder.query({
      query: ({ branchId, doctorId } = {}) => ({
        url: '/today',
        params: { branchId, doctorId },
      }),
      providesTags: ['Reminder'],
    }),

    // Get reminders by date range (for calendar view)
    getRemindersByDateRange: builder.query({
      query: ({ startDate, endDate, branchId, doctorId } = {}) => ({
        url: '/date-range',
        params: { startDate, endDate, branchId, doctorId },
      }),
      providesTags: ['Reminder'],
    }),

    // Get reminder by ID
    getReminderById: builder.query({
      query: (id) => ({
        url: `/${id}`,
      }),
      providesTags: ['Reminder'],
    }),

    // Create reminder
    createReminder: builder.mutation({
      query: (reminderData) => ({
        url: '/',
        method: 'POST',
        body: reminderData,
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Update reminder
    updateReminder: builder.mutation({
      query: ({ id, ...reminderData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: reminderData,
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Update reminder status
    updateReminderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Mark reminder as completed
    markReminderCompleted: builder.mutation({
      query: (id) => ({
        url: `/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Delete reminder
    deleteReminder: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Send reminder manually
    sendReminder: builder.mutation({
      query: (id) => ({
        url: `/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['Reminder'],
    }),

    // Settings
    getReminderSettings: builder.query({
      query: () => ({ url: '/settings/global' }),
      providesTags: ['Reminder'],
    }),
    updateReminderSettings: builder.mutation({
      query: (leadTimesMinutes) => ({
        url: '/settings/global',
        method: 'PUT',
        body: { leadTimesMinutes },
      }),
      invalidatesTags: ['Reminder'],
    }),
    processUpcomingReminders: builder.mutation({
      query: () => ({ url: '/process/upcoming', method: 'POST' }),
    }),
  }),
});

export const {
  useGetAllRemindersQuery,
  useGetTodayRemindersQuery,
  useGetRemindersByDateRangeQuery,
  useGetReminderByIdQuery,
  useCreateReminderMutation,
  useUpdateReminderMutation,
  useUpdateReminderStatusMutation,
  useMarkReminderCompletedMutation,
  useDeleteReminderMutation,
  useSendReminderMutation,
  useGetReminderSettingsQuery,
  useUpdateReminderSettingsMutation,
  useProcessUpcomingRemindersMutation,
} = remindersApi;

