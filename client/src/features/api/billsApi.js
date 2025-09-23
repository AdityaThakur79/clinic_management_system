import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../utils/BaseUrl';

export const billsApi = createApi({
  reducerPath: 'billsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL + '/bills',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getAllBills: builder.query({
      query: (params = {}) => ({ url: '/', params }),
    }),
    updateBillStatus: builder.mutation({
      query: ({ id, paymentStatus, paidAmount }) => ({
        url: `/${id}/status`,
        method: 'PATCH',
        body: { paymentStatus, paidAmount },
      }),
    }),
  }),
});

export const { useGetAllBillsQuery, useUpdateBillStatusMutation } = billsApi;


