import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + '/analytics', 
    credentials: 'include',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getOverview: builder.query({
      query: (params = {}) => ({ url: '/overview', params }),
    }),
  }),
});

export const { useGetOverviewQuery } = analyticsApi;

