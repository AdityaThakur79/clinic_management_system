import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + '/analytics', 
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
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


