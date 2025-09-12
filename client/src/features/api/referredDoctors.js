import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const referredDoctorsApi = createApi({
  reducerPath: "referredDoctorsApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/referred-doctors" }),
  tagTypes: ["ReferredDoctor"],
  endpoints: (builder) => ({
    list: builder.query({
      query: (params) => ({ url: "", params }),
      providesTags: ["ReferredDoctor"],
    }),
    create: builder.mutation({
      query: (data) => ({ url: "", method: "POST", body: data, credentials: "include" }),
      invalidatesTags: ["ReferredDoctor"],
    }),
    update: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/${id}`, method: "PUT", body: data, credentials: "include" }),
      invalidatesTags: ["ReferredDoctor"],
    }),
    remove: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE", credentials: "include" }),
      invalidatesTags: ["ReferredDoctor"],
    }),
  }),
});

export const { useListQuery: useListReferredDoctorsQuery, useCreateMutation: useCreateReferredDoctorMutation, useUpdateMutation: useUpdateReferredDoctorMutation, useRemoveMutation: useDeleteReferredDoctorMutation } = referredDoctorsApi;


