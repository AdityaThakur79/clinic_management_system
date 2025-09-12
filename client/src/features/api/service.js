import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL + "/service" }),
  tagTypes: ["Service"],
  endpoints: (builder) => ({
    // ✅ Create Service
    createService: builder.mutation({
      query: (data) => ({
        url: "/create",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Service"],
    }),

    // ✅ Get All Services (with pagination/search/filter)
    getAllServices: builder.query({
      query: (params) => ({
        url: `/all?${new URLSearchParams(params || {}).toString()}`,
        credentials: "include",
      }),
      providesTags: ["Service"],
    }),

    // ✅ Get Service by ID
    getServiceById: builder.mutation({
      query: (data) => ({
        url: "/view",
        method: "POST",
        body: data, // expects { id }
        credentials: "include",
      }),
      providesTags: ["Service"],
    }),

    // ✅ Update Service
    updateService: builder.mutation({
      query: (data) => ({
        url: "/update",
        method: "PUT",
        body: data, // expects { id, ...fields }
        credentials: "include",
      }),
      invalidatesTags: ["Service"],
    }),

    // ✅ Delete Service
    deleteService: builder.mutation({
      query: (data) => ({
        url: "/delete",
        method: "DELETE",
        body: data, // expects { id }
        credentials: "include",
      }),
      invalidatesTags: ["Service"],
    }),
  }),
});

export const {
  useCreateServiceMutation,
  useGetAllServicesQuery,
  useGetServiceByIdMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;


