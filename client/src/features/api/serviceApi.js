import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../../utils/BaseUrl";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: BASE_URL + "/service",
    credentials: "include"
  }),
  tagTypes: ["Service"],
  endpoints: (builder) => ({
    getAllServices: builder.query({
      query: (params) => ({ url: "/all", params }),
      providesTags: ["Service"],
    }),
    getServiceById: builder.query({
      query: (id) => ({ url: `/${id}` }),
      providesTags: (result, error, id) => [{ type: "Service", id }],
    }),
    createService: builder.mutation({
      query: (data) => ({ 
        url: "", 
        method: "POST", 
        body: data 
      }),
      invalidatesTags: ["Service"],
    }),
    updateService: builder.mutation({
      query: ({ id, ...data }) => ({ 
        url: `/${id}`, 
        method: "PUT", 
        body: data 
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Service", id }, "Service"],
    }),
    deleteService: builder.mutation({
      query: (id) => ({ 
        url: `/${id}`, 
        method: "DELETE" 
      }),
      invalidatesTags: (result, error, id) => [{ type: "Service", id }, "Service"],
    }),
  }),
});

export const { 
  useGetAllServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation
} = serviceApi;
